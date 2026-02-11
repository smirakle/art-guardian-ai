
-- Create c2pa_validation_logs table for compliance/audit
CREATE TABLE public.c2pa_validation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  has_c2pa BOOLEAN NOT NULL DEFAULT false,
  manifest_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.c2pa_validation_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own logs
CREATE POLICY "Users can view their own c2pa logs"
ON public.c2pa_validation_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert their own c2pa logs"
ON public.c2pa_validation_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient user queries
CREATE INDEX idx_c2pa_validation_logs_user_id ON public.c2pa_validation_logs(user_id);
CREATE INDEX idx_c2pa_validation_logs_has_c2pa ON public.c2pa_validation_logs(has_c2pa);
