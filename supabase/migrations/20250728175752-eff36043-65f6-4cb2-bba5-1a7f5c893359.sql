-- CRITICAL SECURITY FIX: Fix database function search paths
-- Phase 2: Add proper search_path to all functions for security

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

-- Fix get_user_subscription function
CREATE OR REPLACE FUNCTION public.get_user_subscription()
 RETURNS TABLE(plan_id text, status text, social_media_addon boolean, deepfake_addon boolean, is_active boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    s.plan_id,
    s.status,
    s.social_media_addon,
    s.deepfake_addon,
    (s.status = 'active' AND s.current_period_end > now()) as is_active
  FROM public.subscriptions s
  WHERE s.user_id = auth.uid()
  LIMIT 1;
$function$;

-- Fix user_has_feature function
CREATE OR REPLACE FUNCTION public.user_has_feature(feature_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  WITH user_sub AS (
    SELECT * FROM public.get_user_subscription()
  )
  SELECT CASE 
    WHEN NOT EXISTS (SELECT 1 FROM user_sub WHERE is_active = true) THEN false
    WHEN feature_name = 'basic_monitoring' THEN true -- All plans
    WHEN feature_name = 'visual_recognition' THEN true -- All plans
    WHEN feature_name = 'blockchain_verification' THEN (
      SELECT plan_id IN ('professional') FROM user_sub
    )
    WHEN feature_name = 'real_time_monitoring' THEN (
      SELECT plan_id IN ('professional') FROM user_sub
    )
    WHEN feature_name = 'automated_dmca' THEN (
      SELECT plan_id IN ('professional') FROM user_sub
    )
    WHEN feature_name = 'social_media_monitoring' THEN (
      SELECT (plan_id IN ('professional') AND social_media_addon = true) OR social_media_addon = true FROM user_sub
    )
    WHEN feature_name = 'deepfake_detection' THEN (
      SELECT plan_id IN ('professional') OR deepfake_addon = true FROM user_sub
    )
    WHEN feature_name = 'advanced_ai' THEN (
      SELECT plan_id IN ('professional') FROM user_sub
    )
    WHEN feature_name = 'priority_support' THEN (
      SELECT plan_id IN ('professional') FROM user_sub
    )
    ELSE false
  END;
$function$;