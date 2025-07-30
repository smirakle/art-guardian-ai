-- Create table for tracking AI training protection records
CREATE TABLE public.ai_protection_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL,
  user_id UUID NOT NULL,
  protection_id TEXT NOT NULL UNIQUE,
  protection_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  protection_level TEXT NOT NULL DEFAULT 'basic',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_fingerprint TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  protected_file_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_protection_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own protection records"
ON public.ai_protection_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create protection records for their artwork"
ON public.ai_protection_records
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  artwork_id IN (
    SELECT id FROM artwork WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own protection records"
ON public.ai_protection_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all protection records"
ON public.ai_protection_records
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table for AI training violations
CREATE TABLE public.ai_training_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protection_record_id UUID NOT NULL,
  user_id UUID NOT NULL,
  artwork_id UUID NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  violation_type TEXT NOT NULL, -- 'unauthorized_training', 'metadata_stripping', 'watermark_removal', 'adversarial_bypass'
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  source_url TEXT,
  source_domain TEXT,
  evidence_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'false_positive', 'resolved'
  legal_action_taken BOOLEAN NOT NULL DEFAULT false,
  dmca_notice_id UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for violations
ALTER TABLE public.ai_training_violations ENABLE ROW LEVEL SECURITY;

-- Create policies for violations
CREATE POLICY "Users can view their own violations"
ON public.ai_training_violations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create violations"
ON public.ai_training_violations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own violations"
ON public.ai_training_violations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all violations"
ON public.ai_training_violations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add AI protection status to artwork table
ALTER TABLE public.artwork 
ADD COLUMN ai_protection_enabled BOOLEAN DEFAULT false,
ADD COLUMN ai_protection_level TEXT DEFAULT 'none',
ADD COLUMN ai_protection_methods JSONB DEFAULT '[]'::jsonb,
ADD COLUMN protection_record_id UUID;

-- Create indexes for performance
CREATE INDEX idx_ai_protection_records_user_id ON public.ai_protection_records(user_id);
CREATE INDEX idx_ai_protection_records_artwork_id ON public.ai_protection_records(artwork_id);
CREATE INDEX idx_ai_protection_records_protection_id ON public.ai_protection_records(protection_id);
CREATE INDEX idx_ai_training_violations_user_id ON public.ai_training_violations(user_id);
CREATE INDEX idx_ai_training_violations_artwork_id ON public.ai_training_violations(artwork_id);
CREATE INDEX idx_ai_training_violations_status ON public.ai_training_violations(status);

-- Create trigger for updating timestamps
CREATE TRIGGER update_ai_protection_records_updated_at
BEFORE UPDATE ON public.ai_protection_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_training_violations_updated_at
BEFORE UPDATE ON public.ai_training_violations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();