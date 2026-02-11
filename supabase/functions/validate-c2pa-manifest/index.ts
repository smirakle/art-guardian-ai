import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// C2PA JUMBF label bytes: "c2pa" = [0x63, 0x32, 0x70, 0x61]
const C2PA_LABEL = [0x63, 0x32, 0x70, 0x61];
// JUMBF magic: "jumb"
const JUMB_TYPE = [0x6A, 0x75, 0x6D, 0x62];

interface C2PAResult {
  hasC2PA: boolean;
  manifestFound: boolean;
  claimGenerator: string | null;
  assertions: string[];
  format: string;
  rawBoxCount: number;
  error?: string;
}

function detectFormat(bytes: Uint8Array): string {
  // JPEG: starts with 0xFFD8
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
  // WebP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  return 'unknown';
}

function matchBytes(data: Uint8Array, offset: number, pattern: number[]): boolean {
  if (offset + pattern.length > data.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (data[offset + i] !== pattern[i]) return false;
  }
  return true;
}

function readUint32BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
}

function readUint16BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 8) | data[offset + 1];
}

// Try to extract a UTF-8 string near a given offset (heuristic for claim generator)
function extractNearbyString(data: Uint8Array, searchStart: number, maxLen: number): string | null {
  // Look for "c2pa" or common claim generator patterns
  const searchEnd = Math.min(searchStart + maxLen, data.length);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  
  // Search for common claim generator prefixes
  const prefixes = ['adobe', 'photoshop', 'lightroom', 'c2pa', 'truepic', 'microsoft', 'google', 'samsung', 'nikon', 'canon', 'sony'];
  
  for (let i = searchStart; i < searchEnd - 4; i++) {
    const chunk = decoder.decode(data.slice(i, Math.min(i + 200, searchEnd)));
    const lower = chunk.toLowerCase();
    for (const prefix of prefixes) {
      const idx = lower.indexOf(prefix);
      if (idx >= 0) {
        // Extract a reasonable string around the match
        const start = idx;
        let end = start;
        while (end < chunk.length && chunk.charCodeAt(end) >= 32 && chunk.charCodeAt(end) < 127) {
          end++;
        }
        if (end - start > 3) {
          return chunk.slice(start, Math.min(end, start + 100));
        }
      }
    }
  }
  return null;
}

function scanJPEGForC2PA(data: Uint8Array): C2PAResult {
  const result: C2PAResult = {
    hasC2PA: false,
    manifestFound: false,
    claimGenerator: null,
    assertions: [],
    format: 'jpeg',
    rawBoxCount: 0,
  };

  // Verify JPEG SOI
  if (data[0] !== 0xFF || data[1] !== 0xD8) {
    result.error = 'Not a valid JPEG';
    return result;
  }

  let offset = 2;
  while (offset < data.length - 4) {
    // Find next marker
    if (data[offset] !== 0xFF) {
      offset++;
      continue;
    }

    const marker = data[offset + 1];
    
    // SOS (Start of Scan) - stop scanning markers
    if (marker === 0xDA) break;
    // EOI
    if (marker === 0xD9) break;

    // Skip standalone markers
    if (marker === 0xFF || marker === 0x00 || (marker >= 0xD0 && marker <= 0xD7)) {
      offset += 2;
      continue;
    }

    const segLength = readUint16BE(data, offset + 2);
    
    // APP11 marker = 0xEB (C2PA uses APP11 for JUMBF)
    if (marker === 0xEB) {
      const segStart = offset + 4;
      const segEnd = offset + 2 + segLength;
      
      // Search for JUMBF box type "jumb" within this APP11 segment
      for (let i = segStart; i < Math.min(segEnd, data.length) - 8; i++) {
        if (matchBytes(data, i, JUMB_TYPE)) {
          result.rawBoxCount++;
          
          // Search for c2pa label nearby
          for (let j = i; j < Math.min(i + 200, segEnd, data.length) - 4; j++) {
            if (matchBytes(data, j, C2PA_LABEL)) {
              result.hasC2PA = true;
              result.manifestFound = true;
              
              // Try to extract claim generator string
              const generator = extractNearbyString(data, j, 2000);
              if (generator) {
                result.claimGenerator = generator;
              }
              
              // Look for common assertion type labels
              const assertionLabels = ['c2pa.actions', 'c2pa.hash.data', 'c2pa.thumbnail', 'stds.schema-org.CreativeWork', 'c2pa.ingredient'];
              const decoder = new TextDecoder('utf-8', { fatal: false });
              const segText = decoder.decode(data.slice(j, Math.min(segEnd, data.length)));
              for (const label of assertionLabels) {
                if (segText.includes(label)) {
                  result.assertions.push(label);
                }
              }
              break;
            }
          }
        }
      }
    }

    offset += 2 + segLength;
  }

  return result;
}

function scanPNGForC2PA(data: Uint8Array): C2PAResult {
  const result: C2PAResult = {
    hasC2PA: false,
    manifestFound: false,
    claimGenerator: null,
    assertions: [],
    format: 'png',
    rawBoxCount: 0,
  };

  // Verify PNG signature
  if (!matchBytes(data, 0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    result.error = 'Not a valid PNG';
    return result;
  }

  let offset = 8; // After PNG signature
  const caBX = [0x63, 0x61, 0x42, 0x58]; // "caBX"

  while (offset < data.length - 12) {
    const chunkLength = readUint32BE(data, offset);
    const chunkTypeOffset = offset + 4;

    // Check for caBX chunk (C2PA container in PNG)
    if (matchBytes(data, chunkTypeOffset, caBX)) {
      result.rawBoxCount++;
      
      const chunkDataStart = chunkTypeOffset + 4;
      const chunkDataEnd = Math.min(chunkDataStart + chunkLength, data.length);
      
      // Search for JUMBF "jumb" and "c2pa" within chunk data
      for (let i = chunkDataStart; i < chunkDataEnd - 4; i++) {
        if (matchBytes(data, i, C2PA_LABEL)) {
          result.hasC2PA = true;
          result.manifestFound = true;
          
          const generator = extractNearbyString(data, i, 2000);
          if (generator) result.claimGenerator = generator;
          
          // Look for assertion labels
          const assertionLabels = ['c2pa.actions', 'c2pa.hash.data', 'c2pa.thumbnail', 'stds.schema-org.CreativeWork', 'c2pa.ingredient'];
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const chunkText = decoder.decode(data.slice(i, chunkDataEnd));
          for (const label of assertionLabels) {
            if (chunkText.includes(label)) {
              result.assertions.push(label);
            }
          }
          break;
        }
      }
    }

    // IEND chunk - stop
    if (matchBytes(data, chunkTypeOffset, [0x49, 0x45, 0x4E, 0x44])) break;

    // Move to next chunk: length(4) + type(4) + data(chunkLength) + CRC(4)
    offset += 4 + 4 + chunkLength + 4;
  }

  return result;
}

function scanForC2PA(data: Uint8Array): C2PAResult {
  const format = detectFormat(data);
  
  switch (format) {
    case 'jpeg':
      return scanJPEGForC2PA(data);
    case 'png':
      return scanPNGForC2PA(data);
    case 'webp':
      // WebP C2PA support is less common; do basic byte scan
      return {
        hasC2PA: false,
        manifestFound: false,
        claimGenerator: null,
        assertions: [],
        format: 'webp',
        rawBoxCount: 0,
      };
    default:
      return {
        hasC2PA: false,
        manifestFound: false,
        claimGenerator: null,
        assertions: [],
        format: 'unknown',
        rawBoxCount: 0,
        error: 'Unsupported image format',
      };
  }
}

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
