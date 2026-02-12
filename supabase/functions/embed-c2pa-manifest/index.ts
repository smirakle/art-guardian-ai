import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * C2PA v2.2 JUMBF Embedding Edge Function
 * Embeds C2PA manifests as JUMBF boxes into JPEG (APP11) and PNG (caBX) files.
 * 
 * JUMBF structure per ISO 19566-5 and C2PA v2.2 §6:
 *   c2pa superbox (jumb)
 *     ├─ Description box (jumd) with C2PA UUID + "c2pa" label
 *     ├─ Assertion Store superbox (jumb / "c2pa.assertions")
 *     │    ├─ Assertion 0: c2pa.actions (jumb)
 *     │    ├─ Assertion 1: c2pa.hash.data (jumb)
 *     │    └─ Assertion N: c2pa.ingredient (jumb) ...
 *     ├─ Claim box (jumb / "c2pa.claim" / c2cl content)
 *     └─ Claim Signature box (jumb / "c2pa.signature" / c2cs content)
 */

// ─── Constants ───────────────────────────────────────────────────────────────

// JUMBF box type codes (4 bytes each)
const JUMB = new Uint8Array([0x6A, 0x75, 0x6D, 0x62]); // "jumb" superbox
const JUMD = new Uint8Array([0x6A, 0x75, 0x6D, 0x64]); // "jumd" description box

// C2PA JUMBF UUID per ISO 19566-5: 6332 7061-0011-0010-8000-00AA00389B71
const C2PA_JUMBF_UUID = new Uint8Array([
  0x63, 0x32, 0x70, 0x61, // c2pa
  0x00, 0x11,             // 0011
  0x00, 0x10,             // 0010
  0x80, 0x00,             // 8000
  0x00, 0xAA, 0x00, 0x38, 0x9B, 0x71 // 00AA00389B71
]);

// Content box type codes
const C2CL = new Uint8Array([0x63, 0x32, 0x63, 0x6C]); // "c2cl" claim
const C2CS = new Uint8Array([0x63, 0x32, 0x63, 0x73]); // "c2cs" claim signature
const CBOR_TYPE = new Uint8Array([0x63, 0x62, 0x6F, 0x72]); // "cbor" content type

// ─── Binary Helpers ──────────────────────────────────────────────────────────

function writeUint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  buf[0] = (value >> 24) & 0xFF;
  buf[1] = (value >> 16) & 0xFF;
  buf[2] = (value >> 8) & 0xFF;
  buf[3] = value & 0xFF;
  return buf;
}

function readUint16BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 8) | data[offset + 1];
}

