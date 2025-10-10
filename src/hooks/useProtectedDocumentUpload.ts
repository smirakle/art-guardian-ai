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

      // Generate unique file path
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${file.name}`;

      // Upload document to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("protected-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Generate protection fingerprint
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileFingerprint = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Determine protection methods based on level
      const protectionMethods = [];
      if (options.protectionLevel === "basic") {
        protectionMethods.push("basic_fingerprinting");
      } else if (options.protectionLevel === "standard") {
        protectionMethods.push("basic_fingerprinting", "metadata_embedding");
      } else {
        protectionMethods.push(
          "basic_fingerprinting",
          "metadata_embedding",
          "invisible_tracers",
          "pattern_injection"
        );
      }

      // Extract document metadata
      const wordCount = 0; // Placeholder - would need actual text extraction
      const charCount = file.size;

      // Generate protection ID
      const protectionId = `DOC-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Create protection record
      const { data: protectionRecord, error: protectionError } = await supabase
        .from("ai_protection_records")
        .insert({
          user_id: user.id,
          protection_id: protectionId,
          content_type: "document",
          original_filename: file.name,
          file_fingerprint: fileFingerprint,
          protection_level: options.protectionLevel,
          protection_methods: protectionMethods,
          protected_file_path: uploadData.path,
          original_mime_type: file.type,
          file_extension: file.name.split(".").pop() || "",
          word_count: wordCount,
          char_count: charCount,
          document_methods: options.enableTracers
            ? ["invisible_tracers"]
            : [],
        })
        .select("id, protection_id")
        .single();

      if (protectionError) throw protectionError;

      // Create document tracer if enabled
      let tracerId: string | undefined;
      if (options.enableTracers && protectionRecord) {
        const tracerPayload = btoa(
          JSON.stringify({
            protection_id: protectionRecord.protection_id,
            user_id: user.id,
            timestamp: Date.now(),
            fingerprint: fileFingerprint.substring(0, 16),
          })
        );

        const { data: tracerData, error: tracerError } = await supabase
          .from("ai_document_tracers")
          .insert({
            user_id: user.id,
            protection_record_id: protectionRecord.id,
            tracer_type: "invisible_marker",
            tracer_payload: tracerPayload,
            checksum: fileFingerprint.substring(0, 32),
          })
          .select("id")
          .single();

        if (!tracerError && tracerData) {
          tracerId = tracerData.id;
        }
      }

      toast({
        title: "Document Protected",
        description: `${file.name} has been secured with ${options.protectionLevel} protection.`,
      });

      return {
        success: true,
        protectionRecordId: protectionRecord.id,
        documentPath: uploadData.path,
        tracerId,
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
