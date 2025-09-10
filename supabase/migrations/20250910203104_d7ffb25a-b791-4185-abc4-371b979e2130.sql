-- Create government defense monitoring tables
CREATE TABLE public.gov_defense_monitoring_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('threat_intelligence', 'ip_monitoring')),
    targets TEXT[] DEFAULT '{}',
    ip_assets JSONB DEFAULT '[]',
    classification_level TEXT DEFAULT 'unclassified' CHECK (classification_level IN ('unclassified', 'cui', 'confidential', 'secret')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    monitoring_duration_hours INTEGER DEFAULT 24,
    callback_url TEXT,
    alert_threshold TEXT CHECK (alert_threshold IN ('low', 'medium', 'high')),
    compliance_framework TEXT CHECK (compliance_framework IN ('itar', 'ear', 'cfius', 'dfars')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gov_defense_monitoring_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all gov defense monitoring sessions"
ON public.gov_defense_monitoring_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own gov defense monitoring sessions"
ON public.gov_defense_monitoring_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Create security alerts table
CREATE TABLE public.gov_defense_security_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id UUID REFERENCES public.gov_defense_monitoring_sessions(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gov_defense_security_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all gov defense security alerts"
ON public.gov_defense_security_alerts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own gov defense security alerts"
ON public.gov_defense_security_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Create IP monitoring table
CREATE TABLE public.gov_defense_ip_monitoring (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.gov_defense_monitoring_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('patent', 'trademark', 'copyright', 'trade_secret')),
    asset_id TEXT NOT NULL,
    classification TEXT NOT NULL,
    monitoring_scope TEXT[] DEFAULT '{}',
    alert_threshold TEXT NOT NULL CHECK (alert_threshold IN ('low', 'medium', 'high')),
    compliance_framework TEXT CHECK (compliance_framework IN ('itar', 'ear', 'cfius', 'dfars')),
    monitoring_status TEXT DEFAULT 'active' CHECK (monitoring_status IN ('active', 'paused', 'completed')),
    last_scan_at TIMESTAMP WITH TIME ZONE,
    findings_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gov_defense_ip_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all gov defense IP monitoring"
ON public.gov_defense_ip_monitoring
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own gov defense IP monitoring"
ON public.gov_defense_ip_monitoring
FOR SELECT
USING (auth.uid() = user_id);

-- Update enterprise API keys to include government defense permissions
ALTER TABLE public.enterprise_api_keys 
ADD COLUMN IF NOT EXISTS gov_defense_enabled BOOLEAN DEFAULT false;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_gov_defense_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gov_defense_monitoring_sessions_updated_at
  BEFORE UPDATE ON public.gov_defense_monitoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gov_defense_updated_at();

CREATE TRIGGER update_gov_defense_ip_monitoring_updated_at
  BEFORE UPDATE ON public.gov_defense_ip_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gov_defense_updated_at();