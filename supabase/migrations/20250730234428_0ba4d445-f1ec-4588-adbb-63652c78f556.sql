-- Create storage bucket for AI protected files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ai-protected-files', 'ai-protected-files', false, 52428800, ARRAY['image/*', 'video/*', 'audio/*', 'application/*', 'text/*']);

-- Create storage policies for AI protected files
CREATE POLICY "Users can upload their own AI protected files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own AI protected files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own AI protected files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own AI protected files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);