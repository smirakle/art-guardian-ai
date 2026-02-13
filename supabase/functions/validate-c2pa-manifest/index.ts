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

// ─── Diagnostic Logging ──────────────────────────────────────────────────────

function logBoxTree(boxes: JUMBFBox[], prefix = ''): void {
  for (const box of boxes) {
    const labelStr = box.label ? ` [label="${box.label}"]` : '';
    console.log(`[validate-c2pa] ${prefix}${box.type}${labelStr} (${box.size} bytes, ${box.children.length} children)`);
    if (box.children.length > 0) {
      logBoxTree(box.children, prefix + '  ');
    }
  }
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
  title?: string;
  dcFormat?: string;
  signatureRef?: string;
}

/**
 * Find the manifest box that contains c2pa.assertions, c2pa.claim, c2pa.signature.
 * Handles both flat (TSMO) and nested (real-world v2.2) structures.
 */
function findManifestBox(c2paBox: JUMBFBox): JUMBFBox {
  // Strategy 1: Direct children have c2pa.assertions (TSMO flat structure)
  const directAssertions = c2paBox.children.find(b => b.label === 'c2pa.assertions');
  if (directAssertions) {
    console.log('[validate-c2pa] Found flat manifest structure (TSMO-style)');
    return c2paBox;
  }

  // Strategy 2: Look one level deeper for urn:c2pa: manifest boxes (real-world v2.2)
  for (const child of c2paBox.children) {
    if (child.type === 'jumb') {
      const nestedAssertions = child.children.find(b => b.label === 'c2pa.assertions');
      if (nestedAssertions) {
        console.log(`[validate-c2pa] Found nested manifest: ${child.label || '(unlabeled)'}`);
        return child;
      }
    }
  }

  // Strategy 3: Search all jumb grandchildren (handles deep nesting)
  for (const child of c2paBox.children) {
    if (child.type === 'jumb') {
      for (const grandchild of child.children) {
        if (grandchild.type === 'jumb') {
          const deepAssertions = grandchild.children.find(b => b.label === 'c2pa.assertions');
          if (deepAssertions) {
            console.log(`[validate-c2pa] Found deeply nested manifest: ${grandchild.label || '(unlabeled)'}`);
            return grandchild;
          }
        }
      }
    }
  }

  // Fallback: return the c2pa box itself
  console.log('[validate-c2pa] No manifest sub-box found, using c2pa box directly');
  return c2paBox;
}

/**
 * Enhanced CBOR decode with multiple strategies for real-world data.
 */
function robustCBORDecode(data: Uint8Array): unknown {
  // Strategy 1: Direct decode from offset 0
  const direct = safeCBORDecode(data);
  if (direct && typeof direct === 'object') return direct;

  // Strategy 2: Scan first 64 bytes for CBOR map markers and try from each
  const scanLimit = Math.min(64, data.length);
  for (let i = 1; i < scanLimit; i++) {
    const byte = data[i];
    // Small definite maps: 0xA0-0xB7, larger maps: 0xB8 (1-byte count), 0xB9 (2-byte count)
    if ((byte >= 0xA1 && byte <= 0xB7) || byte === 0xB8 || byte === 0xB9 || byte === 0xBA) {
      try {
        const result = decodeCBOR(data, i);
        if (result.value && typeof result.value === 'object' && result.bytesRead > 4) {
          console.log(`[validate-c2pa] CBOR decoded from offset ${i}`);
          return result.value;
        }
      } catch { /* try next offset */ }
    }
  }

  // Strategy 3: JSON fallback
  try {
    const text = new TextDecoder().decode(data);
    return JSON.parse(text);
  } catch { /* not JSON either */ }

  return null;
}

/**
 * Extract structured claim data from a parsed JUMBF tree.
 * Handles both TSMO flat and real-world C2PA v2.2 nested structures.
 */
