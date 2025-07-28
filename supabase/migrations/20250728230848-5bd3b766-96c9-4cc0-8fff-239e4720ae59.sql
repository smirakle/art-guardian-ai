-- Create a free tier subscription for users who don't have a paid subscription
-- This allows them to access basic features without payment

-- Add a function to create free subscriptions for new users
CREATE OR REPLACE FUNCTION public.create_free_subscription_for_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
      deepfake_addon,
      white_label_enabled
    ) VALUES (
      _user_id,
      'free',
      'active',
      'monthly',
      now(),
      now() + interval '100 years', -- Free tier never expires
      false,
      false,
      false
    );
  END IF;
END;
$$;

-- Update the user_has_feature function to support free tier
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
    -- Free tier features
    WHEN feature_name = 'basic_monitoring' THEN true -- All plans including free
    WHEN feature_name = 'visual_recognition' THEN true -- All plans including free
    WHEN feature_name = 'community_access' THEN true -- All plans including free
    WHEN feature_name = 'legal_templates' THEN true -- All plans including free
    WHEN feature_name = 'basic_uploads' THEN true -- All plans including free (up to 5 for free)
    -- Paid tier features
    WHEN feature_name = 'blockchain_verification' THEN (
      SELECT plan_id IN ('starter', 'professional') FROM user_sub
    )
    WHEN feature_name = 'real_time_monitoring' THEN (
      SELECT plan_id IN ('starter', 'professional') FROM user_sub
    )
    WHEN feature_name = 'automated_dmca' THEN (
      SELECT plan_id IN ('professional') FROM user_sub
    )
    WHEN feature_name = 'white_label' THEN (
      SELECT plan_id IN ('professional') AND white_label_enabled = true FROM user_sub
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
      SELECT plan_id IN ('starter', 'professional') FROM user_sub
    )
    ELSE false
  END;
$$;

-- Update the handle_new_user function to create free subscriptions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  
  -- Assign role based on email - ONLY admin email gets admin role
  IF NEW.email = 'shc302@g.harvard.edu' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  -- Create free subscription for new users
  PERFORM public.create_free_subscription_for_user(NEW.id);
  
  RETURN NEW;
END;
$$;