-- Update the user_has_feature function to include portfolio monitoring for all plans
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
    -- Free tier features
    WHEN feature_name = 'basic_monitoring' THEN true -- All plans including free
    WHEN feature_name = 'visual_recognition' THEN true -- All plans including free
    WHEN feature_name = 'community_access' THEN true -- All plans including free
    WHEN feature_name = 'legal_templates' THEN true -- All plans including free
    WHEN feature_name = 'basic_uploads' THEN true -- All plans including free (up to 5 for free)
    WHEN feature_name = 'portfolio_monitoring' THEN true -- All plans including free
    WHEN feature_name = 'portfolio_creation' THEN true -- All plans including free
    WHEN feature_name = 'portfolio_basic_scanning' THEN true -- All plans including free
    -- Paid tier features
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
$function$