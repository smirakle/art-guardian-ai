-- Create storage bucket for mobile app APKs
INSERT INTO storage.buckets (id, name, public) VALUES ('mobile-apps', 'mobile-apps', true);

-- Create policies for mobile app downloads
CREATE POLICY "Mobile apps are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mobile-apps');

CREATE POLICY "Only admins can upload mobile apps" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'mobile-apps' AND auth.jwt() ->> 'role' = 'admin');