-- Create real-time scanning tables for production-ready monitoring

-- Realtime scan sessions
CREATE TABLE IF NOT EXISTS public.realtime_scan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('instant', 'continuous', 'scheduled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  platforms TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'stopped', 'completed', 'failed')),
  artwork_count INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  platforms_scanned INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time scan updates (for continuous monitoring)
CREATE TABLE IF NOT EXISTS public.realtime_scan_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.realtime_scan_sessions(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  matches_found INTEGER NOT NULL DEFAULT 0,
  high_threats INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER,
  error_message TEXT,
  scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time matches (for storing detected matches)
CREATE TABLE IF NOT EXISTS public.realtime_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.realtime_scan_sessions(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_domain TEXT,
  confidence_score DOUBLE PRECISION NOT NULL,
  match_type TEXT NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform API configurations (for tracking which APIs are configured)
CREATE TABLE IF NOT EXISTS public.platform_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL UNIQUE,
  is_configured BOOLEAN NOT NULL DEFAULT false,
  api_key_configured BOOLEAN NOT NULL DEFAULT false,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  last_rate_limit_reset TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_usage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.realtime_scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_scan_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_api_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for realtime_scan_sessions
CREATE POLICY "Users can manage their own scan sessions" ON public.realtime_scan_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "System can create scan sessions" ON public.realtime_scan_sessions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for realtime_scan_updates
CREATE POLICY "Users can view their scan updates" ON public.realtime_scan_updates
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.realtime_scan_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create scan updates" ON public.realtime_scan_updates
  FOR INSERT WITH CHECK (true);

-- RLS Policies for realtime_matches
CREATE POLICY "Users can view their matches" ON public.realtime_matches
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.realtime_scan_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create matches" ON public.realtime_matches
  FOR INSERT WITH CHECK (true);

-- RLS Policies for platform_api_configs
CREATE POLICY "Admins can manage platform configs" ON public.platform_api_configs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view platform config status" ON public.platform_api_configs
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_realtime_scan_sessions_user_status 
  ON public.realtime_scan_sessions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_realtime_scan_updates_session_timestamp 
  ON public.realtime_scan_updates(session_id, scan_timestamp);

CREATE INDEX IF NOT EXISTS idx_realtime_matches_session_threat 
  ON public.realtime_matches(session_id, threat_level);

CREATE INDEX IF NOT EXISTS idx_realtime_matches_confidence 
  ON public.realtime_matches(confidence_score DESC);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_realtime_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_realtime_scan_sessions_updated_at
  BEFORE UPDATE ON public.realtime_scan_sessions
  FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_platform_api_configs_updated_at
  BEFORE UPDATE ON public.platform_api_configs
  FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();

-- Insert default platform configurations
INSERT INTO public.platform_api_configs (platform_name, is_configured, api_key_configured) VALUES
  ('google_images', true, true),
  ('bing_images', true, false),
  ('tineye', false, false),
  ('pinterest', false, false),
  ('instagram', false, false),
  ('etsy', false, false),
  ('amazon', false, false)
ON CONFLICT (platform_name) DO NOTHING;

-- Add realtime functionality for scan updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_scan_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_matches;