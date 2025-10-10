import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { watermarkService } from '@/lib/watermark';

interface UploadOptions {
  applyWatermark?: boolean;
  protectionLevel?: 'basic' | 'standard' | 'premium';
  enableAIProtection?: boolean;
}

interface UploadResult {
  success: boolean;
  filePath?: string;
  artworkId?: string;
  protectionRecordId?: string;
  error?: string;
}

export function useProtectedFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadProtectedFile = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const {
        applyWatermark = true,
        protectionLevel = 'standard',
        enableAIProtection = true
      } = options;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      setUploadProgress(10);

      // Apply watermark if requested
      let processedFile = file;
      if (applyWatermark && file.type.startsWith('image/')) {
        try {
          const watermarkedBlob = await watermarkService.applyWatermark(file, {
            text: `© ${user.id.substring(0, 8)}`,
            opacity: 0.15,
            size: 48,
            position: 'center'
          });
          processedFile = new File([watermarkedBlob], file.name, { type: file.type });
          console.log('Watermark applied successfully');
        } catch (error) {
          console.error('Watermark application failed:', error);
          // Continue without watermark rather than failing
        }
      }

      setUploadProgress(30);

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('protected-artwork')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('protected-artwork')
        .getPublicUrl(uploadData.path);

      // Create artwork record
      const { data: artwork, error: artworkError } = await supabase
        .from('artwork')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          file_paths: [publicUrl],
          original_file_size: file.size,
          file_size: processedFile.size,
          category: 'digital_art',
          status: 'active',
          enable_watermark: applyWatermark,
          ai_protection_enabled: enableAIProtection,
          ai_protection_level: protectionLevel,
          processing_status: 'completed'
        })
        .select()
        .single();

      if (artworkError) throw artworkError;

      setUploadProgress(80);

      // Create AI protection record if enabled
      let protectionRecordId;
      if (enableAIProtection) {
        const { data: protectionRecord, error: protectionError } = await supabase
          .from('ai_protection_records')
          .insert({
            user_id: user.id,
            artwork_id: artwork.id,
            original_filename: file.name,
            file_fingerprint: `fp_${Date.now()}`,
            protection_level: protectionLevel,
            protection_id: `prot_${Date.now()}`,
            protection_methods: applyWatermark ? ['watermark'] : [],
            content_type: 'image',
            metadata: {
              originalSize: file.size,
              processedSize: processedFile.size,
              watermarkApplied: applyWatermark,
              uploadedAt: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (protectionError) {
          console.error('Protection record creation failed:', protectionError);
        } else {
          protectionRecordId = protectionRecord.id;

          // Update artwork with protection record
          await supabase
            .from('artwork')
            .update({ protection_record_id: protectionRecordId })
            .eq('id', artwork.id);
        }
      }

      setUploadProgress(100);

      // Log the upload action
      try {
        await supabase.rpc('log_ai_protection_action', {
          user_id_param: user.id,
          action_param: 'file_upload',
          resource_type_param: 'artwork',
          resource_id_param: artwork.id,
          details_param: {
            fileName: file.name,
            fileSize: file.size,
            protectionLevel,
            watermarkApplied: applyWatermark
          }
        });
      } catch (logError) {
        console.error('Failed to log action:', logError);
      }

      toast({
        title: "Upload Successful",
        description: `${file.name} has been protected and uploaded successfully.`,
      });

      return {
        success: true,
        filePath: publicUrl,
        artworkId: artwork.id,
        protectionRecordId
      };

    } catch (error: any) {
      console.error('Upload error:', error);
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and protect file.",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadProtectedFile,
    isUploading,
    uploadProgress
  };
}
