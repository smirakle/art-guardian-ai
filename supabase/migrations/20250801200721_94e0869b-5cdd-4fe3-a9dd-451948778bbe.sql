-- Portfolio Monitoring Production Readiness Migration
-- Fix security warnings and implement production-grade infrastructure

-- 1. Security Hardening: Fix function search paths and enhance RLS
ALTER FUNCTION public.get_user_dashboard_stats() SET search_path = public;
ALTER FUNCTION public.get_user_subscription() SET search_path = public;
ALTER FUNCTION public.user_has_feature(text) SET search_path = public;
ALTER FUNCTION public.get_portfolio_limit() SET search_path = public;
ALTER FUNCTION public.user_has_membership(uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.track_template_usage(text, text, uuid) SET search_path = public;
ALTER FUNCTION public.get_template_download_count(text) SET search_path = public;
ALTER FUNCTION public.get_all_template_download_counts() SET search_path = public;
ALTER FUNCTION public.schedule_compliance_reminder(uuid, text, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.generate_document_hash(text) SET search_path = public;
ALTER FUNCTION public.create_free_subscription_for_user(uuid) SET search_path = public;

-- 2. Create Portfolio Monitoring Rate Limits Table
CREATE TABLE IF NOT EXISTS public.portfolio_monitoring_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS for rate limits
ALTER TABLE public.portfolio_monitoring_rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits policies
CREATE POLICY "Users can view their own rate limits" 
ON public.portfolio_monitoring_rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" 
ON public.portfolio_monitoring_rate_limits 
FOR ALL 
USING (true);

-- 3. Create Portfolio Monitoring Metrics Table
CREATE TABLE IF NOT EXISTS public.portfolio_monitoring_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  user_id uuid,
  portfolio_id uuid,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for metrics
ALTER TABLE public.portfolio_monitoring_metrics ENABLE ROW LEVEL SECURITY;

-- Metrics policies
CREATE POLICY "Users can view their own metrics" 
ON public.portfolio_monitoring_metrics 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can create metrics" 
ON public.portfolio_monitoring_metrics 
FOR INSERT 
WITH CHECK (true);

-- 4. Create Portfolio Monitoring Audit Log Table
CREATE TABLE IF NOT EXISTS public.portfolio_monitoring_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for audit log
ALTER TABLE public.portfolio_monitoring_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies
CREATE POLICY "Users can view their own audit logs" 
ON public.portfolio_monitoring_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create audit logs" 
ON public.portfolio_monitoring_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Create Portfolio Monitoring Notifications Table
CREATE TABLE IF NOT EXISTS public.portfolio_monitoring_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.portfolio_monitoring_notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.portfolio_monitoring_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.portfolio_monitoring_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.portfolio_monitoring_notifications 
FOR INSERT 
WITH CHECK (true);

-- 6. Create Portfolio Monitoring Cache Table
CREATE TABLE IF NOT EXISTS public.portfolio_monitoring_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  cache_value jsonb NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for cache
ALTER TABLE public.portfolio_monitoring_cache ENABLE ROW LEVEL SECURITY;

-- Cache policies
CREATE POLICY "System can manage cache" 
ON public.portfolio_monitoring_cache 
FOR ALL 
USING (true);

-- 7. Create Portfolio Monitoring Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.portfolio_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_unit text NOT NULL,
  source_component text NOT NULL,
  metric_value numeric NOT NULL,
  additional_data jsonb DEFAULT '{}',
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for performance metrics
ALTER TABLE public.portfolio_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies
CREATE POLICY "Admins can view all performance metrics" 
ON public.portfolio_performance_metrics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create performance metrics" 
ON public.portfolio_performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_monitoring_rate_limits_user_endpoint ON public.portfolio_monitoring_rate_limits(user_id, endpoint, window_start);
CREATE INDEX IF NOT EXISTS idx_portfolio_monitoring_metrics_user_type ON public.portfolio_monitoring_metrics(user_id, metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_monitoring_audit_log_user_action ON public.portfolio_monitoring_audit_log(user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_monitoring_notifications_user_read ON public.portfolio_monitoring_notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_monitoring_cache_key_expires ON public.portfolio_monitoring_cache(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_metrics_type_recorded ON public.portfolio_performance_metrics(metric_type, recorded_at);

-- 9. Create Portfolio Monitoring Functions

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_portfolio_monitoring_rate_limit(
  user_id_param uuid,
  endpoint_param text,
  max_requests_param integer DEFAULT 100,
  window_minutes_param integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes_param) * 
    (window_minutes_param || ' minutes')::interval;
  
  -- Get or create rate limit record
  INSERT INTO public.portfolio_monitoring_rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (user_id_param, endpoint_param, window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET 
    request_count = portfolio_monitoring_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  -- Return true if under limit
  RETURN current_count <= max_requests_param;
END;
$$;

-- Audit logging function
CREATE OR REPLACE FUNCTION public.log_portfolio_monitoring_action(
  user_id_param uuid,
  action_param text,
  resource_type_param text,
  resource_id_param text DEFAULT NULL,
  details_param jsonb DEFAULT '{}',
  ip_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.portfolio_monitoring_audit_log (
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
$$;

-- Metrics recording function
CREATE OR REPLACE FUNCTION public.record_portfolio_monitoring_metric(
  metric_type_param text,
  metric_name_param text,
  metric_value_param numeric,
  user_id_param uuid DEFAULT NULL,
  portfolio_id_param uuid DEFAULT NULL,
  metadata_param jsonb DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.portfolio_monitoring_metrics (
    metric_type,
    metric_name,
    metric_value,
    user_id,
    portfolio_id,
    metadata
  ) VALUES (
    metric_type_param,
    metric_name_param,
    metric_value_param,
    user_id_param,
    portfolio_id_param,
    metadata_param
  );
END;
$$;

-- Notification creation function
CREATE OR REPLACE FUNCTION public.create_portfolio_monitoring_notification(
  user_id_param uuid,
  notification_type_param text,
  title_param text,
  message_param text,
  severity_param text DEFAULT 'info',
  action_url_param text DEFAULT NULL,
  metadata_param jsonb DEFAULT '{}',
  expires_hours_param integer DEFAULT 168
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.portfolio_monitoring_notifications (
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
$$;

-- Cache management functions
CREATE OR REPLACE FUNCTION public.get_portfolio_monitoring_cache(
  cache_key_param text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cache_value jsonb;
BEGIN
  -- Get cache value if not expired
  SELECT cache_value INTO cache_value
  FROM public.portfolio_monitoring_cache
  WHERE cache_key = cache_key_param
    AND expires_at > now();
  
  -- Update hit count
  IF cache_value IS NOT NULL THEN
    UPDATE public.portfolio_monitoring_cache
    SET hit_count = hit_count + 1,
        updated_at = now()
    WHERE cache_key = cache_key_param;
  END IF;
  
  RETURN cache_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_portfolio_monitoring_cache(
  cache_key_param text,
  cache_value_param jsonb,
  ttl_seconds_param integer DEFAULT 3600
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.portfolio_monitoring_cache (
    cache_key,
    cache_value,
    expires_at
  ) VALUES (
    cache_key_param,
    cache_value_param,
    now() + (ttl_seconds_param || ' seconds')::interval
  )
  ON CONFLICT (cache_key)
  DO UPDATE SET
    cache_value = cache_value_param,
    expires_at = now() + (ttl_seconds_param || ' seconds')::interval,
    updated_at = now();
END;
$$;

-- 10. Create triggers for audit logging
CREATE OR REPLACE FUNCTION public.audit_portfolio_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_portfolio_monitoring_action(
      NEW.user_id,
      'create_portfolio',
      'portfolio',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'monitoring_enabled', NEW.monitoring_enabled)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_portfolio_monitoring_action(
      NEW.user_id,
      'update_portfolio',
      'portfolio',
      NEW.id::text,
      jsonb_build_object(
        'old_monitoring_enabled', OLD.monitoring_enabled,
        'new_monitoring_enabled', NEW.monitoring_enabled,
        'name', NEW.name
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_portfolio_monitoring_action(
      OLD.user_id,
      'delete_portfolio',
      'portfolio',
      OLD.id::text,
      jsonb_build_object('name', OLD.name)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for portfolio audit logging
DROP TRIGGER IF EXISTS audit_portfolio_changes_trigger ON public.portfolios;
CREATE TRIGGER audit_portfolio_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.audit_portfolio_changes();

-- Create trigger for monitoring results audit logging
CREATE OR REPLACE FUNCTION public.audit_portfolio_monitoring_results()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  portfolio_user_id uuid;
BEGIN
  -- Get user_id from portfolio
  SELECT user_id INTO portfolio_user_id
  FROM public.portfolios
  WHERE id = NEW.portfolio_id;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_portfolio_monitoring_action(
      portfolio_user_id,
      'monitoring_scan_completed',
      'portfolio_monitoring_result',
      NEW.id::text,
      jsonb_build_object(
        'portfolio_id', NEW.portfolio_id,
        'total_matches', NEW.total_matches,
        'high_risk_matches', NEW.high_risk_matches
      )
    );
    
    -- Create notification for high-risk findings
    IF NEW.high_risk_matches > 0 THEN
      PERFORM public.create_portfolio_monitoring_notification(
        portfolio_user_id,
        'high_risk_detection',
        'High-Risk Copyright Matches Found',
        'We detected ' || NEW.high_risk_matches || ' high-risk copyright matches in your portfolio scan.',
        'critical',
        '/portfolio-monitoring?result=' || NEW.id::text,
        jsonb_build_object('result_id', NEW.id, 'high_risk_count', NEW.high_risk_matches)
      );
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for monitoring results
DROP TRIGGER IF EXISTS audit_portfolio_monitoring_results_trigger ON public.portfolio_monitoring_results;
CREATE TRIGGER audit_portfolio_monitoring_results_trigger
  AFTER INSERT ON public.portfolio_monitoring_results
  FOR EACH ROW EXECUTE FUNCTION public.audit_portfolio_monitoring_results();

-- 11. Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_portfolio_monitoring_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_portfolio_monitoring_rate_limits_updated_at
  BEFORE UPDATE ON public.portfolio_monitoring_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_portfolio_monitoring_updated_at();

CREATE TRIGGER update_portfolio_monitoring_cache_updated_at
  BEFORE UPDATE ON public.portfolio_monitoring_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_portfolio_monitoring_updated_at();

-- 12. Enable realtime for new tables
ALTER TABLE public.portfolio_monitoring_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.portfolio_monitoring_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.portfolio_monitoring_audit_log REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_monitoring_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_monitoring_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_monitoring_audit_log;