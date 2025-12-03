import { supabase } from "@/integrations/supabase/client";

// Magic byte signatures for client-side pre-validation
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // Also need WEBP at offset 8
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'application/zip': [[0x50, 0x4B, 0x03, 0x04]], // PK (DOCX, XLSX, PPTX)
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'],
  archive: ['zip', 'rar', 'gz']
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
  serverValidated?: boolean;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file extension is allowed for the given category
 */
export function isExtensionAllowed(filename: string, category?: string): boolean {
  const ext = getFileExtension(filename);
  
  if (category && ALLOWED_EXTENSIONS[category]) {
    return ALLOWED_EXTENSIONS[category].includes(ext);
  }
  
  return Object.values(ALLOWED_EXTENSIONS).flat().includes(ext);
}

/**
 * Client-side magic byte validation (fast, pre-check)
 */
export async function checkMagicBytesClient(file: File): Promise<{ valid: boolean; detectedType?: string }> {
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  for (const [mimeType, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const signature of signatures) {
      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return { valid: true, detectedType: mimeType };
      }
    }
  }
  
  // For text files and others without magic bytes, allow if extension is valid
  const ext = getFileExtension(file.name);
  const textExtensions = ['txt', 'csv', 'rtf', 'svg'];
  if (textExtensions.includes(ext)) {
    return { valid: true, detectedType: file.type || 'text/plain' };
  }
  
  return { valid: false };
}

/**
 * Server-side validation via edge function
 */
export async function validateFileServer(
  file: File, 
  category?: string
): Promise<ValidationResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mimeType', file.type);
    if (category) {
      formData.append('category', category);
    }

    const { data, error } = await supabase.functions.invoke('validate-file-upload', {
      body: formData
    });

    if (error) {
      console.error('[fileValidation] Server validation error:', error);
      return { valid: false, error: 'Server validation failed', serverValidated: false };
    }

    return {
      valid: data.valid,
      error: data.valid ? undefined : 'File type not allowed or magic bytes mismatch',
      detectedType: data.detectedMimeType,
      serverValidated: true
    };
  } catch (err) {
    console.error('[fileValidation] Server validation error:', err);
    return { valid: false, error: 'Server validation failed', serverValidated: false };
  }
}

/**
 * Complete file validation (client + server)
 */
export async function validateFile(
  file: File,
  options: {
    category?: string;
    maxSize?: number;
    requireServerValidation?: boolean;
  } = {}
): Promise<ValidationResult> {
  const { 
    category, 
    maxSize = MAX_FILE_SIZE, 
    requireServerValidation = true 
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB` 
    };
  }

  // Check file size minimum
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check extension
  if (!isExtensionAllowed(file.name, category)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${
        category 
          ? ALLOWED_EXTENSIONS[category]?.join(', ') 
          : Object.values(ALLOWED_EXTENSIONS).flat().join(', ')
      }` 
    };
  }

  // Client-side magic byte check (fast)
  const clientCheck = await checkMagicBytesClient(file);
  if (!clientCheck.valid) {
    // Don't fail immediately, server might accept it
    console.warn('[fileValidation] Client magic bytes check failed for:', file.name);
  }

  // Server-side validation (thorough)
  if (requireServerValidation) {
    const serverResult = await validateFileServer(file, category);
    return serverResult;
  }

  return { 
    valid: true, 
    detectedType: clientCheck.detectedType || file.type,
    serverValidated: false 
  };
}

/**
 * Quick validation without server call (use for UI feedback)
 */
export async function quickValidate(file: File, category?: string): Promise<ValidationResult> {
  // Size check
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large' };
  }

  // Extension check
  if (!isExtensionAllowed(file.name, category)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Magic bytes check
  const magicCheck = await checkMagicBytesClient(file);
  
  return {
    valid: magicCheck.valid || isExtensionAllowed(file.name, category),
    detectedType: magicCheck.detectedType,
    serverValidated: false
  };
}
