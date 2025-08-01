-- Production Readiness Security Hardening
-- Fix function search path vulnerabilities

-- 1. Fix all function search paths to be immutable for security
DROP FUNCTION IF EXISTS public.calculate_next_execution(text, timestamp with time zone, jsonb);
CREATE OR REPLACE FUNCTION public.calculate_next_execution(schedule_type text, execution_time timestamp with time zone, recurrence_pattern jsonb)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  CASE schedule_type
    WHEN 'once' THEN
      RETURN NULL; -- One-time execution
    WHEN 'daily' THEN
      RETURN execution_time + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN execution_time + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN execution_time + INTERVAL '1 month';
    WHEN 'continuous' THEN
      RETURN execution_time + INTERVAL '1 hour'; -- Default continuous interval
    ELSE
      RETURN NULL;
  END CASE;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_next_execution();
CREATE OR REPLACE FUNCTION public.update_next_execution()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.last_executed IS NOT NULL AND NEW.schedule_type != 'once' THEN
    NEW.next_execution = public.calculate_next_execution(
      NEW.schedule_type,
      NEW.last_executed,
      NEW.recurrence_pattern
    );
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.get_user_email_verified();
CREATE OR REPLACE FUNCTION public.get_user_email_verified()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$
  SELECT COALESCE(email_confirmed_at IS NOT NULL, false)
  FROM auth.users 
  WHERE id = auth.uid();
$function$;

DROP FUNCTION IF EXISTS public.user_has_white_label_access();
CREATE OR REPLACE FUNCTION public.user_has_white_label_access()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND s.plan_id IN ('professional', 'enterprise')
    AND s.white_label_enabled = true
    AND s.current_period_end > now()
  );
$function$;

