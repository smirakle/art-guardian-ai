-- Check and fix ai-protected-files bucket configuration

-- Ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ai-protected-files', 'ai-protected-files', false)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = NULL,
  allowed_mime_types = NULL;

-- Remove any existing conflicting policies
DROP POLICY IF EXISTS "Users can upload their own protected files" ON storage.objects;
DROP POLICY IF EXISTS "Users can download their own protected files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own protected files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own protected files" ON storage.objects;

-- Create comprehensive storage policies for ai-protected-files bucket
CREATE POLICY "AI Protected Files: Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ai-protected-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "AI Protected Files: Users can download their own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ai-protected-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "AI Protected Files: Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'ai-protected-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "AI Protected Files: Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'ai-protected-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Check if artwork download policy exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Artwork Files: Users can download their own files'
  ) THEN
    CREATE POLICY "Artwork Files: Users can download their own files" 
    ON storage.objects 
    FOR SELECT 
    USING (
      bucket_id = 'artwork' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;