-- Create security audit table for enhanced logging
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  client_info JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create threat intelligence table
CREATE TABLE IF NOT EXISTS public.threat_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threat_type TEXT NOT NULL,
  source TEXT NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  threat_indicators JSONB NOT NULL DEFAULT '{}',
  first_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(threat_type, source)
);

-- Create government security configs table
CREATE TABLE IF NOT EXISTS public.government_security_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  ip_allowlist TEXT[] DEFAULT '{}',
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
  require_mfa BOOLEAN NOT NULL DEFAULT true,
  data_classification_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id)
);

-- Create government API rate limits table
CREATE TABLE IF NOT EXISTS public.government_api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_limit_key TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rate_limit_key, window_start)
);

-- Create government security events table
CREATE TABLE IF NOT EXISTS public.government_security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all security tables
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_security_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security audit log
CREATE POLICY "Admins can view all security audit logs" ON public.security_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can create security audit logs" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for security alerts
CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can create security alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for threat intelligence
CREATE POLICY "Admins can view threat intelligence" ON public.threat_intelligence
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can manage threat intelligence" ON public.threat_intelligence
  FOR ALL USING (true);

-- Create RLS policies for government security configs
CREATE POLICY "Admins can manage government security configs" ON public.government_security_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for government API rate limits
CREATE POLICY "System can manage government API rate limits" ON public.government_api_rate_limits
  FOR ALL USING (true);

-- Create RLS policies for government security events
CREATE POLICY "Admins can view government security events" ON public.government_security_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can create government security events" ON public.government_security_events
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_threat_type ON public.threat_intelligence(threat_type);
CREATE INDEX IF NOT EXISTS idx_government_api_rate_limits_key ON public.government_api_rate_limits(rate_limit_key);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_threat_intelligence_updated_at
  BEFORE UPDATE ON public.threat_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_security_configs_updated_at
  BEFORE UPDATE ON public.government_security_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_api_rate_limits_updated_at
  BEFORE UPDATE ON public.government_api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();