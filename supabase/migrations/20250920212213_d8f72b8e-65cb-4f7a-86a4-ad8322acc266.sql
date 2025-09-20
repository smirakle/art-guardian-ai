-- Create storage policies for image uploads

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the artwork bucket (main image uploads)
CREATE POLICY "Allow authenticated users to upload artwork" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to view their own artwork" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to update their own artwork" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own artwork" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for the ai-protected-files bucket
CREATE POLICY "Allow authenticated users to upload ai-protected files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to view their own ai-protected files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for the nft-assets bucket (public bucket)
CREATE POLICY "Allow authenticated users to upload nft assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'nft-assets');

CREATE POLICY "Allow anyone to view nft assets" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'nft-assets');

-- Create policies for mobile-apps bucket (public bucket)
CREATE POLICY "Allow authenticated users to upload mobile apps" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mobile-apps');

CREATE POLICY "Allow anyone to view mobile apps" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'mobile-apps');

-- Also create a general images bucket for easy uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create policies for the images bucket
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow anyone to view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'images');