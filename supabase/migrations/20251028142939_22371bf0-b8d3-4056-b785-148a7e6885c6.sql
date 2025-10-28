-- Create partner_monitoring_jobs table
CREATE TABLE public.partner_monitoring_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.enterprise_api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_url TEXT NOT NULL,
  monitor_type TEXT NOT NULL CHECK (monitor_type IN ('image', 'video', 'article', 'content')),
  scan_frequency TEXT NOT NULL CHECK (scan_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
  last_scan_at TIMESTAMP WITH TIME ZONE,
  next_scan_at TIMESTAMP WITH TIME ZONE,
  total_scans INTEGER DEFAULT 0,
  matches_found INTEGER DEFAULT 0,
  webhook_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partner_webhooks table
CREATE TABLE public.partner_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.enterprise_api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  total_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partner_scan_results table
CREATE TABLE public.partner_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.enterprise_api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monitoring_job_id UUID REFERENCES public.partner_monitoring_jobs(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('image', 'video', 'article', 'content')),
  content_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  matches_found INTEGER DEFAULT 0,
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  scan_data JSONB DEFAULT '{}',
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_monitoring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_scan_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_monitoring_jobs
CREATE POLICY "Users can manage their own monitoring jobs"
  ON public.partner_monitoring_jobs
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all monitoring jobs"
  ON public.partner_monitoring_jobs
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for partner_webhooks
CREATE POLICY "Users can manage their own webhooks"
  ON public.partner_webhooks
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all webhooks"
  ON public.partner_webhooks
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for partner_scan_results
CREATE POLICY "Users can view their own scan results"
  ON public.partner_scan_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all scan results"
  ON public.partner_scan_results
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_partner_monitoring_jobs_user_id ON public.partner_monitoring_jobs(user_id);
CREATE INDEX idx_partner_monitoring_jobs_api_key_id ON public.partner_monitoring_jobs(api_key_id);
CREATE INDEX idx_partner_monitoring_jobs_status ON public.partner_monitoring_jobs(status);
CREATE INDEX idx_partner_monitoring_jobs_next_scan ON public.partner_monitoring_jobs(next_scan_at) WHERE status = 'active';

CREATE INDEX idx_partner_webhooks_user_id ON public.partner_webhooks(user_id);
CREATE INDEX idx_partner_webhooks_api_key_id ON public.partner_webhooks(api_key_id);
CREATE INDEX idx_partner_webhooks_active ON public.partner_webhooks(is_active);

CREATE INDEX idx_partner_scan_results_user_id ON public.partner_scan_results(user_id);
CREATE INDEX idx_partner_scan_results_api_key_id ON public.partner_scan_results(api_key_id);
CREATE INDEX idx_partner_scan_results_monitoring_job_id ON public.partner_scan_results(monitoring_job_id);
CREATE INDEX idx_partner_scan_results_created_at ON public.partner_scan_results(created_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_partner_monitoring_jobs_updated_at
  BEFORE UPDATE ON public.partner_monitoring_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_webhooks_updated_at
  BEFORE UPDATE ON public.partner_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();