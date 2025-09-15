-- Critical Security Fixes Phase 1 (Corrected)

-- 1. Fix infinite recursion in white_label_users RLS policy
-- First, create a security definer function to safely check white label access
CREATE OR REPLACE FUNCTION public.get_user_white_label_access(user_id_param uuid)
RETURNS TABLE(organization_id uuid, role text, is_owner boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Get user's white label organization access
  SELECT 
    wlo.id as organization_id,
    'owner'::text as role,
    true as is_owner
  FROM public.white_label_organizations wlo
  WHERE wlo.owner_id = user_id_param
  AND wlo.is_active = true
  
  UNION ALL
  
  SELECT 
    wlu.organization_id,
    wlu.role,
    false as is_owner
  FROM public.white_label_users wlu
  JOIN public.white_label_organizations wlo ON wlu.organization_id = wlo.id
  WHERE wlu.user_id = user_id_param
  AND wlu.is_active = true
  AND wlo.is_active = true
$$;

-- Drop existing problematic RLS policy on white_label_users (if exists)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own white label access" ON public.white_label_users;
  DROP POLICY IF EXISTS "Users can view white label users in their organizations" ON public.white_label_users;
  DROP POLICY IF EXISTS "Organization owners can manage white label users" ON public.white_label_users;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create new safe RLS policy for white_label_users
CREATE POLICY "Users can view white label users in their organizations"
ON public.white_label_users
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.get_user_white_label_access(auth.uid())
  )
);

CREATE POLICY "Organization owners can manage white label users"
ON public.white_label_users
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.get_user_white_label_access(auth.uid())
    WHERE is_owner = true
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.get_user_white_label_access(auth.uid())
    WHERE is_owner = true
  )
);

-- 2. Secure tables with missing or inadequate RLS policies (drop existing first)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all storage usage" ON public.user_storage_usage;
  DROP POLICY IF EXISTS "Users can view their own storage usage" ON public.user_storage_usage;
  DROP POLICY IF EXISTS "Admins can view all storage usage" ON public.user_storage_usage;
  DROP POLICY IF EXISTS "System can manage storage usage" ON public.user_storage_usage;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can view their own storage usage"
ON public.user_storage_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all storage usage"
ON public.user_storage_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage storage usage"
ON public.user_storage_usage
FOR ALL
USING (auth.role() = 'service_role');

-- Fix partner_pricing_tiers
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active pricing tiers" ON public.partner_pricing_tiers;
  DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.partner_pricing_tiers;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Anyone can view active pricing tiers"
ON public.partner_pricing_tiers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pricing tiers"
ON public.partner_pricing_tiers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix industry_verticals
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active industry verticals" ON public.industry_verticals;
  DROP POLICY IF EXISTS "Admins can manage industry verticals" ON public.industry_verticals;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Anyone can view active industry verticals"
ON public.industry_verticals
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage industry verticals"
ON public.industry_verticals
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Update critical functions with search_path security fixes
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Log this security migration
INSERT INTO public.security_audit_log (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  null,
  'critical_security_fixes_applied',
  'database_migration',
  'phase_1_security_fixes',
  jsonb_build_object(
    'fixes', ARRAY[
      'white_label_rls_recursion_fixed',
      'storage_usage_rls_secured',
      'pricing_tiers_rls_secured',
      'industry_verticals_rls_secured',
      'search_path_injection_prevented'
    ],
    'applied_at', now()
  )
);