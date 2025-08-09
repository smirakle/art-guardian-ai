-- Fix anonymous access policies for better security

-- Update ai_document_tracers policies to prevent anonymous access
DROP POLICY IF EXISTS "System can insert document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can view their own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can update their own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can delete their own document tracers" ON public.ai_document_tracers;

-- Recreate with proper authentication checks
CREATE POLICY "System can insert document tracers" ON public.ai_document_tracers 
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view their own document tracers" ON public.ai_document_tracers 
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own document tracers" ON public.ai_document_tracers 
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own document tracers" ON public.ai_document_tracers 
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update ai_protection_records policies to prevent anonymous access
DROP POLICY IF EXISTS "Users can view their own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can update their own protection records" ON public.ai_protection_records;

CREATE POLICY "Users can view their own protection records" ON public.ai_protection_records 
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own protection records" ON public.ai_protection_records 
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update ai_training_violations policies 
DROP POLICY IF EXISTS "Users can view their own violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can update their own violations" ON public.ai_training_violations;

CREATE POLICY "Users can view their own violations" ON public.ai_training_violations 
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own violations" ON public.ai_training_violations 
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update portfolio_monitoring_audit_log policy
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.portfolio_monitoring_audit_log;

CREATE POLICY "Users can view their own audit logs" ON public.portfolio_monitoring_audit_log 
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Add search path to vulnerable functions
CREATE OR REPLACE FUNCTION public.check_ai_protection_rate_limit(
  user_id_param uuid, 
  endpoint_param text, 
  max_requests_param integer DEFAULT 100, 
  window_minutes_param integer DEFAULT 60
)
RETURNS boolean
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
$$;

CREATE OR REPLACE FUNCTION public.create_ai_protection_notification(
  user_id_param uuid, 
  notification_type_param text, 
  title_param text, 
  message_param text, 
  severity_param text DEFAULT 'info', 
  action_url_param text DEFAULT NULL, 
  metadata_param jsonb DEFAULT '{}', 
  expires_hours_param integer DEFAULT 168
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;