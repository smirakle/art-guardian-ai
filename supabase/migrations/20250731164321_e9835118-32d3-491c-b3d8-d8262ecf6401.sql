-- Check and fix storage policies for ai-protected-files bucket

-- First, ensure the bucket exists and is accessible
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ai-protected-files', 'ai-protected-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for ai-protected-files storage access
CREATE POLICY "Users can upload their own protected files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can download their own protected files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own protected files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own protected files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ai-protected-files' AND auth.uid()::text = (storage.foldername(name))[1]);