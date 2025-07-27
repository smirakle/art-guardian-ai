-- Ensure admin user has access to all features
-- Create or update subscription for admin user (shc302@g.harvard.edu)

-- First, get the admin user ID
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID from auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'shc302@g.harvard.edu' 
    LIMIT 1;
    
    -- Only proceed if admin user exists
    IF admin_user_id IS NOT NULL THEN
        -- Create or update admin subscription with enterprise plan and all features enabled
        INSERT INTO public.subscriptions (
            user_id,
            plan_id,
            status,
            billing_cycle,
            current_period_start,
            current_period_end,
            social_media_addon,
            deepfake_addon,
            white_label_enabled,
            custom_domain_enabled,
            max_white_label_users
        ) VALUES (
            admin_user_id,
            'enterprise',
            'active',
            'yearly',
            now(),
            now() + interval '10 years', -- Give admin long-term access
            true,
            true,
            true,
            true,
            9999
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            plan_id = 'enterprise',
            status = 'active',
            current_period_end = now() + interval '10 years',
            social_media_addon = true,
            deepfake_addon = true,
            white_label_enabled = true,
            custom_domain_enabled = true,
            max_white_label_users = 9999,
            updated_at = now();
            
        RAISE NOTICE 'Admin subscription updated successfully for user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user shc302@g.harvard.edu not found in auth.users';
    END IF;
END $$;

-- Update RLS policies to ensure admins can see all data

-- Update profiles policy to allow admins to see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admins can manage all user roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all artwork
DROP POLICY IF EXISTS "Admins can view all artwork" ON public.artwork;
CREATE POLICY "Admins can view all artwork" 
ON public.artwork 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all monitoring data
DROP POLICY IF EXISTS "Admins can view all monitoring scans" ON public.monitoring_scans;
CREATE POLICY "Admins can view all monitoring scans" 
ON public.monitoring_scans 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all copyright matches" ON public.copyright_matches;
CREATE POLICY "Admins can view all copyright matches" 
ON public.copyright_matches 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update the get_user_subscription function to work for admins checking other users
-- This allows admins to see subscription data for all users in the admin panel
CREATE OR REPLACE FUNCTION public.get_user_subscription_admin(target_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  user_id UUID,
  plan_id text, 
  status text, 
  social_media_addon boolean, 
  deepfake_addon boolean, 
  white_label_enabled boolean,
  custom_domain_enabled boolean,
  is_active boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    s.user_id,
    s.plan_id,
    s.status,
    s.social_media_addon,
    s.deepfake_addon,
    s.white_label_enabled,
    s.custom_domain_enabled,
    (s.status = 'active' AND s.current_period_end > now()) as is_active
  FROM public.subscriptions s
  WHERE (
    -- If target_user_id is provided and caller is admin, return that user's subscription
    (target_user_id IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role) AND s.user_id = target_user_id)
    OR 
    -- Otherwise, return current user's subscription (original behavior)
    (target_user_id IS NULL AND s.user_id = auth.uid())
  )
  LIMIT 1;
$$;