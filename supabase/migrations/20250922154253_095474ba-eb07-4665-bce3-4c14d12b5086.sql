-- Add file size tracking columns to artwork table only
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS original_file_size BIGINT DEFAULT 0;
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS compressed_file_size BIGINT DEFAULT 0;
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artwork_user_status ON public.artwork(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_artwork_user_created ON public.artwork(user_id, created_at DESC);

-- Create batch processing queue table
CREATE TABLE IF NOT EXISTS public.batch_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  batch_size INTEGER NOT NULL DEFAULT 10,
  items_processed INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  progress_percentage NUMERIC DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.batch_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own batch processes" 
ON public.batch_processing_queue 
FOR ALL 
USING (auth.uid() = user_id);