DROP FUNCTION IF EXISTS public.validate_role_change();
CREATE OR REPLACE FUNCTION public.validate_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent privilege escalation - only admins can assign admin role
  IF NEW.role = 'admin' AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    -- Special case: during user creation via handle_new_user trigger
    IF TG_OP = 'INSERT' AND NEW.user_id IN (
      SELECT id FROM auth.users WHERE email = 'shc302@g.harvard.edu'
    ) THEN
      -- Allow admin role assignment for the designated admin email
      RETURN NEW;
    END IF;
    
    RAISE EXCEPTION 'Only administrators can assign admin roles';
  END IF;
  
  -- Log role changes for audit
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.security_audit_log (
      user_id, 
      action, 
      resource_type, 
      resource_id, 
      details
    ) VALUES (
      auth.uid(),
      'role_change',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_user_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.validate_admin_token(text);
CREATE OR REPLACE FUNCTION public.validate_admin_token(token_hash text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the provided token hash matches the stored admin token
  -- This should be set through environment variables, not hardcoded
  RETURN token_hash = encode(sha256(convert_to(current_setting('app.admin_token', true), 'UTF8')), 'hex');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

DROP FUNCTION IF EXISTS public.is_valid_admin_session(text);
CREATE OR REPLACE FUNCTION public.is_valid_admin_session(session_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_sessions 
    WHERE session_token = $1 
    AND expires_at > now() 
    AND is_active = true
  );
END;
$function$;

DROP FUNCTION IF EXISTS public.get_user_white_label_org();
CREATE OR REPLACE FUNCTION public.get_user_white_label_org()
 RETURNS TABLE(org_id uuid, org_name text, org_slug text, is_owner boolean, user_role text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    wlo.id,
    wlo.name,
    wlo.slug,
    true as is_owner,
    'owner'::text as user_role
  FROM public.white_label_organizations wlo
  WHERE wlo.owner_id = auth.uid()
  AND wlo.is_active = true
  
  UNION ALL
  
  SELECT 
    wlo.id,
    wlo.name,
    wlo.slug,
    false as is_owner,
    wlu.role
  FROM public.white_label_organizations wlo
  JOIN public.white_label_users wlu ON wlo.id = wlu.organization_id
  WHERE wlu.user_id = auth.uid()
  AND wlo.is_active = true
  AND wlu.is_active = true
  
  LIMIT 1;
$function$;

DROP FUNCTION IF EXISTS public.user_has_feature(text);
CREATE OR REPLACE FUNCTION public.user_has_feature(feature_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH user_sub AS (
    SELECT * FROM public.get_user_subscription()
  )
  SELECT CASE 
    WHEN NOT EXISTS (SELECT 1 FROM user_sub WHERE is_active = true) THEN false
    WHEN feature_name = 'basic_monitoring' THEN true
    WHEN feature_name = 'visual_recognition' THEN true
    WHEN feature_name = 'community_access' THEN true
    WHEN feature_name = 'legal_templates' THEN true
    WHEN feature_name = 'basic_uploads' THEN true
    WHEN feature_name = 'portfolio_monitoring' THEN true
    WHEN feature_name = 'portfolio_creation' THEN true
    WHEN feature_name = 'portfolio_basic_scanning' THEN true
    WHEN feature_name = 'blockchain_verification' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'real_time_monitoring' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'portfolio_advanced_scanning' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'portfolio_analytics' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'portfolio_alerts' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'automated_dmca' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'white_label' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'enterprise_integrations' THEN (
      SELECT plan_id IN ('enterprise') FROM user_sub
    )
    WHEN feature_name = 'social_media_monitoring' THEN (
      SELECT (plan_id IN ('professional', 'enterprise') AND social_media_addon = true) OR social_media_addon = true FROM user_sub
    )
    WHEN feature_name = 'deepfake_detection' THEN (
      SELECT plan_id IN ('professional', 'enterprise') OR deepfake_addon = true FROM user_sub
    )
    WHEN feature_name = 'advanced_ai' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'priority_support' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'unlimited_portfolios' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'portfolio_scheduled_scans' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'portfolio_multi_platform' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    ELSE false
  END;
$function$;

DROP FUNCTION IF EXISTS public.create_free_subscription_for_user(uuid);
CREATE OR REPLACE FUNCTION public.create_free_subscription_for_user(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create if user doesn't already have a subscription
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = _user_id
  ) THEN
    INSERT INTO public.subscriptions (
      user_id,
      plan_id,
      status,
      billing_cycle,
      current_period_start,
      current_period_end,
      social_media_addon,
      deepfake_addon
    ) VALUES (
      _user_id,
      'free',
      'active',
      'monthly',
      now(),
      now() + interval '100 years', -- Free tier never expires
      false,
      false
    );
  END IF;
END;
$function$;

DROP FUNCTION IF EXISTS public.get_user_dashboard_stats();
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats()
 RETURNS TABLE(protected_artworks bigint, total_scans bigint, high_threats bigint, total_portfolios bigint, protection_score integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as protected_artworks,
    COUNT(DISTINCT cm.id) as total_scans,
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.threat_level = 'high') as high_threats,
    COUNT(DISTINCT p.id) as total_portfolios,
    CASE 
      WHEN COUNT(DISTINCT a.id) = 0 THEN 0
      ELSE (100 - (COUNT(DISTINCT cm.id) FILTER (WHERE cm.threat_level = 'high') * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0)))::integer
    END as protection_score
  FROM public.artwork a
  LEFT JOIN public.copyright_matches cm ON a.id = cm.artwork_id
  LEFT JOIN public.portfolios p ON a.user_id = p.user_id AND p.is_active = true
  WHERE a.user_id = auth.uid();
$function$;

DROP FUNCTION IF EXISTS public.update_legal_updated_at();
CREATE OR REPLACE FUNCTION public.update_legal_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_post_counts();
CREATE OR REPLACE FUNCTION public.update_post_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update comments count
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

-- Continue with remaining functions...
DROP FUNCTION IF EXISTS public.track_template_usage(text, text, uuid);
CREATE OR REPLACE FUNCTION public.track_template_usage(template_id_param text, event_type_param text, user_id_param uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update daily stats
  INSERT INTO public.template_usage_stats (template_id, date)
  VALUES (template_id_param, CURRENT_DATE)
  ON CONFLICT (template_id, date) DO NOTHING;
  
  -- Update counters based on event type
  CASE event_type_param
    WHEN 'view' THEN
      UPDATE public.template_usage_stats 
      SET total_views = total_views + 1,
          updated_at = now()
      WHERE template_id = template_id_param AND date = CURRENT_DATE;
    WHEN 'download' THEN
      UPDATE public.template_usage_stats 
      SET total_downloads = total_downloads + 1,
          updated_at = now()
      WHERE template_id = template_id_param AND date = CURRENT_DATE;
    WHEN 'generate' THEN
      UPDATE public.template_usage_stats 
      SET total_generations = total_generations + 1,
          updated_at = now()
      WHERE template_id = template_id_param AND date = CURRENT_DATE;
  END CASE;
END;
$function$;

-- 2. Strengthen RLS policies to require authentication
DROP POLICY IF EXISTS "System can manage cache statistics" ON public.cache_statistics;
CREATE POLICY "System can manage cache statistics" 
ON public.cache_statistics 
FOR ALL 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "System can create violations" ON public.ai_training_violations;
CREATE POLICY "System can create violations" 
ON public.ai_training_violations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Create production error handling system
CREATE TABLE IF NOT EXISTS public.system_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,
  error_message text NOT NULL,
  error_stack text,
  user_id uuid,
  request_path text,
  request_method text,
  user_agent text,
  ip_address inet,
  metadata jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on error table
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system errors" 
ON public.system_errors 
FOR ALL 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 4. Create system health monitoring
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  response_time_ms integer,
  details jsonb DEFAULT '{}',
  checked_at timestamptz DEFAULT now()
);

-- Enable RLS 
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system health" 
ON public.system_health_checks 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 5. Create backup metadata tracking
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  file_size_bytes bigint,
  duration_seconds integer,
  storage_location text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage backup logs" 
ON public.backup_logs 
FOR ALL 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 6. Create production alerts system
CREATE TABLE IF NOT EXISTS public.production_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  source_system text NOT NULL,
  metadata jsonb DEFAULT '{}',
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved boolean DEFAULT false,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage production alerts" 
ON public.production_alerts 
FOR ALL 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_errors_created_at ON public.system_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_error_type ON public.system_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_checked_at ON public.system_health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_production_alerts_severity ON public.production_alerts(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);

-- 8. Create production monitoring functions
CREATE OR REPLACE FUNCTION public.log_system_error(
  error_type_param text,
  error_message_param text,
  error_stack_param text DEFAULT NULL,
  metadata_param jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  error_id uuid;
BEGIN
  INSERT INTO public.system_errors (
    error_type,
    error_message,
    error_stack,
    user_id,
    metadata
  ) VALUES (
    error_type_param,
    error_message_param,
    error_stack_param,
    auth.uid(),
    metadata_param
  ) RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_production_alert(
  alert_type_param text,
  severity_param text,
  title_param text,
  message_param text,
  source_system_param text,
  metadata_param jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  alert_id uuid;
BEGIN
  INSERT INTO public.production_alerts (
    alert_type,
    severity,
    title,
    message,
    source_system,
    metadata
  ) VALUES (
    alert_type_param,
    severity_param,
    title_param,
    message_param,
    source_system_param,
    metadata_param
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$function$;

-- 9. Enable realtime for production monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health_checks;