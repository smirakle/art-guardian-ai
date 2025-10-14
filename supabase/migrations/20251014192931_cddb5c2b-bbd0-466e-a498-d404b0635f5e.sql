-- Fix Function Search Path Security Issues
-- Add SET search_path = 'public' to all functions missing it

-- Update all security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_moonpay_transactions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.support_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.role = 'admin' AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    IF TG_OP = 'INSERT' AND NEW.user_id IN (
      SELECT id FROM auth.users WHERE email = 'shc302@g.harvard.edu'
    ) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Only administrators can assign admin roles';
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.security_audit_log (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(), 'role_change', 'user_roles', NEW.user_id::text,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'target_user_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_segment_size(segment_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM public.email_subscribers 
  WHERE user_id = (SELECT user_id FROM public.email_subscriber_segments WHERE id = segment_id);
  
  UPDATE public.email_subscriber_segments 
  SET subscriber_count = count_result 
  WHERE id = segment_id;
  
  RETURN count_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_enterprise_api_rate_limit(api_key_param text, endpoint_param text DEFAULT '/')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_record RECORD;
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT ak.id, ak.rate_limit_requests, ak.rate_limit_window_minutes, ak.is_active
  INTO key_record
  FROM public.enterprise_api_keys ak
  WHERE ak.api_key = api_key_param AND ak.is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / key_record.rate_limit_window_minutes) * 
    (key_record.rate_limit_window_minutes || ' minutes')::interval;
  
  INSERT INTO public.enterprise_api_rate_limits (api_key_id, window_start, request_count)
  VALUES (key_record.id, window_start, 1)
  ON CONFLICT (api_key_id, window_start)
  DO UPDATE SET 
    request_count = enterprise_api_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  RETURN current_count <= key_record.rate_limit_requests;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_enterprise_api_usage(
  api_key_param text,
  endpoint_param text,
  method_param text,
  status_code_param integer,
  response_time_ms_param integer DEFAULT NULL,
  ip_address_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL,
  error_message_param text DEFAULT NULL,
  metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_record RECORD;
BEGIN
  SELECT ak.id, ak.user_id
  INTO key_record
  FROM public.enterprise_api_keys ak
  WHERE ak.api_key = api_key_param AND ak.is_active = true;
  
  IF FOUND THEN
    INSERT INTO public.enterprise_api_usage (
      api_key_id, user_id, endpoint, method, status_code,
      response_time_ms, ip_address, user_agent, error_message, metadata
    ) VALUES (
      key_record.id, key_record.user_id, endpoint_param, method_param, status_code_param,
      response_time_ms_param, ip_address_param, user_agent_param, error_message_param, metadata_param
    );
    
    UPDATE public.enterprise_api_keys
    SET last_used_at = now()
    WHERE id = key_record.id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_government_api_key(api_key_param text, required_permission text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_record RECORD;
  result JSONB;
BEGIN
  SELECT 
    gak.*, ga.agency_name, ga.agency_code, ga.security_clearance_level,
    ga.is_active as agency_active, ga.is_verified as agency_verified
  INTO key_record
  FROM public.government_api_keys gak
  JOIN public.government_agencies ga ON gak.agency_id = ga.id
  WHERE gak.api_key = api_key_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid API key');
  END IF;
  
  IF NOT key_record.is_active OR NOT key_record.agency_active THEN
    RETURN jsonb_build_object('valid', false, 'error', 'API key or agency is inactive');
  END IF;
  
  IF NOT key_record.agency_verified THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Agency not verified');
  END IF;
  
  IF key_record.expires_at IS NOT NULL AND key_record.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'API key has expired');
  END IF;
  
  IF required_permission IS NOT NULL THEN
    IF NOT (key_record.permissions ? required_permission) THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Insufficient permissions for ' || required_permission);
    END IF;
  END IF;
  
  UPDATE public.government_api_keys
  SET last_used_at = now()
  WHERE id = key_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'agency_id', key_record.agency_id,
    'agency_name', key_record.agency_name,
    'agency_code', key_record.agency_code,
    'security_clearance', key_record.security_clearance_level,
    'permissions', key_record.permissions,
    'classification', key_record.security_classification
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_partner_api_usage(
  user_id_param uuid,
  endpoint_param text DEFAULT 'general',
  calls_count_param integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT ps.*, pt.api_calls_included 
  INTO subscription_record
  FROM public.partner_subscriptions ps
  JOIN public.partner_pricing_tiers pt ON ps.tier_id = pt.id
  WHERE ps.user_id = user_id_param 
    AND ps.status = 'active'
    AND ps.current_period_end > now()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF subscription_record.api_calls_used + calls_count_param > subscription_record.api_calls_included THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.partner_subscriptions
  SET api_calls_used = api_calls_used + calls_count_param, updated_at = now()
  WHERE id = subscription_record.id;
  
  INSERT INTO public.partner_subscription_usage (
    subscription_id, usage_date, api_calls_count, endpoint_usage
  ) VALUES (
    subscription_record.id, CURRENT_DATE, calls_count_param,
    jsonb_build_object(endpoint_param, calls_count_param)
  )
  ON CONFLICT (subscription_id, usage_date)
  DO UPDATE SET
    api_calls_count = partner_subscription_usage.api_calls_count + calls_count_param,
    endpoint_usage = partner_subscription_usage.endpoint_usage || 
      jsonb_build_object(endpoint_param, COALESCE((partner_subscription_usage.endpoint_usage->>endpoint_param)::INTEGER, 0) + calls_count_param),
    updated_at = now();
  
  RETURN TRUE;
END;
$function$;

-- Tighten RLS Policies for Sensitive Data
-- Require authentication for user-specific data

-- Update policies to require authentication (not allow anonymous)
DROP POLICY IF EXISTS "Users can manage only their own advanced alerts" ON public.advanced_alerts;
CREATE POLICY "Authenticated users can manage their own advanced alerts"
ON public.advanced_alerts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage only their own ai agent deployments" ON public.ai_agent_deployments;
CREATE POLICY "Authenticated users can manage their own ai agent deployments"
ON public.ai_agent_deployments
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage only their own ai auto responses" ON public.ai_auto_responses;
CREATE POLICY "Authenticated users can manage their own ai auto responses"
ON public.ai_auto_responses
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own AI detection results" ON public.ai_detection_results;
CREATE POLICY "Authenticated users can manage their own AI detection results"
ON public.ai_detection_results
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own monitoring agents" ON public.ai_monitoring_agents;
CREATE POLICY "Authenticated users can manage their own monitoring agents"
ON public.ai_monitoring_agents
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own threat detections" ON public.ai_threat_detections;
CREATE POLICY "Authenticated users can view their own threat detections"
ON public.ai_threat_detections
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own alert channels" ON public.alert_channels;
CREATE POLICY "Authenticated users can manage their own alert channels"
ON public.alert_channels
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own batch processes" ON public.batch_processing_queue;
CREATE POLICY "Authenticated users can manage their own batch processes"
ON public.batch_processing_queue
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own blockchain licenses" ON public.blockchain_licenses;
CREATE POLICY "Authenticated users can manage their own blockchain licenses"
ON public.blockchain_licenses
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own ownership registrations" ON public.blockchain_ownership_registry;
CREATE POLICY "Authenticated users can manage their own ownership registrations"
ON public.blockchain_ownership_registry
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);