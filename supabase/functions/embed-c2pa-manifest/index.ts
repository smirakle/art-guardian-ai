import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * C2PA JUMBF Embedding Edge Function
 * Embeds C2PA manifests as JUMBF boxes into JPEG (APP11) and PNG (caBX) files.
 * Follows ISO 19566-5 (JUMBF) structure.
 */

// JUMBF box types
const JUMB = [0x6A, 0x75, 0x6D, 0x62]; // "jumb" - superbox
const JUMD = [0x6A, 0x75, 0x6D, 0x64]; // "jumd" - description box
const C2PA_LABEL = new TextEncoder().encode('c2pa\0'); // null-terminated

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

/**
 * Build a JUMBF Description Box (jumd)
 */
function buildDescriptionBox(label: string): Uint8Array {
  const labelBytes = new TextEncoder().encode(label + '\0');
  // Description box: size(4) + type"jumd"(4) + toggles(1) + label(variable)
  const toggles = 0x03; // label present, ID not present
  const boxSize = 4 + 4 + 1 + labelBytes.length;
  const box = new Uint8Array(boxSize);
  box.set(writeUint32BE(boxSize), 0);
  box.set(JUMD, 4);
  box[8] = toggles;
  box.set(labelBytes, 9);
  return box;
}

/**
 * Build a JUMBF content box wrapping arbitrary data
 */
function buildContentBox(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  if (typeBytes.length !== 4) throw new Error('Box type must be 4 bytes');
  const boxSize = 4 + 4 + data.length;
  const box = new Uint8Array(boxSize);
  box.set(writeUint32BE(boxSize), 0);
  box.set(typeBytes, 4);
  box.set(data, 8);
  return box;
}

/**
 * Build a JUMBF superbox with the c2pa label containing the manifest data
 */
function buildC2PASuperbox(manifestData: Uint8Array, signatureData: Uint8Array): Uint8Array {
  // Description box with "c2pa" label
  const descBox = buildDescriptionBox('c2pa');
  
  // Content boxes
  const claimBox = buildContentBox('c2cl', manifestData);   // c2pa claim
  const sigBox = buildContentBox('c2cs', signatureData);     // c2pa signature (COSE Sign1)
  
  // Superbox: size(4) + type"jumb"(4) + children
  const childrenSize = descBox.length + claimBox.length + sigBox.length;
  const superboxSize = 4 + 4 + childrenSize;
  const superbox = new Uint8Array(superboxSize);
  superbox.set(writeUint32BE(superboxSize), 0);
  superbox.set(JUMB, 4);
  
  let offset = 8;
  superbox.set(descBox, offset); offset += descBox.length;
  superbox.set(claimBox, offset); offset += claimBox.length;
  superbox.set(sigBox, offset);
  
  return superbox;
}

/**
 * Embed JUMBF into JPEG via APP11 marker (0xFF 0xEB)
 */
function embedIntoJPEG(jpegData: Uint8Array, jumbfBox: Uint8Array): Uint8Array {
  // Verify JPEG SOI
  if (jpegData[0] !== 0xFF || jpegData[1] !== 0xD8) {
    throw new Error('Not a valid JPEG file');
  }

  // Build APP11 segment(s)
  // APP11 max payload = 65533 bytes (0xFFFF - 2 for length field)
  // For large manifests, we'd need multiple APP11 segments, but typically one suffices
  const MAX_APP11_PAYLOAD = 65533;
  
  // APP11 JUMBF envelope: CI(2) + En(2) + Z(4) + LBox(4) + TBox(4) + payload
  // Common Identifier for C2PA JUMBF: 0x4A50 ("JP")
  // We use a single-part box (En=1, Z=0)
  const envelopeHeader = new Uint8Array(12);
  envelopeHeader[0] = 0x4A; envelopeHeader[1] = 0x50; // CI = "JP"
  envelopeHeader[2] = 0x00; envelopeHeader[3] = 0x01; // En = 1 (sequence number)
  // Z = 0 (total number of boxes in sequence, 0 = single)
  envelopeHeader[4] = 0x00; envelopeHeader[5] = 0x00;
  envelopeHeader[6] = 0x00; envelopeHeader[7] = 0x00;
  // LBox = total JUMBF size
  envelopeHeader.set(writeUint32BE(jumbfBox.length), 8);

  const app11Payload = new Uint8Array(envelopeHeader.length + jumbfBox.length);
  app11Payload.set(envelopeHeader, 0);
  app11Payload.set(jumbfBox, envelopeHeader.length);

  if (app11Payload.length + 2 > MAX_APP11_PAYLOAD) {
    console.warn('[embed-c2pa] JUMBF exceeds single APP11 segment, truncating');
  }

  const segmentLength = Math.min(app11Payload.length + 2, MAX_APP11_PAYLOAD + 2);
  const app11Segment = new Uint8Array(2 + 2 + Math.min(app11Payload.length, MAX_APP11_PAYLOAD));
  app11Segment[0] = 0xFF;
  app11Segment[1] = 0xEB; // APP11
  app11Segment[2] = (segmentLength >> 8) & 0xFF;
  app11Segment[3] = segmentLength & 0xFF;
  app11Segment.set(app11Payload.subarray(0, Math.min(app11Payload.length, MAX_APP11_PAYLOAD)), 4);

  // Find insertion point: after SOI and existing APP markers, before non-APP marker
  let insertOffset = 2; // After SOI
  while (insertOffset < jpegData.length - 4) {
    if (jpegData[insertOffset] !== 0xFF) break;
    const marker = jpegData[insertOffset + 1];
    // APP0-APP15 = 0xE0-0xEF, also skip COM (0xFE)
    if (marker >= 0xE0 && marker <= 0xEF || marker === 0xFE) {
      const len = readUint16BE(jpegData, insertOffset + 2);
      insertOffset += 2 + len;
    } else {
      break;
    }
  }

  // Build new JPEG
  const result = new Uint8Array(jpegData.length + app11Segment.length);
  result.set(jpegData.subarray(0, insertOffset), 0);
  result.set(app11Segment, insertOffset);
  result.set(jpegData.subarray(insertOffset), insertOffset + app11Segment.length);

  return result;
}