function readUint32BE(data: Uint8Array, offset: number): number {
  return ((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ─── JUMBF Box Builders (ISO 19566-5 compliant) ─────────────────────────────

/**
 * Build a JUMBF Description Box (jumd) per ISO 19566-5 §8.
 * Structure: LBox(4) + TBox"jumd"(4) + UUID(16) + toggles(1) + label(null-terminated)
 */
function buildDescriptionBox(uuid: Uint8Array, label: string): Uint8Array {
  const labelBytes = new TextEncoder().encode(label + '\0');
  const toggles = 0x03; // bit 0: label present, bit 1: id not present
  const boxSize = 4 + 4 + uuid.length + 1 + labelBytes.length;
  return concatBytes(
    writeUint32BE(boxSize),
    JUMD,
    uuid,
    new Uint8Array([toggles]),
    labelBytes
  );
}

/**
 * Build a generic JUMBF content box.
 * Structure: LBox(4) + TBox(4) + data
 */
function buildContentBox(type: Uint8Array, data: Uint8Array): Uint8Array {
  const boxSize = 4 + 4 + data.length;
  return concatBytes(writeUint32BE(boxSize), type, data);
}

/**
 * Build a JUMBF superbox wrapping child boxes.
 * Structure: LBox(4) + TBox"jumb"(4) + children...
 */
function buildSuperbox(children: Uint8Array[]): Uint8Array {
  const childBytes = concatBytes(...children);
  const boxSize = 4 + 4 + childBytes.length;
  return concatBytes(writeUint32BE(boxSize), JUMB, childBytes);
}

/**
 * Build a labeled JUMBF superbox (description + content children).
 * Used for assertion store, individual assertions, claim, and signature boxes.
 */
function buildLabeledSuperbox(uuid: Uint8Array, label: string, children: Uint8Array[]): Uint8Array {
  const descBox = buildDescriptionBox(uuid, label);
  return buildSuperbox([descBox, ...children]);
}

// ─── Assertion Builders ─────────────────────────────────────────────────────

/**
 * Build a single assertion box as a labeled superbox containing CBOR data.
 */
function buildAssertionBox(label: string, cborData: Uint8Array): Uint8Array {
  const contentBox = buildContentBox(CBOR_TYPE, cborData);
  return buildLabeledSuperbox(C2PA_JUMBF_UUID, label, [contentBox]);
}

/**
 * Build the Assertion Store superbox containing all assertion boxes.
 * Label: "c2pa.assertions"
 */
function buildAssertionStore(assertionBoxes: Uint8Array[]): Uint8Array {
  const descBox = buildDescriptionBox(C2PA_JUMBF_UUID, 'c2pa.assertions');
  return buildSuperbox([descBox, ...assertionBoxes]);
}

// ─── C2PA v2.2 Manifest Superbox ────────────────────────────────────────────

interface ManifestComponents {
  manifestData: Uint8Array;   // CBOR-encoded claim
  signatureData: Uint8Array;  // COSE Sign1 envelope
  assertions?: { label: string; data: Uint8Array }[];
  ingredients?: { label: string; data: Uint8Array }[];
}

/**
 * Build the complete C2PA v2.2 manifest store JUMBF superbox.
 * 
 * Structure:
 *   c2pa manifest (jumb)
 *     ├─ jumd: UUID=C2PA_JUMBF_UUID, label="c2pa"
 *     ├─ Assertion Store (jumb, label="c2pa.assertions")
 *     │    ├─ c2pa.actions assertion (jumb)
 *     │    ├─ c2pa.hash.data assertion (jumb)
 *     │    └─ c2pa.ingredient assertions... (jumb)
 *     ├─ Claim (jumb, label="c2pa.claim", content=c2cl)
 *     └─ Claim Signature (jumb, label="c2pa.signature", content=c2cs)
 */
function buildC2PAManifestStore(components: ManifestComponents): Uint8Array {
  // 1. Build assertion boxes
  const assertionBoxes: Uint8Array[] = [];

  // Default c2pa.actions assertion from the manifest data
  const actionsAssertion = buildAssertionBox('c2pa.actions', components.manifestData);
  assertionBoxes.push(actionsAssertion);

  // Additional assertions (e.g., c2pa.hash.data)
  if (components.assertions) {
    for (const assertion of components.assertions) {
      assertionBoxes.push(buildAssertionBox(assertion.label, assertion.data));
    }
  }

  // Ingredient assertions
  if (components.ingredients) {
    for (const ingredient of components.ingredients) {
      assertionBoxes.push(buildAssertionBox(ingredient.label, ingredient.data));
    }
  }

  // 2. Build Assertion Store
  const assertionStore = buildAssertionStore(assertionBoxes);

  // 3. Build Claim box (c2cl content inside labeled superbox)
  const claimContent = buildContentBox(C2CL, components.manifestData);
  const claimBox = buildLabeledSuperbox(C2PA_JUMBF_UUID, 'c2pa.claim', [claimContent]);

  // 4. Build Claim Signature box (c2cs content inside labeled superbox)
  const sigContent = buildContentBox(C2CS, components.signatureData);
  const signatureBox = buildLabeledSuperbox(C2PA_JUMBF_UUID, 'c2pa.signature', [sigContent]);

  // 5. Build top-level C2PA manifest superbox
  const topDesc = buildDescriptionBox(C2PA_JUMBF_UUID, 'c2pa');
  return buildSuperbox([topDesc, assertionStore, claimBox, signatureBox]);
}

// ─── Image Format Embedding ─────────────────────────────────────────────────

/**
 * Embed JUMBF into JPEG via APP11 marker (0xFF 0xEB).
 * Per C2PA spec, APP11 carries the JUMBF with a CI/En/Z/LBox envelope.
 */
function embedIntoJPEG(jpegData: Uint8Array, jumbfBox: Uint8Array): Uint8Array {
  if (jpegData[0] !== 0xFF || jpegData[1] !== 0xD8) {
    throw new Error('Not a valid JPEG file');
  }

  const MAX_APP11_PAYLOAD = 65533;

  // APP11 JUMBF envelope: CI(2) + En(2) + Z(4) + LBox(4) = 12 bytes header
  const envelopeHeader = new Uint8Array(12);
  envelopeHeader[0] = 0x4A; envelopeHeader[1] = 0x50; // CI = "JP"
  envelopeHeader[2] = 0x00; envelopeHeader[3] = 0x01; // En = 1
  // Z = 0 (single box sequence)
  envelopeHeader.set(writeUint32BE(0), 4);
  // LBox = total JUMBF size
  envelopeHeader.set(writeUint32BE(jumbfBox.length), 8);

  const app11Payload = concatBytes(envelopeHeader, jumbfBox);

  if (app11Payload.length + 2 > MAX_APP11_PAYLOAD) {
    console.warn('[embed-c2pa] JUMBF exceeds single APP11 segment, truncating');
  }

  const payloadLen = Math.min(app11Payload.length, MAX_APP11_PAYLOAD);
  const segmentLength = payloadLen + 2;
  const app11Segment = concatBytes(
    new Uint8Array([0xFF, 0xEB]),
    new Uint8Array([(segmentLength >> 8) & 0xFF, segmentLength & 0xFF]),
    app11Payload.subarray(0, payloadLen)
  );

  // Find insertion point: after SOI and existing APP markers
  let insertOffset = 2;
  while (insertOffset < jpegData.length - 4) {
    if (jpegData[insertOffset] !== 0xFF) break;
    const marker = jpegData[insertOffset + 1];
    if ((marker >= 0xE0 && marker <= 0xEF) || marker === 0xFE) {
      const len = readUint16BE(jpegData, insertOffset + 2);
      insertOffset += 2 + len;
    } else {
      break;
    }
  }

  return concatBytes(
    jpegData.subarray(0, insertOffset),
    app11Segment,
    jpegData.subarray(insertOffset)
  );
}

/**
 * Embed JUMBF into PNG via caBX ancillary chunk.
 */
function embedIntoPNG(pngData: Uint8Array, jumbfBox: Uint8Array): Uint8Array {
  const pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (pngData[i] !== pngSig[i]) throw new Error('Not a valid PNG file');
  }

  const chunkType = new TextEncoder().encode('caBX');

  // CRC over chunk type + data
  const crcInput = concatBytes(chunkType, jumbfBox);
  const crcValue = crc32(crcInput);

  const chunk = concatBytes(
    writeUint32BE(jumbfBox.length),
    chunkType,
    jumbfBox,
    writeUint32BE(crcValue)
  );

  // Find IEND chunk to insert before it
  let iendOffset = -1;
  let offset = 8;
  while (offset < pngData.length - 12) {
    const chunkLen = readUint32BE(pngData, offset);
    const typeStr = String.fromCharCode(pngData[offset + 4], pngData[offset + 5], pngData[offset + 6], pngData[offset + 7]);
    if (typeStr === 'IEND') {
      iendOffset = offset;
      break;
    }
    offset += 4 + 4 + chunkLen + 4;
  }

  if (iendOffset === -1) {
    throw new Error('IEND chunk not found in PNG');
  }

  return concatBytes(
    pngData.subarray(0, iendOffset),
    chunk,
    pngData.subarray(iendOffset)
  );
}

// ─── Format Detection ────────────────────────────────────────────────────────

function detectFormat(bytes: Uint8Array): string {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
  return 'unknown';
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
        JSON.stringify({ error: 'Expected multipart/form-data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const manifestJson = formData.get('manifest') as string;
    const signatureB64 = formData.get('signature') as string;
    const assertionsJson = formData.get('assertions') as string | null;
    const ingredientsJson = formData.get('ingredients') as string | null;

    if (!file || !manifestJson || !signatureB64) {
      return new Response(
        JSON.stringify({ error: 'Missing file, manifest, or signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[embed-c2pa-manifest] Embedding v2.2 manifest into: ${file.name} (${file.size} bytes)`);

    const imageBytes = new Uint8Array(await file.arrayBuffer());
    const format = detectFormat(imageBytes);

    if (format === 'unknown') {
      return new Response(
        JSON.stringify({ error: 'Unsupported format. Only JPEG and PNG are supported for embedding.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode manifest and signature
    const manifestBytes = new TextEncoder().encode(manifestJson);
    const sigBinary = atob(signatureB64);
    const signatureBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      signatureBytes[i] = sigBinary.charCodeAt(i);
    }

    // Parse optional assertions and ingredients
    let assertions: { label: string; data: Uint8Array }[] | undefined;
    if (assertionsJson) {
      try {
        const parsed = JSON.parse(assertionsJson) as { label: string; data: string }[];
        assertions = parsed.map(a => ({
          label: a.label,
          data: new TextEncoder().encode(JSON.stringify(a.data)),
        }));
      } catch (e) {
        console.warn('[embed-c2pa-manifest] Failed to parse assertions:', e);
      }
    }

    let ingredients: { label: string; data: Uint8Array }[] | undefined;
    if (ingredientsJson) {
      try {
        const parsed = JSON.parse(ingredientsJson) as { label: string; data: string }[];
        ingredients = parsed.map(ing => ({
          label: ing.label || 'c2pa.ingredient',
          data: new TextEncoder().encode(JSON.stringify(ing.data)),
        }));
      } catch (e) {
        console.warn('[embed-c2pa-manifest] Failed to parse ingredients:', e);
      }
    }

    // Build the C2PA v2.2 compliant JUMBF manifest store
    const jumbfBox = buildC2PAManifestStore({
      manifestData: manifestBytes,
      signatureData: signatureBytes,
      assertions,
      ingredients,
    });

    // Embed into image
    let resultBytes: Uint8Array;
    if (format === 'jpeg') {
      resultBytes = embedIntoJPEG(imageBytes, jumbfBox);
    } else {
      resultBytes = embedIntoPNG(imageBytes, jumbfBox);
    }

    console.log(`[embed-c2pa-manifest] Embedded ${jumbfBox.length} bytes JUMBF (v2.2 structure) into ${format} (${imageBytes.length} → ${resultBytes.length} bytes)`);

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return new Response(resultBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'X-C2PA-Embedded': 'true',
        'X-C2PA-JUMBF-Size': jumbfBox.length.toString(),
        'X-C2PA-Spec-Version': '2.2',
      }
    });

  } catch (error) {
    console.error('[embed-c2pa-manifest] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
