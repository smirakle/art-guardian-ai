-- Production Readiness Security Hardening - Fixed Version
-- Fix function search path vulnerabilities

-- 1. Drop dependent triggers first
DROP TRIGGER IF EXISTS trigger_update_next_execution ON public.scheduled_scans;

-- 2. Fix all function search paths to be immutable for security
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

-- Recreate the trigger
CREATE TRIGGER trigger_update_next_execution
  BEFORE UPDATE ON public.scheduled_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_next_execution();

-- Fix remaining critical functions
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

DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with better error handling
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Assign role based on email - ONLY admin email gets admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'shc302@g.harvard.edu' THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create free subscription for new users
  PERFORM public.create_free_subscription_for_user(NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

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

-- 8. Create production monitoring functions with secure search paths
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

-- 9. Fix remaining critical security functions
CREATE OR REPLACE FUNCTION public.audit_ai_protection_records()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 10. Enable realtime for production monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health_checks;

-- Set replica identity for realtime
ALTER TABLE public.production_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.system_health_checks REPLICA IDENTITY FULL;