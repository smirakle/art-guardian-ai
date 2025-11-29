import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentProcessor } from "@/utils/DocumentProcessor";

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
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState("");
  const { toast } = useToast();

  const uploadProtectedDocument = async (
    file: File,
    options: ProtectionOptions,
    guestSessionId?: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setExtractionProgress(0);
    setExtractionStatus("Starting upload...");

    try {
      if (!DocumentProcessor.validateFileSize(file)) {
        throw new Error("File size exceeds 20MB limit");
      }

      const { data: { user } } = await supabase.auth.getUser();
      const isGuest = !user && guestSessionId;

      setExtractionStatus("Extracting text from document...");
      const extractionResult = await DocumentProcessor.extractText(file, (progress, status) => {
        setExtractionProgress(progress);
        setExtractionStatus(status);
      });

      let fingerprint = "";
      if (options.enableFingerprinting) {
        const userId = user?.id || guestSessionId || 'anonymous';
        fingerprint = DocumentProcessor.generateFingerprint(extractionResult.text, userId);
      }

      let processedText = extractionResult.text;
      const protectionId = `prot_${Date.now()}_${user?.id.substring(0, 8) || guestSessionId?.substring(0, 8) || 'guest'}`;
      if (options.enableTracers) {
        processedText = DocumentProcessor.injectTracers(extractionResult.text, protectionId);
      }

      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data: processingResult, error: processingError } = await supabase.functions.invoke(
        'process-document-protection',
        {
          body: {
            file: { name: file.name, type: file.type, size: file.size, url: fileData },
            protectionLevel: options.protectionLevel,
            enableTracers: options.enableTracers,
            enableFingerprinting: options.enableFingerprinting,
            extractedText: processedText,
            fingerprint,
            wordCount: extractionResult.wordCount,
            characterCount: extractionResult.characterCount,
            extractionMethod: extractionResult.extractionMethod,
            pageCount: extractionResult.pageCount,
            protectionId,
            isGuest,
            guestSessionId
          }
        }
      );

      if (processingError) throw processingError;
      if (!processingResult.success) throw new Error(processingResult.error || 'Protection failed');

      toast({
        title: "Document Protected",
        description: `${file.name} secured (${extractionResult.wordCount} words via ${extractionResult.extractionMethod})`,
      });

      return { success: true, ...processingResult };
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
      setExtractionProgress(0);
      setExtractionStatus("");
    }
  };

  return { uploadProtectedDocument, uploading, extractionProgress, extractionStatus };
};
