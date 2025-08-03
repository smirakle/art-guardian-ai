-- Create trademark monitoring tables with proper RLS policies and security

-- Create trademarks table
CREATE TABLE public.trademarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trademark_name TEXT NOT NULL,
  registration_number TEXT,
  application_number TEXT,
  filing_date DATE,
  registration_date DATE,
  renewal_date DATE,
  jurisdiction TEXT NOT NULL,
  trademark_class TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  goods_services TEXT,
  owner_name TEXT,
  owner_address TEXT,
  attorney_info JSONB DEFAULT '{}',
  priority_claims JSONB DEFAULT '[]',
  madrid_protocol BOOLEAN DEFAULT false,
  monitoring_enabled BOOLEAN DEFAULT true,
  last_monitored_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trademarks
ALTER TABLE public.trademarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for trademarks
CREATE POLICY "Users can manage their own trademarks"
ON public.trademarks
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trademarks"
ON public.trademarks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trademark alerts table
CREATE TABLE public.trademark_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id UUID NOT NULL REFERENCES public.trademarks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_url TEXT,
  source_domain TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0.75,
  status TEXT NOT NULL DEFAULT 'pending',
  auto_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  legal_action_taken BOOLEAN DEFAULT false,
  dmca_notice_sent BOOLEAN DEFAULT false,
  evidence_data JSONB DEFAULT '{}',
  geographic_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trademark alerts
ALTER TABLE public.trademark_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for trademark alerts
CREATE POLICY "Users can manage their own trademark alerts"
ON public.trademark_alerts
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create trademark alerts"
ON public.trademark_alerts
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create trademark monitoring scans table
CREATE TABLE public.trademark_monitoring_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id UUID NOT NULL REFERENCES public.trademarks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL DEFAULT 'standard',
  scan_status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  scan_duration_seconds INTEGER,
  platforms_scanned TEXT[] DEFAULT '{}',
  total_results_found INTEGER DEFAULT 0,
  potential_infringements INTEGER DEFAULT 0,
  high_risk_matches INTEGER DEFAULT 0,
  medium_risk_matches INTEGER DEFAULT 0,
  low_risk_matches INTEGER DEFAULT 0,
  scan_parameters JSONB DEFAULT '{}',
  error_details JSONB,
  geographic_scope TEXT[] DEFAULT '{}',
  search_terms_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trademark monitoring scans
ALTER TABLE public.trademark_monitoring_scans ENABLE ROW LEVEL SECURITY;

-- RLS policies for trademark monitoring scans
CREATE POLICY "Users can view their own trademark scans"
ON public.trademark_monitoring_scans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can manage trademark scans"
ON public.trademark_monitoring_scans
FOR ALL
TO service_role
USING (true);

-- Create trademark search results table
CREATE TABLE public.trademark_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.trademark_monitoring_scans(id) ON DELETE CASCADE,
  trademark_id UUID NOT NULL REFERENCES public.trademarks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL,
  match_type TEXT NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  source_platform TEXT NOT NULL,
  source_url TEXT,
  source_title TEXT,
  source_description TEXT,
  trademark_text TEXT,
  trademark_image_url TEXT,
  applicant_name TEXT,
  application_number TEXT,
  filing_date DATE,
  status TEXT,
  trademark_class TEXT[],
  goods_services TEXT,
  geographic_scope TEXT,
  similarity_analysis JSONB DEFAULT '{}',
  legal_analysis JSONB DEFAULT '{}',
  recommended_actions TEXT[] DEFAULT '{}',
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  evidence_preserved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trademark search results
ALTER TABLE public.trademark_search_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for trademark search results
CREATE POLICY "Users can view their own trademark search results"
ON public.trademark_search_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own trademark search results"
ON public.trademark_search_results
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create trademark search results"
ON public.trademark_search_results
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create trademark renewals table
CREATE TABLE public.trademark_renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id UUID NOT NULL REFERENCES public.trademarks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renewal_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  grace_period_end DATE,
  renewal_fee_usd NUMERIC(10,2),
  reminder_schedule JSONB DEFAULT '{}',
  reminder_sent BOOLEAN DEFAULT false,
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  filed_date DATE,
  confirmation_number TEXT,
  receipt_url TEXT,
  attorney_handling TEXT,
  notes TEXT,
  automatic_renewal BOOLEAN DEFAULT false,
  payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trademark renewals
