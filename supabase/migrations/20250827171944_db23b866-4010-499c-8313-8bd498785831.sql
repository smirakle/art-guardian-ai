-- Create storage bucket for mobile app files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mobile-apps', 'mobile-apps', true, 209715200, ARRAY['application/vnd.android.package-archive', 'application/octet-stream', 'application/zip']);

-- Create policies for mobile app downloads
CREATE POLICY "Anyone can view mobile app files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mobile-apps');

CREATE POLICY "Admins can upload mobile app files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mobile-apps' AND 
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ))
);

CREATE POLICY "Admins can update mobile app files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'mobile-apps' AND 
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ))
);

CREATE POLICY "Admins can delete mobile app files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'mobile-apps' AND 
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ))
);