-- Allow guest uploads to artwork bucket (temporary storage)
CREATE POLICY "Guests can upload to artwork bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'artwork' 
  AND (auth.uid() IS NOT NULL OR (storage.foldername(name))[1] = 'anonymous')
);

-- Allow guests to view their uploaded files
CREATE POLICY "Guests can view anonymous uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'artwork'
  AND (
    (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
    OR (storage.foldername(name))[1] = 'anonymous'
  )
);

-- Allow guests to delete their anonymous uploads
CREATE POLICY "Guests can delete anonymous uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'artwork'
  AND (auth.uid() IS NOT NULL OR (storage.foldername(name))[1] = 'anonymous')
);