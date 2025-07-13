-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artwork', 'artwork', false);

-- Create policies for artwork uploads
CREATE POLICY "Users can upload their own artwork" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own artwork" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own artwork" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own artwork" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create artwork metadata table
CREATE TABLE public.artwork (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  license_type TEXT,
  file_paths TEXT[] NOT NULL,
  enable_watermark BOOLEAN DEFAULT true,
  enable_blockchain BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artwork ENABLE ROW LEVEL SECURITY;

-- RLS policies for artwork table
CREATE POLICY "Users can manage their own artwork" 
ON public.artwork 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on artwork
CREATE TRIGGER update_artwork_updated_at
  BEFORE UPDATE ON public.artwork
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();