/**
 * Embed JUMBF into PNG via caBX ancillary chunk
 */
function embedIntoPNG(pngData: Uint8Array, jumbfBox: Uint8Array): Uint8Array {
  // Verify PNG signature
  const pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (pngData[i] !== pngSig[i]) throw new Error('Not a valid PNG file');
  }

  // Build caBX chunk: length(4) + "caBX"(4) + data + CRC(4)
  const chunkType = new TextEncoder().encode('caBX');
  const chunkData = jumbfBox;
  
  // CRC is calculated over chunk type + data
  const crcInput = new Uint8Array(chunkType.length + chunkData.length);
  crcInput.set(chunkType, 0);
  crcInput.set(chunkData, chunkType.length);
  const crcValue = crc32(crcInput);

  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  chunk.set(writeUint32BE(chunkData.length), 0);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);
  chunk.set(writeUint32BE(crcValue), 8 + chunkData.length);

  // Find IEND chunk to insert before it
  let iendOffset = -1;
  let offset = 8; // After PNG signature
  while (offset < pngData.length - 12) {
    const chunkLen = readUint32BE(pngData, offset);
    const typeStr = String.fromCharCode(pngData[offset + 4], pngData[offset + 5], pngData[offset + 6], pngData[offset + 7]);
    if (typeStr === 'IEND') {
      iendOffset = offset;
      break;
    }
    offset += 4 + 4 + chunkLen + 4; // length + type + data + CRC
  }

  if (iendOffset === -1) {
    throw new Error('IEND chunk not found in PNG');
  }

  // Build new PNG: before IEND + caBX chunk + IEND
  const result = new Uint8Array(pngData.length + chunk.length);
  result.set(pngData.subarray(0, iendOffset), 0);
  result.set(chunk, iendOffset);
  result.set(pngData.subarray(iendOffset), iendOffset + chunk.length);

  return result;
}

function detectFormat(bytes: Uint8Array): string {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
  return 'unknown';
}

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

    if (!file || !manifestJson || !signatureB64) {
      return new Response(
        JSON.stringify({ error: 'Missing file, manifest, or signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[embed-c2pa-manifest] Embedding into: ${file.name} (${file.size} bytes)`);

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

    // Build JUMBF superbox
    const jumbfBox = buildC2PASuperbox(manifestBytes, signatureBytes);

    // Embed into image
    let resultBytes: Uint8Array;
    if (format === 'jpeg') {
      resultBytes = embedIntoJPEG(imageBytes, jumbfBox);
    } else {
      resultBytes = embedIntoPNG(imageBytes, jumbfBox);
    }

    console.log(`[embed-c2pa-manifest] Embedded ${jumbfBox.length} bytes JUMBF into ${format} (${imageBytes.length} → ${resultBytes.length} bytes)`);

    // Return the modified image
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return new Response(resultBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'X-C2PA-Embedded': 'true',
        'X-C2PA-JUMBF-Size': jumbfBox.length.toString(),
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
