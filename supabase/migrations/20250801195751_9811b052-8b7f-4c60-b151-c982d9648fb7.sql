-- Fix function search path security issues for AI protection functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.user_has_feature(text) SET search_path = '';
ALTER FUNCTION public.get_user_subscription() SET search_path = '';
ALTER FUNCTION public.create_free_subscription_for_user(uuid) SET search_path = '';
ALTER FUNCTION public.get_artwork_limit() SET search_path = '';
ALTER FUNCTION public.get_portfolio_limit() SET search_path = '';
ALTER FUNCTION public.validate_role_change() SET search_path = '';
ALTER FUNCTION public.update_vote_counts() SET search_path = '';
ALTER FUNCTION public.update_post_counts() SET search_path = '';
ALTER FUNCTION public.get_user_dashboard_stats() SET search_path = '';
ALTER FUNCTION public.track_template_usage(text, text, uuid) SET search_path = '';
ALTER FUNCTION public.schedule_compliance_reminder(uuid, text, timestamp with time zone) SET search_path = '';
ALTER FUNCTION public.get_template_download_count(text) SET search_path = '';
ALTER FUNCTION public.get_all_template_download_counts() SET search_path = '';
ALTER FUNCTION public.generate_document_hash(text) SET search_path = '';

-- Create production-ready AI protection audit table
CREATE TABLE public.ai_protection_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.ai_protection_audit_log ENABLE ROW LEVEL SECURITY;

-- Create audit log policies
CREATE POLICY "Users can view their own audit logs"
  ON public.ai_protection_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON public.ai_protection_audit_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs"
  ON public.ai_protection_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create AI protection rate limiting table
CREATE TABLE public.ai_protection_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.ai_protection_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create rate limit policies
CREATE POLICY "Users can view their own rate limits"
  ON public.ai_protection_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.ai_protection_rate_limits
  FOR ALL
  USING (true);

-- Create AI protection metrics table
CREATE TABLE public.ai_protection_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on metrics
ALTER TABLE public.ai_protection_metrics ENABLE ROW LEVEL SECURITY;

-- Create metrics policies
CREATE POLICY "Admins can view all AI protection metrics"
  ON public.ai_protection_metrics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert AI protection metrics"
  ON public.ai_protection_metrics
  FOR INSERT
  WITH CHECK (true);

-- Create AI protection notifications table
CREATE TABLE public.ai_protection_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.ai_protection_notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can view their own AI protection notifications"
  ON public.ai_protection_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI protection notifications"
  ON public.ai_protection_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create AI protection notifications"
  ON public.ai_protection_notifications
  FOR INSERT
  WITH CHECK (true);

-- Create AI protection DMCA tracking table
CREATE TABLE public.ai_protection_dmca_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID NOT NULL REFERENCES ai_training_violations(id),
  user_id UUID NOT NULL,
  filed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'filed',
  platform TEXT NOT NULL,
  takedown_url TEXT,
  reference_number TEXT,
  response_data JSONB DEFAULT '{}',
  deadline_date TIMESTAMP WITH TIME ZONE,
  cost_usd NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on DMCA notices
ALTER TABLE public.ai_protection_dmca_notices ENABLE ROW LEVEL SECURITY;

-- Create DMCA notice policies
CREATE POLICY "Users can view their own DMCA notices"
  ON public.ai_protection_dmca_notices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own DMCA notices"
  ON public.ai_protection_dmca_notices
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create DMCA notices"
  ON public.ai_protection_dmca_notices
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_ai_protection_audit_log_user_id ON public.ai_protection_audit_log(user_id);
CREATE INDEX idx_ai_protection_audit_log_created_at ON public.ai_protection_audit_log(created_at DESC);
CREATE INDEX idx_ai_protection_rate_limits_user_endpoint ON public.ai_protection_rate_limits(user_id, endpoint);
CREATE INDEX idx_ai_protection_metrics_type_name ON public.ai_protection_metrics(metric_type, metric_name);
CREATE INDEX idx_ai_protection_notifications_user_read ON public.ai_protection_notifications(user_id, is_read);
CREATE INDEX idx_ai_protection_dmca_user_status ON public.ai_protection_dmca_notices(user_id, status);

