-- Update partner pricing tiers to have better limits than enterprise APIs
UPDATE public.partner_pricing_tiers 
SET 
  api_calls_included = CASE 
    WHEN tier_name = 'Starter' THEN 25000
    WHEN tier_name = 'Professional' THEN 100000
    WHEN tier_name = 'Enterprise' THEN 500000
    ELSE api_calls_included
  END,
  rate_limit_per_hour = CASE 
    WHEN tier_name = 'Starter' THEN 5000
    WHEN tier_name = 'Professional' THEN 15000
    WHEN tier_name = 'Enterprise' THEN 50000
    ELSE rate_limit_per_hour
  END,
  features = CASE 
    WHEN tier_name = 'Starter' THEN jsonb_build_array(
      'Priority API access',
      'Enhanced rate limits (5,000/hour)',
      'Basic white-label',
      'Partner dashboard',
      '99.9% SLA guarantee'
    )
    WHEN tier_name = 'Professional' THEN jsonb_build_array(
      'Premium API access',
      'Advanced rate limits (15,000/hour)', 
      'Full white-label branding',
      'Multi-organization management',
      'Dedicated partner support',
      'Revenue sharing program',
      '99.95% SLA guarantee'
    )
    WHEN tier_name = 'Enterprise' THEN jsonb_build_array(
      'Unlimited API access',
      'Premium rate limits (50,000/hour)',
      'Complete white-label solution',
      'Unlimited organizations',
      'Dedicated account manager',
      'Custom integrations',
      'Revenue sharing + bonuses',
      '99.99% SLA guarantee',
      'Private cloud option'
    )
    ELSE features
  END,
  updated_at = now()
WHERE tier_name IN ('Starter', 'Professional', 'Enterprise');