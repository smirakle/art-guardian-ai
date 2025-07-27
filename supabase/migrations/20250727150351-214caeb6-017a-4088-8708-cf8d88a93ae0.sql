-- Update the get_user_subscription function to include white label fields
CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE(
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
    s.plan_id,
    s.status,
    s.social_media_addon,
    s.deepfake_addon,
    s.white_label_enabled,
    s.custom_domain_enabled,
    (s.status = 'active' AND s.current_period_end > now()) as is_active
  FROM public.subscriptions s
  WHERE s.user_id = auth.uid()
  LIMIT 1;
$$;

-- Update the user_has_feature function to include enterprise features
CREATE OR REPLACE FUNCTION public.user_has_feature(feature_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH user_sub AS (
    SELECT * FROM public.get_user_subscription()
  )
  SELECT CASE 
    WHEN NOT EXISTS (SELECT 1 FROM user_sub WHERE is_active = true) THEN false
    WHEN feature_name = 'basic_monitoring' THEN true -- All plans
    WHEN feature_name = 'visual_recognition' THEN true -- All plans
    WHEN feature_name = 'enhanced_monitoring' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'advanced_alerts' THEN (
      SELECT plan_id IN ('starter', 'professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'blockchain_verification' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'real_time_monitoring' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'automated_dmca' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'social_media_monitoring' THEN (
      SELECT (plan_id IN ('professional', 'enterprise') OR social_media_addon = true) FROM user_sub
    )
    WHEN feature_name = 'deepfake_detection' THEN (
      SELECT (plan_id IN ('professional', 'enterprise') OR deepfake_addon = true) FROM user_sub
    )
    WHEN feature_name = 'advanced_ai' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'priority_support' THEN (
      SELECT plan_id IN ('professional', 'enterprise') FROM user_sub
    )
    WHEN feature_name = 'white_label' THEN (
      SELECT (plan_id IN ('professional', 'enterprise') AND white_label_enabled = true) FROM user_sub
    )
    WHEN feature_name = 'custom_domain' THEN (
      SELECT (plan_id IN ('professional', 'enterprise') AND custom_domain_enabled = true) FROM user_sub
    )
    WHEN feature_name = 'unlimited_users' THEN (
      SELECT plan_id = 'enterprise' FROM user_sub
    )
    WHEN feature_name = 'api_access' THEN (
      SELECT plan_id = 'enterprise' FROM user_sub
    )
    WHEN feature_name = 'advanced_analytics' THEN (
      SELECT plan_id = 'enterprise' FROM user_sub
    )
    ELSE false
  END;
$$;

-- Update artwork limits to include enterprise
CREATE OR REPLACE FUNCTION public.get_artwork_limit()
RETURNS INTEGER AS $$
DECLARE
    user_subscription RECORD;
    limit_count INTEGER := 0;
BEGIN
    -- Get user subscription details
    SELECT s.plan_id, s.is_active
    INTO user_subscription
    FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.is_active = true
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no active subscription found, return 0
    IF NOT FOUND OR user_subscription.is_active = false THEN
        RETURN 0;
    END IF;
    
    -- Set limits based on plan
    CASE user_subscription.plan_id
        WHEN 'student' THEN
            limit_count := 50;
        WHEN 'starter' THEN
            limit_count := 150;
        WHEN 'professional' THEN
            limit_count := 1000;
        WHEN 'enterprise' THEN
            limit_count := 10000; -- Higher limit for enterprise
        ELSE
            limit_count := 0;
    END CASE;
    
    RETURN limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;