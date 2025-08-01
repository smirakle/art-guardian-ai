-- Security Hardening: Fix function search paths and tighten RLS policies

-- Fix search paths for security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE(plan_id text, status text, social_media_addon boolean, deepfake_addon boolean, is_active boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    s.plan_id,
    s.status,
    s.social_media_addon,
    s.deepfake_addon,
    (s.status = 'active' AND s.current_period_end > now()) as is_active
  FROM public.subscriptions s
  WHERE s.user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_has_white_label_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND s.plan_id IN ('professional', 'enterprise')
    AND s.white_label_enabled = true
    AND s.current_period_end > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_membership(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = _user_id 
    AND status = 'active'
    AND current_period_end > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_white_label_org()
RETURNS TABLE(org_id uuid, org_name text, org_slug text, is_owner boolean, user_role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_portfolio_limit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    user_subscription RECORD;
    limit_count INTEGER := 0;
BEGIN
    SELECT s.plan_id, (s.status = 'active' AND s.current_period_end > now()) as is_active
    INTO user_subscription
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active' 
    AND s.current_period_end > now()
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 2;
    END IF;
    
    CASE user_subscription.plan_id
        WHEN 'free' THEN
            limit_count := 2;
        WHEN 'student' THEN
            limit_count := 5;
        WHEN 'starter' THEN
            limit_count := 10;
        WHEN 'professional' THEN
            limit_count := 50;
        WHEN 'enterprise' THEN
            limit_count := -1;
        ELSE
            limit_count := 2;
    END CASE;
    
    RETURN limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_artwork_limit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    user_subscription RECORD;
    limit_count INTEGER := 0;
BEGIN
    SELECT s.plan_id, (s.status = 'active' AND s.current_period_end > now()) as is_active
    INTO user_subscription
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active' 
    AND s.current_period_end > now()
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    CASE user_subscription.plan_id
        WHEN 'student' THEN
            limit_count := 50;
        WHEN 'starter' THEN
            limit_count := 150;
        WHEN 'professional' THEN
            limit_count := 1000;
        WHEN 'enterprise' THEN
            limit_count := 10000;
        ELSE
            limit_count := 0;
    END CASE;
    
    RETURN limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_feature(feature_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Tighten RLS policies to restrict anonymous access where not needed
-- Remove anonymous access from policies that don't need it

-- Update RLS policies to be more restrictive for sensitive tables
DROP POLICY IF EXISTS "Anyone can view monitored platforms" ON public.monitored_platforms;
CREATE POLICY "Authenticated users can view monitored platforms"
  ON public.monitored_platforms FOR SELECT
  TO authenticated
  USING (true);

-- Ensure only authenticated users can view IP lawyers
DROP POLICY IF EXISTS "Anyone can view IP lawyers directory" ON public.ip_lawyers;
CREATE POLICY "Authenticated users can view IP lawyers directory"
  ON public.ip_lawyers FOR SELECT
  TO authenticated
  USING (true);

-- Restrict community posts to authenticated users for viewing
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;
CREATE POLICY "Authenticated users can view posts"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

-- Restrict realtime monitoring stats to authenticated users
DROP POLICY IF EXISTS "Anyone can view monitoring stats" ON public.realtime_monitoring_stats;
CREATE POLICY "Authenticated users can view monitoring stats"
  ON public.realtime_monitoring_stats FOR SELECT
  TO authenticated
  USING (true);

-- Restrict deepfake matches to authenticated users
DROP POLICY IF EXISTS "Anyone can view deepfake matches" ON public.deepfake_matches;
CREATE POLICY "Authenticated users can view deepfake matches"
  ON public.deepfake_matches FOR SELECT
  TO authenticated
  USING (true);

-- Add security audit log entry for this hardening
INSERT INTO public.security_audit_log (
  user_id, 
  action, 
  resource_type, 
  resource_id, 
  details
) VALUES (
  auth.uid(),
  'security_hardening',
  'database',
  'rls_policies_functions',
  jsonb_build_object(
    'description', 'Applied security hardening: fixed function search paths and tightened RLS policies',
    'timestamp', now(),
    'changes', jsonb_build_array(
      'Fixed search_path for security definer functions',
      'Restricted anonymous access to sensitive tables',
      'Updated RLS policies to require authentication'
    )
  )
);