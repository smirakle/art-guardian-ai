-- Create storage bucket for protected documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'protected-documents',
  'protected-documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS policies for protected-documents bucket
CREATE POLICY "Users can upload their own protected documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'protected-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own protected documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'protected-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own protected documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'protected-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own protected documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'protected-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create AI training dataset registry
CREATE TABLE IF NOT EXISTS public.ai_training_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name text NOT NULL,
  dataset_url text NOT NULL,
  platform text NOT NULL,
  last_indexed timestamp with time zone DEFAULT now(),
  total_samples bigint DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_training_datasets ENABLE ROW LEVEL SECURITY;

-- Public can view datasets (for transparency)
CREATE POLICY "Anyone can view AI training datasets"
ON public.ai_training_datasets FOR SELECT
USING (true);

-- Only admins can manage datasets
CREATE POLICY "Admins can manage AI training datasets"
ON public.ai_training_datasets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create document protection jobs table
CREATE TABLE IF NOT EXISTS public.document_protection_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  file_size bigint NOT NULL,
  protection_level text NOT NULL CHECK (protection_level IN ('basic', 'standard', 'maximum')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  protection_record_id uuid REFERENCES public.ai_protection_records(id),
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_protection_jobs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own jobs
CREATE POLICY "Users can manage their own protection jobs"
ON public.document_protection_jobs FOR ALL
USING (auth.uid() = user_id);

-- System can create jobs
CREATE POLICY "System can create protection jobs"
ON public.document_protection_jobs FOR INSERT
WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_protection_jobs_user_status ON public.document_protection_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_protection_jobs_created ON public.document_protection_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_datasets_platform ON public.ai_training_datasets(platform, is_active);

-- Insert known AI training datasets
INSERT INTO public.ai_training_datasets (dataset_name, dataset_url, platform, metadata) VALUES
  ('Common Crawl', 'https://commoncrawl.org/', 'common_crawl', '{"description": "Web crawl corpus", "size": "petabytes"}'::jsonb),
  ('LAION-5B', 'https://laion.ai/blog/laion-5b/', 'laion', '{"description": "Large-scale image-text pairs", "size": "5.85 billion"}'::jsonb),
  ('The Pile', 'https://pile.eleuther.ai/', 'eleuther', '{"description": "Diverse text dataset", "size": "825 GiB"}'::jsonb),
  ('C4 (Colossal Clean Crawled Corpus)', 'https://www.tensorflow.org/datasets/catalog/c4', 'google', '{"description": "Web text corpus", "size": "750GB"}'::jsonb),
  ('OpenImages', 'https://storage.googleapis.com/openimages/web/index.html', 'google', '{"description": "Annotated images", "size": "9 million images"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Create function to update job progress
CREATE OR REPLACE FUNCTION public.update_protection_job_progress(
  job_id_param uuid,
  progress_param integer,
  status_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.document_protection_jobs
  SET 
    progress_percentage = progress_param,
    status = COALESCE(status_param, status),
    updated_at = now(),
    started_at = CASE WHEN started_at IS NULL AND progress_param > 0 THEN now() ELSE started_at END,
    completed_at = CASE WHEN progress_param = 100 THEN now() ELSE completed_at END
  WHERE id = job_id_param;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_document_protection_jobs_updated_at
  BEFORE UPDATE ON public.document_protection_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_training_datasets_updated_at
  BEFORE UPDATE ON public.ai_training_datasets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();