-- Phase 1: Core Protection Infrastructure
-- AI Detection Results Table
CREATE TABLE public.ai_detection_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artwork_id UUID REFERENCES public.artwork(id),
  detection_type TEXT NOT NULL, -- 'deepfake', 'ai_generated', 'forgery'
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  ai_model_used TEXT NOT NULL,
  detection_metadata JSONB NOT NULL DEFAULT '{}',
  source_platforms TEXT[] DEFAULT '{}',
  threat_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'false_positive', 'resolved'
  automated_actions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time Monitoring Sessions
CREATE TABLE public.realtime_monitoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'continuous', 'scheduled', 'manual'
  platforms_monitored TEXT[] DEFAULT '{}',
  keywords_monitored TEXT[] DEFAULT '{}',
  image_fingerprints TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'error'
  detections_count INTEGER DEFAULT 0,
  high_threat_count INTEGER DEFAULT 0,
  session_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One-Click Protection Records
CREATE TABLE public.one_click_protections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artwork_id UUID REFERENCES public.artwork(id),
  protection_type TEXT NOT NULL, -- 'dmca', 'legal_notice', 'takedown_request'
  target_platforms TEXT[] DEFAULT '{}',
  infringing_urls TEXT[] DEFAULT '{}',
  legal_documents JSONB DEFAULT '{}',
  automation_settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated', 'in_progress', 'completed', 'failed'
  results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_click_protections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own AI detection results" 
ON public.ai_detection_results FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "System can create AI detection results" 
ON public.ai_detection_results FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can manage their own monitoring sessions" 
ON public.realtime_monitoring_sessions FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own protection records" 
ON public.one_click_protections FOR ALL 
USING (auth.uid() = user_id);

-- Audit triggers
CREATE TRIGGER audit_ai_detection_results
  AFTER INSERT OR UPDATE ON public.ai_detection_results
  FOR EACH ROW EXECUTE FUNCTION public.audit_ai_protection_records();

-- Update timestamp triggers
CREATE TRIGGER update_ai_detection_results_updated_at
  BEFORE UPDATE ON public.ai_detection_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_realtime_monitoring_sessions_updated_at
  BEFORE UPDATE ON public.realtime_monitoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_one_click_protections_updated_at
  BEFORE UPDATE ON public.one_click_protections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();