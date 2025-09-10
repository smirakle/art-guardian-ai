-- Clean up existing threat intelligence policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view threat intelligence" ON public.threat_intelligence;
DROP POLICY IF EXISTS "System can manage threat intelligence" ON public.threat_intelligence;

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
ALTER TABLE public.government_security_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security audit log
CREATE POLICY "Admins can view all security audit logs" ON public.security_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create security audit logs" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for security alerts
CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create security alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);

-- Recreate threat intelligence policies with correct naming
CREATE POLICY "Admins can view enhanced threat intelligence" ON public.threat_intelligence
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage enhanced threat intelligence" ON public.threat_intelligence
  FOR ALL USING (true);

-- Create RLS policies for government security configs
CREATE POLICY "Admins can manage government security configs" ON public.government_security_configs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for government API rate limits
CREATE POLICY "System can manage government API rate limits" ON public.government_api_rate_limits
  FOR ALL USING (true);

-- Create RLS policies for government security events
CREATE POLICY "Admins can view government security events" ON public.government_security_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create government security events" ON public.government_security_events
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON public.security_alerts(status);