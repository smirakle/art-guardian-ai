
-- Create c2pa_signing_logs table for compliance audit
CREATE TABLE public.c2pa_signing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  protection_id TEXT,
  signing_algorithm TEXT NOT NULL DEFAULT 'ES256',
  certificate_fingerprint TEXT,
  manifest_hash TEXT,
  signing_mode TEXT NOT NULL DEFAULT 'self-signed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.c2pa_signing_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own signing logs
CREATE POLICY "Users can view their own signing logs"
  ON public.c2pa_signing_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own signing logs
CREATE POLICY "Users can insert their own signing logs"
  ON public.c2pa_signing_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_c2pa_signing_logs_user_id ON public.c2pa_signing_logs(user_id);
CREATE INDEX idx_c2pa_signing_logs_created_at ON public.c2pa_signing_logs(created_at DESC);
