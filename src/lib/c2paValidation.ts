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

/**
 * Validate a file for existing C2PA manifests by calling the edge function.
 * Returns detection results (not cryptographic verification).
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
