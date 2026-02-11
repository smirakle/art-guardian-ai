import { supabase } from '@/integrations/supabase/client';

export interface C2PAValidationResult {
  hasC2PA: boolean;
  manifestFound: boolean;
  claimGenerator: string | null;
  assertions: string[];
  format: string;
  rawBoxCount: number;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  error?: string;
}

export interface C2PASigningResult {
  signature: string;
  certificateFingerprint: string;
  algorithm: string;
  signingMode: 'production' | 'self-signed';
  manifestHash: string;
}

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
export const SUPPORTED_C2PA_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

export function isC2PASupportedType(mimeType: string): boolean {
  return SUPPORTED_C2PA_TYPES.includes(mimeType);
}

/**
 * Validate a file for existing C2PA manifests by calling the edge function.
 * Supports JPEG, PNG, MP4, and MOV files.
 */
export async function validateC2PAManifest(file: File): Promise<C2PAValidationResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await supabase.functions.invoke('validate-c2pa-manifest', {
    body: formData,
  });

  if (error) {
    console.error('[c2paValidation] Edge function error:', error);
    return {
      hasC2PA: false,
      manifestFound: false,
      claimGenerator: null,
      assertions: [],
      format: 'unknown',
      rawBoxCount: 0,
      fileName: file.name,
      fileSize: file.size,
      fileMimeType: file.type,
      error: error.message,
    };
  }

  return data as C2PAValidationResult;
}

/**
 * Sign a C2PA manifest claim with real ES256 cryptographic signature.
 */
export async function signC2PAManifest(
  claim: Record<string, unknown>,
  protectionId: string,
  fileName: string
): Promise<C2PASigningResult> {
  const { data, error } = await supabase.functions.invoke('sign-c2pa-manifest', {
    body: { claim, protectionId, fileName },
  });

  if (error) {
    console.error('[c2paValidation] Signing error:', error);
    throw new Error(`C2PA signing failed: ${error.message}`);
  }

  return data as C2PASigningResult;
}

/**
 * Embed a signed C2PA manifest into an image file.
 * Returns the modified image with embedded JUMBF.
 */
export async function embedC2PAManifest(
  file: File,
  manifestJson: string,
  signatureB64: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('manifest', manifestJson);
  formData.append('signature', signatureB64);

  const { data, error } = await supabase.functions.invoke('embed-c2pa-manifest', {
    body: formData,
  });

  if (error) {
    console.error('[c2paValidation] Embedding error:', error);
    throw new Error(`C2PA embedding failed: ${error.message}`);
  }

  // The response is a binary blob
  return data as Blob;
}

/**
 * Log C2PA validation result to the database for compliance/audit.
 */
export async function logC2PAValidation(
  userId: string,
  fileName: string,
  fileType: string,
  hasC2PA: boolean,
  manifestData: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('c2pa_validation_logs' as any)
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        has_c2pa: hasC2PA,
        manifest_data: manifestData,
      });

    if (error) {
      console.warn('[c2paValidation] Failed to log validation:', error.message);
    }
  } catch (e) {
    console.warn('[c2paValidation] Log error:', e);
  }
}
