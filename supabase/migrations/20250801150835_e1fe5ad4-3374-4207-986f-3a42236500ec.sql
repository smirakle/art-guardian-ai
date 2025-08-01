-- Create tables for profile monitoring system

-- Profile scan results table
CREATE TABLE IF NOT EXISTS public.profile_scan_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_id uuid NOT NULL REFERENCES public.profile_monitoring_targets(id) ON DELETE CASCADE,
  scan_date date NOT NULL DEFAULT CURRENT_DATE,
  platform_name text NOT NULL,
  profile_url text,
  profile_username text,
  profile_display_name text,
  profile_image_url text,
  similarity_score double precision NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profile impersonation alerts table
CREATE TABLE IF NOT EXISTS public.profile_impersonation_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_id uuid NOT NULL REFERENCES public.profile_monitoring_targets(id) ON DELETE CASCADE,
  scan_result_id uuid REFERENCES public.profile_scan_results(id) ON DELETE SET NULL,
  alert_type text NOT NULL DEFAULT 'impersonation',
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  description text,
  platform_name text,
  source_url text,
  recommended_actions jsonb DEFAULT '[]',
  is_acknowledged boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profile risk assessments table
CREATE TABLE IF NOT EXISTS public.profile_risk_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_id uuid NOT NULL REFERENCES public.profile_monitoring_targets(id) ON DELETE CASCADE,
  overall_risk_score integer NOT NULL DEFAULT 0,
  impersonation_risk integer NOT NULL DEFAULT 0,
  data_exposure_risk integer NOT NULL DEFAULT 0,
  social_engineering_risk integer NOT NULL DEFAULT 0,
  reputation_risk integer NOT NULL DEFAULT 0,
  recommendations jsonb DEFAULT '[]',
  risk_factors jsonb DEFAULT '[]',
  assessment_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_impersonation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_scan_results
CREATE POLICY "Users can view their own scan results"
  ON public.profile_scan_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create scan results"
  ON public.profile_scan_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own scan results"
  ON public.profile_scan_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for profile_impersonation_alerts
CREATE POLICY "Users can manage their own alerts"
  ON public.profile_impersonation_alerts FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for profile_risk_assessments
CREATE POLICY "Users can view their own risk assessments"
  ON public.profile_risk_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create risk assessments"
  ON public.profile_risk_assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own risk assessments"
  ON public.profile_risk_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_profile_scan_results_updated_at
  BEFORE UPDATE ON public.profile_scan_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_impersonation_alerts_updated_at
  BEFORE UPDATE ON public.profile_impersonation_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_risk_assessments_updated_at
  BEFORE UPDATE ON public.profile_risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_scan_results_user_id ON public.profile_scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_scan_results_target_id ON public.profile_scan_results(target_id);
CREATE INDEX IF NOT EXISTS idx_profile_scan_results_platform ON public.profile_scan_results(platform_name);

CREATE INDEX IF NOT EXISTS idx_profile_alerts_user_id ON public.profile_impersonation_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_alerts_target_id ON public.profile_impersonation_alerts(target_id);
CREATE INDEX IF NOT EXISTS idx_profile_alerts_severity ON public.profile_impersonation_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_profile_risk_user_id ON public.profile_risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_risk_target_id ON public.profile_risk_assessments(target_id);