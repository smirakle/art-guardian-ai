import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Magic byte signatures for common file types
const MAGIC_SIGNATURES: Record<string, { bytes: number[]; offset?: number }[]> = {
  // Images
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF] }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  'image/gif': [
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }  // GIF89a
  ],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }],
  'image/bmp': [{ bytes: [0x42, 0x4D] }],
  'image/tiff': [
    { bytes: [0x49, 0x49, 0x2A, 0x00] }, // Little endian
    { bytes: [0x4D, 0x4D, 0x00, 0x2A] }  // Big endian
  ],
  
  // Documents
  'application/pdf': [{ bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  'application/zip': [{ bytes: [0x50, 0x4B, 0x03, 0x04] }], // PK (also DOCX, XLSX, PPTX)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],
  'application/msword': [{ bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] }], // OLE compound
  'application/vnd.ms-excel': [{ bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] }],
  'application/vnd.ms-powerpoint': [{ bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] }],
  
  // Text formats (usually start with printable ASCII or BOM)
  'text/plain': [{ bytes: [0xEF, 0xBB, 0xBF] }], // UTF-8 BOM (optional)
  'text/html': [{ bytes: [0x3C, 0x21, 0x44, 0x4F, 0x43] }], // <!DOC
  'application/json': [{ bytes: [0x7B] }], // {
  'application/xml': [{ bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C] }], // <?xml
};

// Allowed MIME types per category
const ALLOWED_TYPES: Record<string, string[]> = {
  image: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
    'image/bmp', 'image/tiff', 'image/svg+xml'
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf'
  ],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/gzip']
};

function checkMagicBytes(fileBytes: Uint8Array, expectedMimeType: string): boolean {
  const signatures = MAGIC_SIGNATURES[expectedMimeType];
  if (!signatures) {
    // For types without signatures (like text/plain without BOM), allow if in allowed list
    return Object.values(ALLOWED_TYPES).flat().includes(expectedMimeType);
  }
  
  for (const sig of signatures) {
    const offset = sig.offset || 0;
    let matches = true;
    
    for (let i = 0; i < sig.bytes.length; i++) {
      if (fileBytes[offset + i] !== sig.bytes[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches) return true;
  }
  
  return false;
}

function detectMimeTypeFromBytes(fileBytes: Uint8Array): string | null {
  for (const [mimeType, signatures] of Object.entries(MAGIC_SIGNATURES)) {
    for (const sig of signatures) {
      const offset = sig.offset || 0;
      let matches = true;
      
      for (let i = 0; i < sig.bytes.length; i++) {
        if (fileBytes[offset + i] !== sig.bytes[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) return mimeType;
    }
  }
  
  return null;
}

function isAllowedType(mimeType: string, category?: string): boolean {
  if (category && ALLOWED_TYPES[category]) {
    return ALLOWED_TYPES[category].includes(mimeType);
  }
  return Object.values(ALLOWED_TYPES).flat().includes(mimeType);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const claimedMimeType = formData.get('mimeType') as string;
      const category = formData.get('category') as string | null;
      
      if (!file) {
        return new Response(
          JSON.stringify({ valid: false, error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Read first 32 bytes for magic byte detection
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer.slice(0, 32));
      
      // Detect actual MIME type from bytes
      const detectedMimeType = detectMimeTypeFromBytes(fileBytes);
      
      // Validate claimed type matches detected type
      const claimedTypeValid = checkMagicBytes(fileBytes, claimedMimeType);
      
      // Check if type is allowed
      const typeAllowed = isAllowedType(claimedMimeType, category || undefined);
      
      const result = {
        valid: claimedTypeValid && typeAllowed,
        claimedMimeType,
        detectedMimeType: detectedMimeType || 'unknown',
        typeAllowed,
        magicBytesMatch: claimedTypeValid,
        fileSize: file.size,
        fileName: file.name
      };
      
      if (!result.valid) {
        console.log('[validate-file-upload] Rejected file:', {
          fileName: file.name,
          claimedMimeType,
          detectedMimeType,
          reason: !claimedTypeValid ? 'magic_bytes_mismatch' : 'type_not_allowed'
        });
      } else {
        console.log('[validate-file-upload] Validated file:', file.name, claimedMimeType);
      }
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle JSON request (for base64 encoded files)
    const body = await req.json();
    const { fileBase64, claimedMimeType, category } = body;
    
    if (!fileBase64) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Decode base64 and get first 32 bytes
    const binaryString = atob(fileBase64.split(',').pop() || fileBase64);
    const fileBytes = new Uint8Array(Math.min(32, binaryString.length));
    for (let i = 0; i < fileBytes.length; i++) {
      fileBytes[i] = binaryString.charCodeAt(i);
    }
    
    const detectedMimeType = detectMimeTypeFromBytes(fileBytes);
    const claimedTypeValid = checkMagicBytes(fileBytes, claimedMimeType);
    const typeAllowed = isAllowedType(claimedMimeType, category || undefined);
    
    const result = {
      valid: claimedTypeValid && typeAllowed,
      claimedMimeType,
      detectedMimeType: detectedMimeType || 'unknown',
      typeAllowed,
      magicBytesMatch: claimedTypeValid
    };
    
    console.log('[validate-file-upload] Validation result:', result);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[validate-file-upload] Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