function extractClaimFromJUMBF(boxes: JUMBFBox[]): ParsedClaim {
  const claim: ParsedClaim = {
    assertions: [],
    ingredients: [],
  };

  // Log the full box tree for diagnostics
  console.log('[validate-c2pa] === Box Tree ===');
  logBoxTree(boxes);

  // Find the top-level c2pa superbox
  const c2paBox = boxes.find(b => b.label === 'c2pa') || boxes.find(b => b.type === 'jumb');
  if (!c2paBox) return claim;

  // Find the actual manifest box (handles nesting)
  const manifestBox = findManifestBox(c2paBox);

  // Find assertion store
  const assertionStore = manifestBox.children.find(b => b.label === 'c2pa.assertions');
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

  // Find claim box and decode
  const claimBox = manifestBox.children.find(b =>
    b.label === 'c2pa.claim' || b.label === 'c2pa.claim.v2' ||
    (b.label && b.label.startsWith('c2pa.claim'))
  );
  if (claimBox) {
    // Look for c2cl or cbor content box inside
    const contentBox = claimBox.children.find(b => b.type === 'c2cl') ||
                       claimBox.children.find(b => b.type === 'cbor') ||
                       claimBox.children.find(b => b.type !== 'jumd' && b.type !== 'jumb');
    const contentData = contentBox ? contentBox.data : claimBox.data;

    console.log(`[validate-c2pa] Claim content: ${contentData.length} bytes, first 32: ${bytesToHex(contentData.subarray(0, 32))}`);

    const decoded = robustCBORDecode(contentData);
    // Debug logging: show decoded CBOR keys and preview
    if (decoded && typeof decoded === 'object') {
      const keys = Object.keys(decoded as Record<string, unknown>);
      console.log(`[validate-c2pa] CBOR decoded successfully. Type: ${typeof decoded}, Keys: [${keys.join(', ')}]`);
      const preview = JSON.stringify(decoded, (_k, v) => v instanceof Uint8Array ? `<bytes:${v.length}>` : v);
      console.log(`[validate-c2pa] CBOR preview: ${preview?.substring(0, 500)}`);
      extractFieldsFromDecodedClaim(decoded as Record<string, unknown>, claim);
    } else {
      console.log(`[validate-c2pa] CBOR decode returned: ${decoded === null ? 'null' : typeof decoded}`);
      // Fallback: try string scanning
      extractFieldsFromText(contentData, claim);
    }
  } else {
    // No labeled claim box — scan all content boxes
    for (const child of manifestBox.children) {
      if (child.type === 'c2cl') {
        const decoded = robustCBORDecode(child.data);
        if (decoded && typeof decoded === 'object') {
          extractFieldsFromDecodedClaim(decoded as Record<string, unknown>, claim);
        } else {
          extractFieldsFromText(child.data, claim);
        }
        break;
      }
    }
  }

  // Find claim signature
  const sigBox = manifestBox.children.find(b => b.label === 'c2pa.signature');
  if (sigBox) {
    const sigContentBox = sigBox.children.find(b => b.type === 'c2cs') ||
                          sigBox.children.find(b => b.type === 'cbor') ||
                          sigBox.children.find(b => b.type !== 'jumd' && b.type !== 'jumb');
    if (sigContentBox) {
      const decoded = safeCBORDecode(sigContentBox.data);
      if (decoded && typeof decoded === 'object' && (decoded as Record<string, unknown>)._tag === 18) {
        claim.specVersion = '2.2';
      }
    }
  }

  return claim;
}

