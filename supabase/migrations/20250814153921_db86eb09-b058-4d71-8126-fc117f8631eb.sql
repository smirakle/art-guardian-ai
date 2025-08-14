-- Create partner pricing tiers and white label integration
CREATE TABLE public.partner_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL UNIQUE,
  monthly_price INTEGER NOT NULL,
  api_calls_included INTEGER NOT NULL,
  rate_limit_per_hour INTEGER NOT NULL,
  white_label_included BOOLEAN NOT NULL DEFAULT false,
  custom_branding BOOLEAN NOT NULL DEFAULT false,
  dedicated_support BOOLEAN NOT NULL DEFAULT false,
  custom_integrations BOOLEAN NOT NULL DEFAULT false,
  max_organizations INTEGER DEFAULT NULL,
  max_users_per_org INTEGER DEFAULT 50,
  max_domains INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert partner pricing tiers
INSERT INTO public.partner_pricing_tiers (
  tier_name, monthly_price, api_calls_included, rate_limit_per_hour,
  white_label_included, custom_branding, dedicated_support, custom_integrations,
  max_organizations, max_users_per_org, max_domains, features
) VALUES 
  ('Partner Starter', 99900, 10000, 100, true, false, false, false, 1, 25, 1, 
   '["basic_monitoring", "visual_recognition", "portfolio_monitoring", "white_label"]'::jsonb),
  ('Partner Professional', 199900, 50000, 500, true, true, true, false, 3, 100, 3,
   '["basic_monitoring", "visual_recognition", "portfolio_monitoring", "white_label", "custom_branding", "priority_support", "advanced_analytics"]'::jsonb),
  ('Partner Enterprise', 499900, 250000, 2500, true, true, true, true, 10, 500, 10,
   '["basic_monitoring", "visual_recognition", "portfolio_monitoring", "white_label", "custom_branding", "priority_support", "advanced_analytics", "custom_integrations", "dedicated_support"]'::jsonb),
  ('Partner Plus', 999900, 1000000, 10000, true, true, true, true, 50, 1000, 25,
   '["basic_monitoring", "visual_recognition", "portfolio_monitoring", "white_label", "custom_branding", "priority_support", "advanced_analytics", "custom_integrations", "dedicated_support", "unlimited_portfolios"]'::jsonb),
  ('Partner Custom', 2499900, 10000000, 50000, true, true, true, true, NULL, 5000, 100,
   '["basic_monitoring", "visual_recognition", "portfolio_monitoring", "white_label", "custom_branding", "priority_support", "advanced_analytics", "custom_integrations", "dedicated_support", "unlimited_portfolios", "custom_solutions"]'::jsonb);

-- Create partner subscriptions table
CREATE TABLE public.partner_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  tier_id UUID NOT NULL REFERENCES public.partner_pricing_tiers(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  api_calls_used INTEGER NOT NULL DEFAULT 0,
  api_calls_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 month'),
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active pricing tiers" 
ON public.partner_pricing_tiers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage pricing tiers" 
ON public.partner_pricing_tiers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own partner subscriptions" 
ON public.partner_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own partner subscriptions" 
ON public.partner_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Add partner tier to white label organizations
ALTER TABLE public.white_label_organizations 
ADD COLUMN partner_tier_id UUID REFERENCES public.partner_pricing_tiers(id),
ADD COLUMN partner_subscription_id UUID REFERENCES public.partner_subscriptions(id);

-- Create function to get user's partner tier
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
  api_calls_remaining INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
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
    (pt.api_calls_included - ps.api_calls_used) as api_calls_remaining
  FROM public.partner_subscriptions ps
  JOIN public.partner_pricing_tiers pt ON ps.tier_id = pt.id
  WHERE ps.user_id = auth.uid()
    AND ps.status = 'active'
    AND ps.current_period_end > now()
  ORDER BY ps.created_at DESC
  LIMIT 1;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_partner_pricing_tiers_updated_at
  BEFORE UPDATE ON public.partner_pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_subscriptions_updated_at
  BEFORE UPDATE ON public.partner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();