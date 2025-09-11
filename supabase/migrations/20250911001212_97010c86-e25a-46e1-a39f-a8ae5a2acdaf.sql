-- Create missing tables for AI Agent Network
CREATE TABLE IF NOT EXISTS public.ai_monitoring_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  last_scan TIMESTAMP WITH TIME ZONE,
  threats_detected INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0.00,
  scan_frequency INTEGER DEFAULT 60,
  agent_config JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_threat_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES public.ai_monitoring_agents(id),
  platform TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  threat_level TEXT NOT NULL,
  confidence_score NUMERIC(5,4) NOT NULL,
  threat_data JSONB DEFAULT '{}',
  source_url TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_agent_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deployment_config JSONB NOT NULL,
  deployed_agents INTEGER DEFAULT 0,
  deployment_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ai_monitoring_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_deployments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own agents" ON public.ai_monitoring_agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own threat detections" ON public.ai_threat_detections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own deployments" ON public.ai_agent_deployments
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_monitoring_agents_user_id ON public.ai_monitoring_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_monitoring_agents_status ON public.ai_monitoring_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_threat_detections_user_id ON public.ai_threat_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_threat_detections_detected_at ON public.ai_threat_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_ai_agent_deployments_user_id ON public.ai_agent_deployments(user_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_ai_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_monitoring_agents_updated_at
  BEFORE UPDATE ON public.ai_monitoring_agents
  FOR EACH ROW EXECUTE FUNCTION update_ai_agents_updated_at();