function extractFieldsFromDecodedClaim(obj: Record<string, unknown>, claim: ParsedClaim): void {
  // claim_generator (check snake_case, camelCase, kebab-case)
  const claimGen = obj.claim_generator || obj.claimGenerator || obj['claim-generator'];
  if (typeof claimGen === 'string') {
    claim.claimGenerator = claimGen;
  }

  // claim_generator_info (check variants)
  const claimGenInfo = obj.claim_generator_info || obj.claimGeneratorInfo || obj['claim-generator-info'];
  if (Array.isArray(claimGenInfo)) {
    claim.claimGeneratorInfo = claimGenInfo
      .filter((i: unknown) => typeof i === 'object' && i !== null)
      .map((i: unknown) => {
        const info = i as Record<string, unknown>;
        return {
          name: String(info.name || ''),
          version: String(info.version || ''),
        };
      });
  }

  // instance_id (check snake_case and camelCase)
  const instId = obj.instance_id || obj.instanceID || obj.instanceId;
  if (typeof instId === 'string') {
    claim.instanceId = instId as string;
  }

  // dc:title
  const dcTitle = obj['dc:title'] || obj.dc_title || obj.title;
  if (typeof dcTitle === 'string') {
    claim.title = dcTitle;
  }

  // dc:format
  const dcFormat = obj['dc:format'] || obj.dc_format || obj.format;
  if (typeof dcFormat === 'string') {
    claim.dcFormat = dcFormat;
  }

  // signature reference
  const sigRef = obj.signature || obj.signatureRef || obj['signature_ref'];
  if (typeof sigRef === 'string') {
    claim.signatureRef = sigRef;
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
  // Find content box: try 'cbor' type, then any non-jumd child, then index [1]
  const contentBox = box.children.find(b => b.type === 'cbor') ||
                     box.children.find(b => b.type !== 'jumd' && b.type !== 'jumb') ||
                     box.children[1];
  if (!contentBox) return null;

  const decoded = robustCBORDecode(contentBox.data);
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

  return null;
}

/**
 * Parse c2pa.hash.data assertion from a JUMBF assertion box.
 */
function parseHashDataFromBox(box: JUMBFBox): { alg: string; hash: string } | null {
  const contentBox = box.children.find(b => b.type === 'cbor') ||
                     box.children.find(b => b.type !== 'jumd' && b.type !== 'jumb') ||
                     box.children[1];
  if (!contentBox) return null;

  const decoded = robustCBORDecode(contentBox.data);
  if (decoded && typeof decoded === 'object') {
    const obj = decoded as Record<string, unknown>;
    if (typeof obj.hash === 'string') {
      return { alg: String(obj.alg || 'sha256'), hash: obj.hash };
    }
    // Handle exclusions array format used in real C2PA
    if (Array.isArray(obj.exclusions) || obj.name || obj.alg) {
      const hashBytes = obj.hash;
      if (hashBytes instanceof Uint8Array) {
        return { alg: String(obj.alg || 'sha256'), hash: bytesToHex(hashBytes) };
      }
    }
  }

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

function extractJUMBFFromJPEG(data: Uint8Array): { jumbfData: Uint8Array | null; format: string; segmentCount: number } {
  if (data[0] !== 0xFF || data[1] !== 0xD8) {
    return { jumbfData: null, format: 'jpeg', segmentCount: 0 };
  }

  // Collect all APP11 segments for multi-segment reassembly
  const app11Segments: { en: number; z: number; payload: Uint8Array }[] = [];
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
    const segEnd = offset + 2 + segLength;

    // APP11 (0xEB) — C2PA JUMBF container per ISO 19566-5
    if (marker === 0xEB && segLength > 10) {
      const segStart = offset + 4; // past marker + length

      // C2PA APP11 header: CI(2) = 0x4A50 "JP" + En(2) + Z(4) = 8 bytes total
      const ci = readUint16BE(data, segStart);
      if (ci === 0x4A50) { // "JP" Common Identifier
        const en = readUint16BE(data, segStart + 2); // box instance number
        const z = readUint32BE(data, segStart + 4);   // packet sequence number
        const jumbfStart = segStart + 8; // 8-byte header, NOT 12
        if (jumbfStart < segEnd) {
          app11Segments.push({
            en,
            z,
            payload: data.subarray(jumbfStart, segEnd),
          });
        }
      } else {
        // Fallback: try alternate offsets (some encoders use different padding)
        // Try offset 4 (legacy CI=4 bytes), offset 6, offset 8, offset 10, offset 12
        for (const skip of [4, 6, 10, 12]) {
          const tryStart = segStart + skip;
          if (tryStart < segEnd && segEnd - tryStart >= 8) {
            const testSize = readUint32BE(data, tryStart);
            const testType = String.fromCharCode(
              data[tryStart + 4], data[tryStart + 5], data[tryStart + 6], data[tryStart + 7]
            );
            if (testType === 'jumb' || testType === 'jumd' || testSize > 8) {
              app11Segments.push({
                en: 1,
                z: 0,
                payload: data.subarray(tryStart, segEnd),
              });
              break;
            }
          }
        }
      }
    }

    offset += 2 + segLength;
  }

  if (app11Segments.length === 0) {
    return { jumbfData: null, format: 'jpeg', segmentCount: 0 };
  }

  // Sort by packet sequence number and reassemble
  app11Segments.sort((a, b) => a.z - b.z);

  if (app11Segments.length === 1) {
    const seg = app11Segments[0];
    console.log(`[validate-c2pa] JPEG: 1 APP11 segment, ${seg.payload.length} bytes, first 64: ${bytesToHex(seg.payload.subarray(0, 64))}`);
    return { jumbfData: seg.payload, format: 'jpeg', segmentCount: 1 };
  }

  // Multi-segment: concatenate payloads
  const totalLen = app11Segments.reduce((s, seg) => s + seg.payload.length, 0);
  const reassembled = new Uint8Array(totalLen);
  let pos = 0;
  for (const seg of app11Segments) {
    reassembled.set(seg.payload, pos);
    pos += seg.payload.length;
  }
  console.log(`[validate-c2pa] JPEG: ${app11Segments.length} APP11 segments reassembled, ${totalLen} bytes, first 64: ${bytesToHex(reassembled.subarray(0, 64))}`);
  return { jumbfData: reassembled, format: 'jpeg', segmentCount: app11Segments.length };
}

function extractJUMBFFromPNG(data: Uint8Array): { jumbfData: Uint8Array | null; format: string; segmentCount: number } {
  if (!matchBytes(data, 0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return { jumbfData: null, format: 'png', segmentCount: 0 };
  }

  let offset = 8;
  const caBX = [0x63, 0x61, 0x42, 0x58];
  let segmentCount = 0;

  while (offset + 8 <= data.length) {
    const chunkLength = readUint32BE(data, offset);
    const chunkTypeOffset = offset + 4;

    if (matchBytes(data, chunkTypeOffset, caBX)) {
      segmentCount++;
      const chunkDataStart = chunkTypeOffset + 4;
      console.log(`[validate-c2pa] PNG: caBX chunk found, ${chunkLength} bytes, first 64: ${bytesToHex(data.subarray(chunkDataStart, chunkDataStart + 64))}`);
      return { jumbfData: data.subarray(chunkDataStart, chunkDataStart + chunkLength), format: 'png', segmentCount };
    }

    if (matchBytes(data, chunkTypeOffset, [0x49, 0x45, 0x4E, 0x44])) break;
    offset += 4 + 4 + chunkLength + 4;
  }

  return { jumbfData: null, format: 'png', segmentCount };
}

function extractJUMBFFromVideo(data: Uint8Array): { jumbfData: Uint8Array | null; format: string; segmentCount: number } {
  let offset = 0;
  while (offset < data.length - 8) {
    const boxSize = readUint32BE(data, offset);
    const boxType = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]);

    if (boxSize < 8 || offset + boxSize > data.length) break;

    if (boxType === 'uuid' && boxSize >= 24) {
      if (matchBytes(data, offset + 8, C2PA_VIDEO_UUID)) {
        console.log(`[validate-c2pa] Video: UUID box found, ${boxSize - 24} bytes payload`);
        return { jumbfData: data.subarray(offset + 24, offset + boxSize), format: 'video', segmentCount: 1 };
      }
    }

    offset += boxSize;
  }

  return { jumbfData: null, format: 'video', segmentCount: 0 };
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
  let extracted: { jumbfData: Uint8Array | null; format: string; segmentCount: number };
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
  // Record segment count as minimum rawBoxCount even if parsing fails
  result.rawBoxCount = Math.max(extracted.segmentCount, 1);

  // Parse JUMBF box tree
  try {
    const boxes = parseJUMBFBoxes(extracted.jumbfData);
    const boxCount = countBoxes(boxes);
    if (boxCount > 0) {
      result.rawBoxCount = boxCount;
    }

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
      result.trustStatus = 'self-signed';
      result.trustReason = 'Manifest has valid COSE Sign1 structure. Trust list verification pending.';
    }

    console.log(`[validate-c2pa] JUMBF parsed: ${boxes.length} top-level boxes, ${boxCount} total, ${result.assertions.length} assertions, ${result.ingredients.length} ingredients, claimGen: ${result.claimGenerator}, hashBound: ${!!parsed.hashData}`);

    // If JUMBF parsing found boxes but no claim data, try JSON fallback on raw data
    if (!result.claimGenerator && result.assertions.length === 0) {
      console.log('[validate-c2pa] JUMBF boxes found but no claim data extracted — trying JSON fallback');
      tryJSONFallback(extracted.jumbfData, result);
    }
  } catch (e) {
    console.warn('[validate-c2pa] JUMBF parse error:', e);
    // Fallback 1: text-based scanning on JUMBF data
    const fallbackClaim: ParsedClaim = { assertions: [], ingredients: [] };
    extractFieldsFromText(extracted.jumbfData, fallbackClaim);
    result.claimGenerator = fallbackClaim.claimGenerator || null;
    result.assertions = fallbackClaim.assertions;

    // Fallback 2: JSON manifest in the JUMBF data
    if (!result.claimGenerator) {
      tryJSONFallback(extracted.jumbfData, result);
    }
  }

  // Final fallback: scan entire raw JUMBF for text patterns
  if (!result.claimGenerator && result.assertions.length === 0) {
    const textFallback: ParsedClaim = { assertions: [], ingredients: [] };
    extractFieldsFromText(extracted.jumbfData, textFallback);
    if (textFallback.claimGenerator) result.claimGenerator = textFallback.claimGenerator;
    if (textFallback.assertions.length > 0) result.assertions = textFallback.assertions;
  }

  return result;
}

