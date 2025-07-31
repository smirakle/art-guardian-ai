-- Create threat intelligence table for real-time threat monitoring
CREATE TABLE IF NOT EXISTS public.threat_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('domain', 'ip', 'url', 'hash', 'email')),
  indicator_value TEXT NOT NULL,
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  threat_level TEXT NOT NULL DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deepfake analysis results table
CREATE TABLE IF NOT EXISTS public.deepfake_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  is_deepfake BOOLEAN NOT NULL DEFAULT false,
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  manipulation_type TEXT,
  analysis_methods TEXT[] NOT NULL DEFAULT '{}',
  facial_artifacts TEXT[] NOT NULL DEFAULT '{}',
  temporal_inconsistencies TEXT[] NOT NULL DEFAULT '{}',
  metadata_anomalies TEXT[] NOT NULL DEFAULT '{}',
  threat_level TEXT NOT NULL DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  technical_details JSONB NOT NULL DEFAULT '{}',
  countermeasures TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitoring sessions table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  monitoring_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stopped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deepfake_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Threat intelligence - read by admins, insertable by system
CREATE POLICY "Admins can view threat intelligence" ON public.threat_intelligence FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create threat intelligence" ON public.threat_intelligence FOR INSERT
  WITH CHECK (true);

-- Deepfake analysis results - read only for users
CREATE POLICY "Anyone can view deepfake analysis results" ON public.deepfake_analysis_results FOR SELECT
  USING (true);

CREATE POLICY "System can create deepfake analysis results" ON public.deepfake_analysis_results FOR INSERT
  WITH CHECK (true);

-- Monitoring sessions - users can view their own
CREATE POLICY "Users can view their monitoring sessions" ON public.monitoring_sessions FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_indicator_value ON public.threat_intelligence(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_threat_level ON public.threat_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_source ON public.threat_intelligence(source);
CREATE INDEX IF NOT EXISTS idx_deepfake_analysis_media_url ON public.deepfake_analysis_results(media_url);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_user_id ON public.monitoring_sessions(user_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_threat_intelligence_updated_at ON public.threat_intelligence;
CREATE TRIGGER update_threat_intelligence_updated_at
  BEFORE UPDATE ON public.threat_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();