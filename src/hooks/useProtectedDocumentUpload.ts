import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectionOptions {
  protectionLevel: "basic" | "standard" | "maximum";
  enableTracers: boolean;
  enableFingerprinting: boolean;
}

interface UploadResult {
  success: boolean;
  protectionRecordId?: string;
  documentPath?: string;
  tracerId?: string;
  error?: string;
}

export const useProtectedDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadProtectedDocument = async (
    file: File,
    options: ProtectionOptions
  ): Promise<UploadResult> => {
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get file as data URL for edge function
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const fileData = await fileDataPromise;

      // Call edge function to process document protection
      const { data: processingResult, error: processingError } = await supabase.functions.invoke(
        'process-document-protection',
        {
          body: {
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              url: fileData
            },
            protectionLevel: options.protectionLevel,
            enableTracers: options.enableTracers,
            enableFingerprinting: options.enableFingerprinting
          }
        }
      );

      if (processingError) throw processingError;
      if (!processingResult.success) throw new Error(processingResult.error || 'Protection failed');

      // Optionally scan AI training datasets if maximum protection
      if (options.protectionLevel === 'maximum' && processingResult.protectionRecordId) {
        const { data: protectionRecord } = await supabase
          .from('ai_protection_records')
          .select('file_fingerprint')
          .eq('id', processingResult.protectionRecordId)
          .single();

        if (protectionRecord) {
          // Trigger background scan (don't await to keep upload fast)
          supabase.functions.invoke('scan-ai-training-datasets', {
            body: {
              protectionRecordId: processingResult.protectionRecordId,
              fingerprint: protectionRecord.file_fingerprint
            }
          }).catch(err => console.error('Background scan error:', err));
        }
      }

      toast({
        title: "Document Protected",
        description: `${file.name} has been secured with ${options.protectionLevel} protection.`,
      });

      return {
        success: true,
        protectionRecordId: processingResult.protectionRecordId,
        documentPath: processingResult.documentPath,
        tracerId: processingResult.tracerId,
      };
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and protect document",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message,
      };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProtectedDocument,
    uploading,
  };
};