ALTER TABLE public.trademark_renewals ENABLE ROW LEVEL SECURITY;

-- RLS policies for trademark renewals
CREATE POLICY "Users can manage their own trademark renewals"
ON public.trademark_renewals
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create trademark portfolio metrics table
CREATE TABLE public.trademark_portfolio_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_trademarks INTEGER NOT NULL DEFAULT 0,
  active_trademarks INTEGER NOT NULL DEFAULT 0,
  pending_applications INTEGER NOT NULL DEFAULT 0,
  expired_trademarks INTEGER NOT NULL DEFAULT 0,
  renewals_due_30_days INTEGER NOT NULL DEFAULT 0,
  renewals_due_90_days INTEGER NOT NULL DEFAULT 0,
  monitoring_alerts_count INTEGER NOT NULL DEFAULT 0,
  high_risk_alerts_count INTEGER NOT NULL DEFAULT 0,
  unresolved_alerts_count INTEGER NOT NULL DEFAULT 0,
  total_scans_performed INTEGER NOT NULL DEFAULT 0,
  average_scan_duration_minutes NUMERIC(10,2),
  portfolio_value_estimate_usd NUMERIC(15,2),
  geographic_coverage TEXT[] DEFAULT '{}',
  trademark_classes_covered TEXT[] DEFAULT '{}',
  protection_score INTEGER DEFAULT 0,
  compliance_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trademark portfolio metrics
ALTER TABLE public.trademark_portfolio_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for trademark portfolio metrics
CREATE POLICY "Users can view their own trademark portfolio metrics"
ON public.trademark_portfolio_metrics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can manage trademark portfolio metrics"
ON public.trademark_portfolio_metrics
FOR ALL
TO service_role
USING (true);

-- Create indexes for performance
CREATE INDEX idx_trademarks_user_id ON public.trademarks(user_id);
CREATE INDEX idx_trademarks_status ON public.trademarks(status);
CREATE INDEX idx_trademarks_renewal_date ON public.trademarks(renewal_date);
CREATE INDEX idx_trademarks_monitoring_enabled ON public.trademarks(monitoring_enabled);

CREATE INDEX idx_trademark_alerts_trademark_id ON public.trademark_alerts(trademark_id);
CREATE INDEX idx_trademark_alerts_user_id ON public.trademark_alerts(user_id);
CREATE INDEX idx_trademark_alerts_status ON public.trademark_alerts(status);
CREATE INDEX idx_trademark_alerts_severity ON public.trademark_alerts(severity);
CREATE INDEX idx_trademark_alerts_created_at ON public.trademark_alerts(created_at);

CREATE INDEX idx_trademark_scans_trademark_id ON public.trademark_monitoring_scans(trademark_id);
CREATE INDEX idx_trademark_scans_user_id ON public.trademark_monitoring_scans(user_id);
CREATE INDEX idx_trademark_scans_status ON public.trademark_monitoring_scans(scan_status);
CREATE INDEX idx_trademark_scans_started_at ON public.trademark_monitoring_scans(started_at);

CREATE INDEX idx_trademark_results_scan_id ON public.trademark_search_results(scan_id);
CREATE INDEX idx_trademark_results_trademark_id ON public.trademark_search_results(trademark_id);
CREATE INDEX idx_trademark_results_user_id ON public.trademark_search_results(user_id);
CREATE INDEX idx_trademark_results_confidence ON public.trademark_search_results(confidence_score);
CREATE INDEX idx_trademark_results_risk_level ON public.trademark_search_results(risk_level);

CREATE INDEX idx_trademark_renewals_trademark_id ON public.trademark_renewals(trademark_id);
CREATE INDEX idx_trademark_renewals_user_id ON public.trademark_renewals(user_id);
CREATE INDEX idx_trademark_renewals_due_date ON public.trademark_renewals(due_date);
CREATE INDEX idx_trademark_renewals_status ON public.trademark_renewals(status);

CREATE INDEX idx_trademark_metrics_user_id ON public.trademark_portfolio_metrics(user_id);
CREATE INDEX idx_trademark_metrics_date ON public.trademark_portfolio_metrics(metric_date);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_trademarks_updated_at
  BEFORE UPDATE ON public.trademarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trademark_alerts_updated_at
  BEFORE UPDATE ON public.trademark_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trademark_renewals_updated_at
  BEFORE UPDATE ON public.trademark_renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();