/**
 * Try to find and parse a JSON-encoded manifest within the raw JUMBF data.
 * This handles TSMO's own embedded manifests which use JSON instead of CBOR.
 */
function tryJSONFallback(jumbfData: Uint8Array, result: C2PAResult): void {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(jumbfData);
  
  // Look for JSON objects in the data
  const jsonStarts: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') jsonStarts.push(i);
  }

  for (const start of jsonStarts) {
    try {
      // Find matching closing brace
      let depth = 0;
      let end = start;
      for (let i = start; i < text.length; i++) {
        if (text[i] === '{') depth++;
        if (text[i] === '}') depth--;
        if (depth === 0) { end = i + 1; break; }
      }
      
      const jsonStr = text.slice(start, end);
      if (jsonStr.length < 10) continue;
      
      const json = JSON.parse(jsonStr);
      if (typeof json !== 'object' || json === null) continue;

      const claim: ParsedClaim = { assertions: [], ingredients: [] };
      extractFieldsFromDecodedClaim(json as Record<string, unknown>, claim);

      if (claim.claimGenerator || claim.assertions.length > 0) {
        console.log(`[validate-c2pa] JSON fallback found manifest: claimGen=${claim.claimGenerator}, assertions=${claim.assertions.length}`);
        result.claimGenerator = claim.claimGenerator || result.claimGenerator;
        result.claimGeneratorInfo = claim.claimGeneratorInfo || result.claimGeneratorInfo;
        if (claim.assertions.length > 0) result.assertions = claim.assertions;
        if (claim.ingredients.length > 0) result.ingredients = claim.ingredients;
        if (claim.specVersion) result.specVersion = claim.specVersion;
        if (claim.hashData) result.claimHash = claim.hashData.hash;
        return;
      }
    } catch {
      continue;
    }
  }
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
