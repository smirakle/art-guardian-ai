-- Add missing fields to partner_subscriptions table
ALTER TABLE public.partner_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_stripe_subscription_id 
ON public.partner_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_stripe_customer_id 
ON public.partner_subscriptions(stripe_customer_id);

-- Create partner subscription usage tracking table
CREATE TABLE IF NOT EXISTS public.partner_subscription_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  api_calls_count INTEGER NOT NULL DEFAULT 0,
  endpoint_usage JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, usage_date)
);

-- Enable RLS
ALTER TABLE public.partner_subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage tracking
CREATE POLICY "Users can view their own usage" 
ON public.partner_subscription_usage 
FOR SELECT 
USING (subscription_id IN (
  SELECT id FROM public.partner_subscriptions WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage usage records" 
ON public.partner_subscription_usage 
FOR ALL 
USING (true);

-- Create function to track API usage
CREATE OR REPLACE FUNCTION public.track_partner_api_usage(
  user_id_param UUID,
  endpoint_param TEXT DEFAULT 'general',
  calls_count_param INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
  current_usage INTEGER;
BEGIN
  -- Get user's active subscription
  SELECT ps.*, pt.api_calls_included 
  INTO subscription_record
  FROM public.partner_subscriptions ps
  JOIN public.partner_pricing_tiers pt ON ps.tier_id = pt.id
  WHERE ps.user_id = user_id_param 
    AND ps.status = 'active'
    AND ps.current_period_end > now()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE; -- No active subscription
  END IF;
  
  -- Check if user has exceeded their limit
  IF subscription_record.api_calls_used + calls_count_param > subscription_record.api_calls_included THEN
    RETURN FALSE; -- Exceeds limit
  END IF;
  
  -- Update subscription usage
  UPDATE public.partner_subscriptions
  SET api_calls_used = api_calls_used + calls_count_param,
      updated_at = now()
  WHERE id = subscription_record.id;
  
  -- Track daily usage
  INSERT INTO public.partner_subscription_usage (
    subscription_id,
    usage_date,
    api_calls_count,
    endpoint_usage
  ) VALUES (
    subscription_record.id,
    CURRENT_DATE,
    calls_count_param,
    jsonb_build_object(endpoint_param, calls_count_param)
  )
  ON CONFLICT (subscription_id, usage_date)
  DO UPDATE SET
    api_calls_count = partner_subscription_usage.api_calls_count + calls_count_param,
    endpoint_usage = partner_subscription_usage.endpoint_usage || 
      jsonb_build_object(
        endpoint_param, 
        COALESCE((partner_subscription_usage.endpoint_usage->>endpoint_param)::INTEGER, 0) + calls_count_param
      ),
    updated_at = now();
  
  RETURN TRUE;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_partner_subscription_usage_updated_at
  BEFORE UPDATE ON public.partner_subscription_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update get_user_partner_tier function to include billing info
CREATE OR REPLACE FUNCTION public.get_user_partner_tier()
RETURNS TABLE(
  tier_name TEXT,
  monthly_price INTEGER,
  api_calls_included INTEGER,
  rate_limit_per_hour INTEGER,
  white_label_included BOOLEAN,
  custom_branding BOOLEAN,
  dedicated_support BOOLEAN,
  custom_integrations BOOLEAN,
  max_organizations INTEGER,
  max_users_per_org INTEGER,
  max_domains INTEGER,
  features JSONB,
  subscription_status TEXT,
  api_calls_used INTEGER,
  api_calls_remaining INTEGER,
  billing_cycle TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pt.tier_name,
    pt.monthly_price,
    pt.api_calls_included,
    pt.rate_limit_per_hour,
    pt.white_label_included,
    pt.custom_branding,
    pt.dedicated_support,
    pt.custom_integrations,
    pt.max_organizations,
    pt.max_users_per_org,
    pt.max_domains,
    pt.features,
    ps.status,
    ps.api_calls_used,
    (pt.api_calls_included - ps.api_calls_used) as api_calls_remaining,
    ps.billing_cycle,
    ps.current_period_end,
    ps.next_billing_date,
    ps.stripe_subscription_id
  FROM public.partner_subscriptions ps
  JOIN public.partner_pricing_tiers pt ON ps.tier_id = pt.id
  WHERE ps.user_id = auth.uid()
    AND ps.status IN ('active', 'trialing', 'past_due')
    AND ps.current_period_end > now()
  ORDER BY ps.created_at DESC
  LIMIT 1;
$$;