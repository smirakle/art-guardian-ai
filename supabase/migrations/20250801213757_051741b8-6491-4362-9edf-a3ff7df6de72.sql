-- Fix Function Search Path Security Issues
-- Update all functions to have secure search_path settings

-- Update calculate_next_execution function
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

-- Update update_next_execution function
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

-- Update get_user_email_verified function
CREATE OR REPLACE FUNCTION public.get_user_email_verified()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(email_confirmed_at IS NOT NULL, false)
  FROM auth.users 
  WHERE id = auth.uid();
$function$;

-- Update user_has_white_label_access function
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

-- Update validate_role_change function
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

-- Update validate_admin_token function
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

-- Update is_valid_admin_session function
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