import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentProcessor } from "@/utils/DocumentProcessor";
import { watermarkService } from "@/lib/watermark";

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

      // Check if file is an image (blueprint)
      const isImage = /\.(jpg|jpeg|png|tiff|tif|bmp|svg|webp)$/i.test(file.name);
      let watermarkedFile = file;
      
      if (isImage && options.protectionLevel !== 'basic') {
        setExtractionStatus("Applying invisible watermark...");
        setExtractionProgress(20);
        try {
          const watermarkId = `WM-${Date.now()}-${user?.id?.substring(0, 8) || guestSessionId?.substring(0, 8) || 'guest'}`;
          const watermarkedBlob = await watermarkService.applyWatermark(file, {
            text: watermarkId,
            opacity: 0.02,
            size: 48,
            frequency: 'high'
          });
          watermarkedFile = new File([watermarkedBlob], file.name, { type: file.type });
        } catch (wmError) {
          console.warn('Watermarking failed, continuing without:', wmError);
        }
      }

      setExtractionStatus("Extracting text from document...");
      const extractionResult = await DocumentProcessor.extractText(watermarkedFile, (progress, status) => {
        setExtractionProgress(Math.min(20 + progress * 0.6, 80));
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
        reader.readAsDataURL(watermarkedFile);
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
            guestSessionId,
            isBlueprint: isImage,
            hasWatermark: isImage && options.protectionLevel !== 'basic'
          }
        }
      );

      if (processingError) throw processingError;
      if (!processingResult.success) throw new Error(processingResult.error || 'Protection failed');

      const description = isImage 
        ? `${file.name} protected with invisible watermark${extractionResult.wordCount > 0 ? ` (${extractionResult.wordCount} words extracted via OCR)` : ''}`
        : `${file.name} secured (${extractionResult.wordCount} words via ${extractionResult.extractionMethod})`;

      toast({
        title: isImage ? "Blueprint Protected" : "Document Protected",
        description,
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