-- Create audit logging function
CREATE OR REPLACE FUNCTION public.log_ai_protection_action(
  user_id_param UUID,
  action_param TEXT,
  resource_type_param TEXT,
  resource_id_param TEXT DEFAULT NULL,
  details_param JSONB DEFAULT '{}',
  ip_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.ai_protection_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    user_id_param,
    action_param,
    resource_type_param,
    resource_id_param,
    details_param,
    ip_param,
    user_agent_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create rate limiting check function
CREATE OR REPLACE FUNCTION public.check_ai_protection_rate_limit(
  user_id_param UUID,
  endpoint_param TEXT,
  max_requests_param INTEGER DEFAULT 100,
  window_minutes_param INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes_param) * 
    (window_minutes_param || ' minutes')::interval;
  
  -- Get or create rate limit record
  INSERT INTO public.ai_protection_rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (user_id_param, endpoint_param, window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET 
    request_count = ai_protection_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  -- Return true if under limit
  RETURN current_count <= max_requests_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create metrics recording function
CREATE OR REPLACE FUNCTION public.record_ai_protection_metric(
  metric_type_param TEXT,
  metric_name_param TEXT,
  metric_value_param NUMERIC,
  metadata_param JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.ai_protection_metrics (
    metric_type,
    metric_name,
    metric_value,
    metadata
  ) VALUES (
    metric_type_param,
    metric_name_param,
    metric_value_param,
    metadata_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create notification creation function
CREATE OR REPLACE FUNCTION public.create_ai_protection_notification(
  user_id_param UUID,
  notification_type_param TEXT,
  title_param TEXT,
  message_param TEXT,
  severity_param TEXT DEFAULT 'info',
  action_url_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}',
  expires_hours_param INTEGER DEFAULT 168
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.ai_protection_notifications (
    user_id,
    notification_type,
    title,
    message,
    severity,
    action_url,
    metadata,
    expires_at
  ) VALUES (
    user_id_param,
    notification_type_param,
    title_param,
    message_param,
    severity_param,
    action_url_param,
    metadata_param,
    now() + (expires_hours_param || ' hours')::interval
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add triggers for audit logging
CREATE OR REPLACE FUNCTION public.audit_ai_protection_records() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_ai_protection_action(
      NEW.user_id,
      'create_protection_record',
      'ai_protection_record',
      NEW.id::text,
      jsonb_build_object('protection_level', NEW.protection_level, 'filename', NEW.original_filename)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_ai_protection_action(
      NEW.user_id,
      'update_protection_record',
      'ai_protection_record',
      NEW.id::text,
      jsonb_build_object('old_active', OLD.is_active, 'new_active', NEW.is_active)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER audit_ai_protection_records_trigger
  AFTER INSERT OR UPDATE ON public.ai_protection_records
  FOR EACH ROW EXECUTE FUNCTION public.audit_ai_protection_records();

-- Add trigger for violation audit logging
CREATE OR REPLACE FUNCTION public.audit_ai_training_violations() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_ai_protection_action(
      NEW.user_id,
      'violation_detected',
      'ai_training_violation',
      NEW.id::text,
      jsonb_build_object('violation_type', NEW.violation_type, 'confidence', NEW.confidence_score, 'source', NEW.source_domain)
    );
    
    -- Create high-severity notification for high-confidence violations
    IF NEW.confidence_score > 0.8 THEN
      PERFORM public.create_ai_protection_notification(
        NEW.user_id,
        'high_confidence_violation',
        'High-Confidence AI Training Violation Detected',
        'We detected unauthorized use of your content in AI training with ' || (NEW.confidence_score * 100)::integer || '% confidence.',
        'critical',
        '/ai-protection?violation=' || NEW.id::text,
        jsonb_build_object('violation_id', NEW.id, 'confidence', NEW.confidence_score)
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_ai_protection_action(
      NEW.user_id,
      'violation_status_update',
      'ai_training_violation',
      NEW.id::text,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER audit_ai_training_violations_trigger
  AFTER INSERT OR UPDATE ON public.ai_training_violations
  FOR EACH ROW EXECUTE FUNCTION public.audit_ai_training_violations();