-- Create AI Agent Network tables for autonomous monitoring

-- AI Monitoring Agents table
CREATE TABLE public.ai_monitoring_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_scan TIMESTAMP WITH TIME ZONE,
  scan_frequency INTEGER NOT NULL DEFAULT 60, -- minutes
  threat_threshold NUMERIC NOT NULL DEFAULT 0.5,
  auto_response BOOLEAN NOT NULL DEFAULT false,
  predictive_analytics BOOLEAN NOT NULL DEFAULT true,
  success_rate NUMERIC DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  threats_detected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Threat Detections table
CREATE TABLE public.ai_threat_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  artwork_id UUID,
  platform TEXT NOT NULL,
  threat_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('critical', 'high', 'medium', 'low')),
  auto_response_generated BOOLEAN DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Auto Responses table
CREATE TABLE public.ai_auto_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  threat_count INTEGER NOT NULL DEFAULT 1,
  response_type TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Predictive Analyses table
CREATE TABLE public.ai_predictive_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  insights TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  prediction_horizon TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_monitoring_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictive_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Monitoring Agents
CREATE POLICY "Users can manage their own AI agents"
  ON public.ai_monitoring_agents
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for AI Threat Detections
CREATE POLICY "Users can view their own threat detections"
  ON public.ai_threat_detections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create threat detections"
  ON public.ai_threat_detections
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for AI Auto Responses
CREATE POLICY "Users can manage their own auto responses"
  ON public.ai_auto_responses
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for AI Predictive Analyses
CREATE POLICY "Users can view their own predictive analyses"
  ON public.ai_predictive_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create predictive analyses"
  ON public.ai_predictive_analyses
  FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_ai_agents_user_id ON public.ai_monitoring_agents(user_id);
CREATE INDEX idx_ai_agents_platform ON public.ai_monitoring_agents(platform_id);
CREATE INDEX idx_ai_threats_user_id ON public.ai_threat_detections(user_id);
CREATE INDEX idx_ai_threats_platform ON public.ai_threat_detections(platform);
CREATE INDEX idx_ai_threats_level ON public.ai_threat_detections(threat_level);
CREATE INDEX idx_ai_responses_user_id ON public.ai_auto_responses(user_id);
CREATE INDEX idx_ai_analyses_user_id ON public.ai_predictive_analyses(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_monitoring_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_responses_updated_at
  BEFORE UPDATE ON public.ai_auto_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();