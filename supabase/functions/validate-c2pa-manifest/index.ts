import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * C2PA v2.2 Manifest Validator Edge Function
 * 
 * Performs binary scanning for JUMBF boxes in JPEG (APP11), PNG (caBX),
 * and MP4/MOV (ISO BMFF UUID box). When found, parses the JUMBF structure
 * to extract description boxes, assertion store, claim (CBOR), and
 * claim signature (COSE Sign1).
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const C2PA_JUMBF_UUID = new Uint8Array([
  0x63, 0x32, 0x70, 0x61, 0x00, 0x11, 0x00, 0x10,
  0x80, 0x00, 0x00, 0xAA, 0x00, 0x38, 0x9B, 0x71
]);

const C2PA_VIDEO_UUID = new Uint8Array([
  0xd8, 0xfe, 0xc3, 0xd6, 0x1b, 0x0e, 0x48, 0x3c,
  0x92, 0x97, 0x58, 0xb3, 0xda, 0xbb, 0x22, 0x3b
]);

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface C2PAIngredientInfo {
  title: string;
  format: string;
  instanceID: string;
  relationship: string;
  hash?: string;
}

interface C2PAResult {
  hasC2PA: boolean;
  manifestFound: boolean;
  claimGenerator: string | null;
  claimGeneratorInfo?: { name: string; version: string }[];
  assertions: string[];
  ingredients: C2PAIngredientInfo[];
  trustStatus: 'trusted' | 'untrusted' | 'self-signed' | 'unknown';
  trustReason?: string;
  specVersion?: string;
  format: string;
  rawBoxCount: number;
  claimHash?: string;
  signatureVerified?: boolean;
  error?: string;
}

// ─── Binary Helpers ──────────────────────────────────────────────────────────

function readUint16BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 8) | data[offset + 1];
}

