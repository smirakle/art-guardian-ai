-- Create AI Training Enforcement Workflows table
CREATE TABLE public.ai_training_enforcement_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  protection_record_id UUID NOT NULL,
  violation_id UUID,
  status TEXT NOT NULL DEFAULT 'initiated',
  steps_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  certificate_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_training_enforcement_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own enforcement workflows"
ON public.ai_training_enforcement_workflows
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "System can create and update enforcement workflows"
ON public.ai_training_enforcement_workflows
FOR ALL
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_enforcement_workflows_updated_at
  BEFORE UPDATE ON public.ai_training_enforcement_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_enforcement_workflows_user_id ON public.ai_training_enforcement_workflows(user_id);
CREATE INDEX idx_enforcement_workflows_status ON public.ai_training_enforcement_workflows(status);
CREATE INDEX idx_enforcement_workflows_protection_record ON public.ai_training_enforcement_workflows(protection_record_id);