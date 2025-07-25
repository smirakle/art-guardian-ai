-- Create subscriptions table to track user plans and access
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- 'student', 'starter', 'professional'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add-ons
  social_media_addon BOOLEAN NOT NULL DEFAULT false,
  deepfake_addon BOOLEAN NOT NULL DEFAULT false,
  
  -- Payment details
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  UNIQUE(user_id) -- One subscription per user
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- System can manage subscriptions
CREATE POLICY "System can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to check user's plan and features
CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE (
  plan_id TEXT,
  status TEXT,
  social_media_addon BOOLEAN,
  deepfake_addon BOOLEAN,
  is_active BOOLEAN
)
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

-- Function to check if user has access to a specific feature
CREATE OR REPLACE FUNCTION public.user_has_feature(feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Add artwork limits based on plans
CREATE OR REPLACE FUNCTION public.get_artwork_limit()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT CASE 
    WHEN NOT EXISTS (SELECT 1 FROM public.get_user_subscription() WHERE is_active = true) THEN 0
    ELSE (
      SELECT CASE s.plan_id
        WHEN 'student' THEN 25
        WHEN 'starter' THEN 50
        WHEN 'professional' THEN 500
        ELSE 0
      END
      FROM public.subscriptions s
      WHERE s.user_id = auth.uid() AND s.status = 'active' AND s.current_period_end > now()
      LIMIT 1
    )
  END;
$$;

-- Trigger to update updated_at column
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();