function readUint32BE(data: Uint8Array, offset: number): number {
  return ((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

function matchBytes(data: Uint8Array, offset: number, pattern: Uint8Array | number[]): boolean {
  if (offset + pattern.length > data.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (data[offset + i] !== pattern[i]) return false;
  }
  return true;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── CBOR Decoder (subset needed for C2PA claims) ────────────────────────────

interface CBORDecodeResult {
  value: unknown;
  bytesRead: number;
}

function decodeCBOR(data: Uint8Array, offset = 0): CBORDecodeResult {
  if (offset >= data.length) {
    return { value: null, bytesRead: 0 };
  }

  const initial = data[offset];
  const majorType = initial >> 5;
  const additionalInfo = initial & 0x1F;

  let value: number;
  let headerLen: number;

  if (additionalInfo < 24) {
    value = additionalInfo;
    headerLen = 1;
  } else if (additionalInfo === 24) {
    value = data[offset + 1];
    headerLen = 2;
  } else if (additionalInfo === 25) {
    value = readUint16BE(data, offset + 1);
    headerLen = 3;
  } else if (additionalInfo === 26) {
    value = readUint32BE(data, offset + 1);
    headerLen = 5;
  } else if (additionalInfo === 27) {
    // 8-byte integer — read as number (may lose precision for very large values)
    value = 0;
    for (let i = 0; i < 8; i++) {
      value = value * 256 + data[offset + 1 + i];
    }
    headerLen = 9;
  } else if (additionalInfo === 31) {
    // Indefinite length
    headerLen = 1;
    value = -1;
  } else {
    return { value: null, bytesRead: 1 };
  }

  switch (majorType) {
    case 0: // Unsigned integer
      return { value, bytesRead: headerLen };

    case 1: // Negative integer
      return { value: -1 - value, bytesRead: headerLen };

    case 2: { // Byte string
      const bytes = data.slice(offset + headerLen, offset + headerLen + value);
      return { value: bytes, bytesRead: headerLen + value };
    }

    case 3: { // Text string
      const textBytes = data.slice(offset + headerLen, offset + headerLen + value);
      const text = new TextDecoder().decode(textBytes);
      return { value: text, bytesRead: headerLen + value };
    }

    case 4: { // Array
      if (value === -1) {
        // Indefinite length array
        const arr: unknown[] = [];
        let pos = offset + headerLen;
        while (pos < data.length && data[pos] !== 0xFF) {
          const item = decodeCBOR(data, pos);
          arr.push(item.value);
          pos += item.bytesRead;
        }
        return { value: arr, bytesRead: pos - offset + 1 };
      }
      const arr: unknown[] = [];
      let pos = offset + headerLen;
      for (let i = 0; i < value; i++) {
        const item = decodeCBOR(data, pos);
        arr.push(item.value);
        pos += item.bytesRead;
      }
      return { value: arr, bytesRead: pos - offset };
    }

    case 5: { // Map
      if (value === -1) {
        // Indefinite length map
        const map: Record<string, unknown> = {};
        let pos = offset + headerLen;
        while (pos < data.length && data[pos] !== 0xFF) {
          const key = decodeCBOR(data, pos);
          pos += key.bytesRead;
          const val = decodeCBOR(data, pos);
          pos += val.bytesRead;
          map[String(key.value)] = val.value;
        }
        return { value: map, bytesRead: pos - offset + 1 };
      }
      const map: Record<string, unknown> = {};
      let pos = offset + headerLen;
      for (let i = 0; i < value; i++) {
        const key = decodeCBOR(data, pos);
        pos += key.bytesRead;
        const val = decodeCBOR(data, pos);
        pos += val.bytesRead;
        map[String(key.value)] = val.value;
      }
      return { value: map, bytesRead: pos - offset };
    }

    case 6: { // Tag
      const content = decodeCBOR(data, offset + headerLen);
      // For COSE Sign1 (tag 18), return the tagged content
      return {
        value: { _tag: value, _value: content.value },
        bytesRead: headerLen + content.bytesRead,
      };
    }

    case 7: { // Simple/float
      if (additionalInfo === 20) return { value: false, bytesRead: 1 };
      if (additionalInfo === 21) return { value: true, bytesRead: 1 };
      if (additionalInfo === 22) return { value: null, bytesRead: 1 };
      if (additionalInfo === 23) return { value: undefined, bytesRead: 1 };
      if (additionalInfo === 25) {
        // Float16 — simplified decode
        return { value: 0, bytesRead: 3 };
      }
      if (additionalInfo === 26) {
        // Float32
        const buf = new ArrayBuffer(4);
        const view = new DataView(buf);
        for (let i = 0; i < 4; i++) view.setUint8(i, data[offset + 1 + i]);
        return { value: view.getFloat32(0), bytesRead: 5 };
      }
      if (additionalInfo === 27) {
        // Float64
        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        for (let i = 0; i < 8; i++) view.setUint8(i, data[offset + 1 + i]);
        return { value: view.getFloat64(0), bytesRead: 9 };
      }
      return { value: null, bytesRead: 1 };
    }

    default:
      return { value: null, bytesRead: 1 };
  }
}

function safeCBORDecode(data: Uint8Array): unknown {
  try {
    const result = decodeCBOR(data, 0);
    return result.value;
  } catch (e) {
    console.warn('[validate-c2pa] CBOR decode failed:', e);
    return null;
  }
}

// ─── JUMBF Parser ────────────────────────────────────────────────────────────

interface JUMBFBox {
  type: string;       // 4-char box type (e.g., "jumb", "jumd", "c2cl")
  label?: string;     // label from description box
  uuid?: Uint8Array;  // UUID from description box
  data: Uint8Array;   // raw box data (excluding LBox + TBox header)
  children: JUMBFBox[];
  offset: number;
  size: number;
}

/**
 * Parse JUMBF boxes from raw bytes.
 * Returns a tree of JUMBFBox nodes.
 */
function parseJUMBFBoxes(data: Uint8Array, start = 0, end?: number): JUMBFBox[] {
  const boxes: JUMBFBox[] = [];
  const maxEnd = end ?? data.length;
  let offset = start;

  while (offset < maxEnd - 8) {
    let boxSize = readUint32BE(data, offset);
    const boxType = String.fromCharCode(
      data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]
    );

    // Handle box size edge cases
    if (boxSize === 0) {
      boxSize = maxEnd - offset; // box extends to end
    }
    if (boxSize < 8 || offset + boxSize > maxEnd) break;

    const boxDataStart = offset + 8;
    const boxDataEnd = offset + boxSize;
    const boxData = data.subarray(boxDataStart, boxDataEnd);

    const box: JUMBFBox = {
      type: boxType,
      data: boxData,
      children: [],
      offset,
      size: boxSize,
    };

    // If superbox ("jumb"), parse children recursively
    if (boxType === 'jumb') {
      box.children = parseJUMBFBoxes(data, boxDataStart, boxDataEnd);

      // Extract label from first child if it's a description box (jumd)
      const descChild = box.children.find(c => c.type === 'jumd');
      if (descChild) {
        const parsed = parseDescriptionBox(descChild.data);
        box.label = parsed.label;
        box.uuid = parsed.uuid;
      }
    }

    // Parse description box inline
    if (boxType === 'jumd') {
      const parsed = parseDescriptionBox(boxData);
      box.label = parsed.label;
      box.uuid = parsed.uuid;
    }

    boxes.push(box);
    offset += boxSize;
  }

  return boxes;
}

/**
 * Parse a JUMD (description) box data.
 * Structure: UUID(16) + toggles(1) + label(null-terminated, if toggle bit 0 set)
 */
function parseDescriptionBox(data: Uint8Array): { uuid?: Uint8Array; label?: string } {
  if (data.length < 17) {
    // No UUID — try legacy format: toggles(1) + label
    if (data.length >= 2) {
      const toggles = data[0];
      if (toggles & 0x01) {
        const labelEnd = data.indexOf(0, 1);
        const label = new TextDecoder().decode(data.subarray(1, labelEnd === -1 ? data.length : labelEnd));
        return { label };
      }
    }
    return {};
  }

  const uuid = data.subarray(0, 16);
  const toggles = data[16];
  let label: string | undefined;

  if (toggles & 0x01) {
    // Label present
    const labelStart = 17;
    let labelEnd = labelStart;
    while (labelEnd < data.length && data[labelEnd] !== 0) labelEnd++;
    label = new TextDecoder().decode(data.subarray(labelStart, labelEnd));
  }

  return { uuid, label };
}

// ─── Claim Extractor ─────────────────────────────────────────────────────────

interface ParsedClaim {
  claimGenerator?: string;
  claimGeneratorInfo?: { name: string; version: string }[];
  assertions: string[];
  ingredients: C2PAIngredientInfo[];
  instanceId?: string;
  specVersion?: string;
  hashData?: { alg: string; hash: string };
}

/**
 * Extract structured claim data from a parsed JUMBF tree.
 */
function extractClaimFromJUMBF(boxes: JUMBFBox[]): ParsedClaim {
  const claim: ParsedClaim = {
    assertions: [],
    ingredients: [],
  };

  // Find the top-level c2pa superbox
  const c2paBox = boxes.find(b => b.label === 'c2pa') || boxes.find(b => b.type === 'jumb');
  if (!c2paBox) return claim;

  // Find assertion store
  const assertionStore = c2paBox.children.find(b => b.label === 'c2pa.assertions');
  if (assertionStore) {
    for (const assertionBox of assertionStore.children) {
      if (assertionBox.type === 'jumb' && assertionBox.label) {
        claim.assertions.push(assertionBox.label);

        // Try to parse ingredient assertions
        if (assertionBox.label === 'c2pa.ingredient' || assertionBox.label.startsWith('c2pa.ingredient')) {
          const ingredient = parseIngredientFromBox(assertionBox);
          if (ingredient) claim.ingredients.push(ingredient);
        }

        // Extract c2pa.hash.data assertion
        if (assertionBox.label === 'c2pa.hash.data') {
          const hashInfo = parseHashDataFromBox(assertionBox);
          if (hashInfo) claim.hashData = hashInfo;
        }
      }
    }
  }

  // Find claim box and try CBOR decode
  const claimBox = c2paBox.children.find(b => b.label === 'c2pa.claim');
  if (claimBox) {
    // Look for c2cl content box inside
    const c2clBox = claimBox.children.find(b => b.type === 'c2cl');
    const contentData = c2clBox ? c2clBox.data : claimBox.data;

    const decoded = safeCBORDecode(contentData);
    if (decoded && typeof decoded === 'object') {
      extractFieldsFromDecodedClaim(decoded as Record<string, unknown>, claim);
    } else {
      // Fallback: try to parse as JSON text
      try {
        const text = new TextDecoder().decode(contentData);
        const json = JSON.parse(text);
        extractFieldsFromDecodedClaim(json, claim);
      } catch {
        // Not parseable — try string scanning
        extractFieldsFromText(contentData, claim);
      }
    }
  } else {
    // No labeled claim box — scan all content for claim data
    for (const child of c2paBox.children) {
      if (child.type === 'c2cl') {
        const decoded = safeCBORDecode(child.data);
        if (decoded && typeof decoded === 'object') {
          extractFieldsFromDecodedClaim(decoded as Record<string, unknown>, claim);
        } else {
          try {
            const text = new TextDecoder().decode(child.data);
            const json = JSON.parse(text);
            extractFieldsFromDecodedClaim(json, claim);
          } catch {
            extractFieldsFromText(child.data, claim);
          }
        }
        break;
      }
    }
  }

  // Find claim signature
  const sigBox = c2paBox.children.find(b => b.label === 'c2pa.signature');
  if (sigBox) {
    const c2csBox = sigBox.children.find(b => b.type === 'c2cs');
    if (c2csBox) {
      // Try CBOR decode of COSE Sign1 (tag 18)
      const decoded = safeCBORDecode(c2csBox.data);
      if (decoded && typeof decoded === 'object' && (decoded as Record<string, unknown>)._tag === 18) {
        claim.specVersion = '2.2'; // Has proper COSE Sign1 structure
      }
    }
  }

  return claim;
}

function extractFieldsFromDecodedClaim(obj: Record<string, unknown>, claim: ParsedClaim): void {
  // claim_generator
  if (typeof obj.claim_generator === 'string') {
    claim.claimGenerator = obj.claim_generator;
  }

  // claim_generator_info
  if (Array.isArray(obj.claim_generator_info)) {
    claim.claimGeneratorInfo = obj.claim_generator_info
      .filter((i: unknown) => typeof i === 'object' && i !== null)
      .map((i: unknown) => {
        const info = i as Record<string, unknown>;
        return {
          name: String(info.name || ''),
          version: String(info.version || ''),
        };
      });
  }

  // instance_id
  if (typeof obj.instance_id === 'string') {
    claim.instanceId = obj.instance_id;
  }

  // assertions
  if (Array.isArray(obj.assertions)) {
    for (const a of obj.assertions) {
      if (typeof a === 'string') {
        if (!claim.assertions.includes(a)) claim.assertions.push(a);
      } else if (typeof a === 'object' && a !== null) {
        const label = (a as Record<string, unknown>).label || (a as Record<string, unknown>).url;
        if (typeof label === 'string' && !claim.assertions.includes(label)) {
          claim.assertions.push(label);
        }
      }
    }
  }

  // ingredients
  if (Array.isArray(obj.ingredients)) {
    for (const ing of obj.ingredients) {
      if (typeof ing === 'object' && ing !== null) {
        const i = ing as Record<string, unknown>;
        claim.ingredients.push({
          title: String(i.dc_title || i.title || 'Unknown'),
          format: String(i.dc_format || i.format || 'application/octet-stream'),
          instanceID: String(i.instanceID || i.instance_id || ''),
          relationship: String(i.relationship || 'parentOf'),
          hash: typeof i.hash === 'string' ? i.hash : undefined,
        });
      }
    }
  }

  // asset_hash (TSMO-specific field for pre-embedding hash)
  if (typeof obj.asset_hash === 'string' && !claim.hashData) {
    claim.hashData = { alg: 'sha256', hash: obj.asset_hash };
  }

  // Extract c2pa.hash.data from inline assertions
  if (Array.isArray(obj.assertions)) {
    for (const a of obj.assertions) {
      if (typeof a === 'object' && a !== null) {
        const aObj = a as Record<string, unknown>;
        if (aObj.label === 'c2pa.hash.data' && typeof aObj.data === 'object' && aObj.data !== null) {
          const hd = aObj.data as Record<string, unknown>;
          if (typeof hd.hash === 'string') {
            claim.hashData = { alg: String(hd.alg || 'sha256'), hash: hd.hash };
          }
        }
      }
    }
  }

  // @context or spec version
  if (typeof obj['@context'] === 'string') {
    if (obj['@context'].includes('2.2') || obj['@context'].includes('2.1')) {
      claim.specVersion = '2.2';
    }
  }
}

function parseIngredientFromBox(box: JUMBFBox): C2PAIngredientInfo | null {
  // Find content box (cbor type)
  const contentBox = box.children.find(b => b.type === 'cbor') || box.children[1];
  if (!contentBox) return null;

  const decoded = safeCBORDecode(contentBox.data);
  if (decoded && typeof decoded === 'object') {
    const obj = decoded as Record<string, unknown>;
    return {
      title: String(obj.dc_title || obj.title || 'Unknown'),
      format: String(obj.dc_format || obj.format || 'application/octet-stream'),
      instanceID: String(obj.instanceID || obj.instance_id || ''),
      relationship: String(obj.relationship || 'parentOf'),
      hash: typeof obj.hash === 'string' ? obj.hash :
            typeof (obj.data as Record<string, unknown>)?.hash === 'string' ?
            (obj.data as Record<string, unknown>).hash as string : undefined,
    };
  }

  // Try JSON fallback
  try {
    const text = new TextDecoder().decode(contentBox.data);
    const json = JSON.parse(text);
    return {
      title: String(json.dc_title || json.title || 'Unknown'),
      format: String(json.dc_format || json.format || 'application/octet-stream'),
      instanceID: String(json.instanceID || json.instance_id || ''),
      relationship: String(json.relationship || 'parentOf'),
      hash: json.hash || json.data?.hash,
    };
  } catch {
    return null;
  }
}

/**
 * Parse c2pa.hash.data assertion from a JUMBF assertion box.
 */
function parseHashDataFromBox(box: JUMBFBox): { alg: string; hash: string } | null {
  const contentBox = box.children.find(b => b.type === 'cbor') || box.children[1];
  if (!contentBox) return null;

  // Try CBOR decode
  const decoded = safeCBORDecode(contentBox.data);
  if (decoded && typeof decoded === 'object') {
    const obj = decoded as Record<string, unknown>;
    if (typeof obj.hash === 'string') {
      return { alg: String(obj.alg || 'sha256'), hash: obj.hash };
    }
  }

  // Try JSON fallback
  try {
    const text = new TextDecoder().decode(contentBox.data);
    const json = JSON.parse(text);
    if (typeof json.hash === 'string') {
      return { alg: String(json.alg || 'sha256'), hash: json.hash };
    }
  } catch { /* ignore */ }

  return null;
}

/**
 * Fallback: extract fields from raw text scanning (for non-CBOR manifests).
 */
function extractFieldsFromText(data: Uint8Array, claim: ParsedClaim): void {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(data);

  // Claim generator detection
  const generatorPrefixes = ['adobe', 'photoshop', 'lightroom', 'c2pa', 'truepic', 'microsoft',
    'google', 'samsung', 'nikon', 'canon', 'sony', 'tsmo', 'TSMO'];
  const lower = text.toLowerCase();
  for (const prefix of generatorPrefixes) {
    const idx = lower.indexOf(prefix.toLowerCase());
    if (idx >= 0) {
      let end = idx;
      while (end < text.length && text.charCodeAt(end) >= 32 && text.charCodeAt(end) < 127) end++;
      if (end - idx > 3) {
        claim.claimGenerator = text.slice(idx, Math.min(end, idx + 100));
        break;
      }
    }
  }

  // Assertion label detection
  const assertionLabels = ['c2pa.actions', 'c2pa.hash.data', 'c2pa.thumbnail',
    'stds.schema-org.CreativeWork', 'c2pa.ingredient'];
  for (const label of assertionLabels) {
    if (text.includes(label) && !claim.assertions.includes(label)) {
      claim.assertions.push(label);
    }
  }
}

// ─── Format-Specific JUMBF Extractors ────────────────────────────────────────

function extractJUMBFFromJPEG(data: Uint8Array): { jumbfData: Uint8Array | null; format: string } {
  if (data[0] !== 0xFF || data[1] !== 0xD8) {
    return { jumbfData: null, format: 'jpeg' };
  }

  let offset = 2;
  while (offset < data.length - 4) {
    if (data[offset] !== 0xFF) { offset++; continue; }
    const marker = data[offset + 1];
    if (marker === 0xDA || marker === 0xD9) break;
    if (marker === 0xFF || marker === 0x00 || (marker >= 0xD0 && marker <= 0xD7)) {
      offset += 2;
      continue;
    }

    const segLength = readUint16BE(data, offset + 2);

    // APP11 (0xEB) — C2PA JUMBF container
    if (marker === 0xEB) {
      const segStart = offset + 4;
      // Skip the 12-byte JUMBF envelope (CI + En + Z + LBox)
      const jumbfStart = segStart + 12;
      const segEnd = offset + 2 + segLength;
      if (jumbfStart < segEnd) {
        return { jumbfData: data.subarray(jumbfStart, segEnd), format: 'jpeg' };
      }
    }

    offset += 2 + segLength;
  }

  return { jumbfData: null, format: 'jpeg' };
}

function extractJUMBFFromPNG(data: Uint8Array): { jumbfData: Uint8Array | null; format: string } {
  if (!matchBytes(data, 0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return { jumbfData: null, format: 'png' };
  }

  let offset = 8;
  const caBX = [0x63, 0x61, 0x42, 0x58];

  while (offset + 8 <= data.length) {
    const chunkLength = readUint32BE(data, offset);
    const chunkTypeOffset = offset + 4;

    if (matchBytes(data, chunkTypeOffset, caBX)) {
      const chunkDataStart = chunkTypeOffset + 4;
      return { jumbfData: data.subarray(chunkDataStart, chunkDataStart + chunkLength), format: 'png' };
    }

    if (matchBytes(data, chunkTypeOffset, [0x49, 0x45, 0x4E, 0x44])) break;
    offset += 4 + 4 + chunkLength + 4;
  }

  return { jumbfData: null, format: 'png' };
}

function extractJUMBFFromVideo(data: Uint8Array): { jumbfData: Uint8Array | null; format: string } {
  let offset = 0;
  while (offset < data.length - 8) {
    const boxSize = readUint32BE(data, offset);
    const boxType = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]);

    if (boxSize < 8 || offset + boxSize > data.length) break;

    if (boxType === 'uuid' && boxSize >= 24) {
      if (matchBytes(data, offset + 8, C2PA_VIDEO_UUID)) {
        return { jumbfData: data.subarray(offset + 24, offset + boxSize), format: 'video' };
      }
    }

    offset += boxSize;
  }

  return { jumbfData: null, format: 'video' };
}

// ─── Main Scanner ────────────────────────────────────────────────────────────

function detectFormat(bytes: Uint8Array): string {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  // ISO BMFF: ftyp box at offset 4
  if (bytes.length >= 12 && String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === 'ftyp') return 'video';
  return 'unknown';
}

function scanForC2PA(data: Uint8Array): C2PAResult {
  const format = detectFormat(data);

  const result: C2PAResult = {
    hasC2PA: false,
    manifestFound: false,
    claimGenerator: null,
    assertions: [],
    ingredients: [],
    trustStatus: 'unknown',
    format,
    rawBoxCount: 0,
  };

  if (format === 'webp' || format === 'unknown') {
    if (format === 'unknown') result.error = 'Unsupported format';
    return result;
  }

  // Extract raw JUMBF data from container format
  let extracted: { jumbfData: Uint8Array | null; format: string };
  switch (format) {
    case 'jpeg':
      extracted = extractJUMBFFromJPEG(data);
      break;
    case 'png':
      extracted = extractJUMBFFromPNG(data);
      break;
    case 'video':
      extracted = extractJUMBFFromVideo(data);
      break;
    default:
      return result;
  }

  if (!extracted.jumbfData) {
    return result;
  }

  result.hasC2PA = true;
  result.manifestFound = true;

  // Parse JUMBF box tree
  try {
    const boxes = parseJUMBFBoxes(extracted.jumbfData);
    result.rawBoxCount = countBoxes(boxes);

    // Extract structured claim data
    const parsed = extractClaimFromJUMBF(boxes);

    result.claimGenerator = parsed.claimGenerator || null;
    result.claimGeneratorInfo = parsed.claimGeneratorInfo;
    result.assertions = parsed.assertions;
    result.ingredients = parsed.ingredients;
    result.specVersion = parsed.specVersion;

    // Include hash binding data
    if (parsed.hashData) {
      result.claimHash = parsed.hashData.hash;
    }

    // Determine trust status from signature structure
    if (parsed.specVersion === '2.2') {
      result.trustStatus = 'self-signed'; // Default until trust list verification
      result.trustReason = 'Manifest has valid COSE Sign1 structure. Trust list verification pending.';
    }

    console.log(`[validate-c2pa] Parsed ${boxes.length} top-level boxes, ${result.assertions.length} assertions, ${result.ingredients.length} ingredients, hashBound: ${!!parsed.hashData}`);
  } catch (e) {
    console.warn('[validate-c2pa] JUMBF parse error, falling back to text scan:', e);
    // Fallback: text-based scanning
    const fallbackClaim: ParsedClaim = { assertions: [], ingredients: [] };
    extractFieldsFromText(extracted.jumbfData, fallbackClaim);
    result.claimGenerator = fallbackClaim.claimGenerator || null;
    result.assertions = fallbackClaim.assertions;
  }

  return result;
}

function countBoxes(boxes: JUMBFBox[]): number {
  let count = boxes.length;
  for (const box of boxes) {
    count += countBoxes(box.children);
  }
  return count;
}

// ─── Edge Function Handler ───────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Expected multipart/form-data with an image file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[validate-c2pa-manifest] Scanning file: ${file.name} (${file.size} bytes, ${file.type})`);

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const result = scanForC2PA(bytes);

    console.log(`[validate-c2pa-manifest] Result for ${file.name}:`, {
      hasC2PA: result.hasC2PA,
      format: result.format,
      rawBoxCount: result.rawBoxCount,
      claimGenerator: result.claimGenerator,
      assertions: result.assertions,
      ingredients: result.ingredients.length,
      specVersion: result.specVersion,
    });

    return new Response(
      JSON.stringify({
        ...result,
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[validate-c2pa-manifest] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
