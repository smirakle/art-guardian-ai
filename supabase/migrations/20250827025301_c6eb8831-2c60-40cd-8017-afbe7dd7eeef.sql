-- Update partner pricing tiers with significantly better API limits than enterprise APIs
UPDATE public.partner_pricing_tiers 
SET 
  api_calls_included = CASE 
    WHEN tier_name = 'Partner Starter' THEN 25000
    WHEN tier_name = 'Partner Professional' THEN 100000
    WHEN tier_name = 'Partner Enterprise' THEN 500000
    WHEN tier_name = 'Partner Plus' THEN 1000000
    WHEN tier_name = 'Partner Custom' THEN 5000000
    ELSE api_calls_included
  END,
  rate_limit_per_hour = CASE 
    WHEN tier_name = 'Partner Starter' THEN 5000
    WHEN tier_name = 'Partner Professional' THEN 15000
    WHEN tier_name = 'Partner Enterprise' THEN 50000
    WHEN tier_name = 'Partner Plus' THEN 100000
    WHEN tier_name = 'Partner Custom' THEN 250000
    ELSE rate_limit_per_hour
  END,
  features = CASE 
    WHEN tier_name = 'Partner Starter' THEN jsonb_build_array(
      'Priority API access (25K calls)',
      'Enhanced rate limits (5,000/hour)',
      'Basic white-label platform',
      'Partner dashboard access',
      '99.9% SLA guarantee',
      'Email support'
    )
    WHEN tier_name = 'Partner Professional' THEN jsonb_build_array(
      'Premium API access (100K calls)',
      'Advanced rate limits (15,000/hour)', 
      'Full white-label branding',
      'Multi-organization management',
      'Dedicated partner support',
      'Revenue sharing program',
      '99.95% SLA guarantee',
      'Priority phone support'
    )
    WHEN tier_name = 'Partner Enterprise' THEN jsonb_build_array(
      'Enterprise API access (500K calls)',
      'Premium rate limits (50,000/hour)',
      'Complete white-label solution',
      'Advanced organization management',
      'Dedicated account manager',
      'Custom integrations',
      'Revenue sharing + bonuses',
      '99.99% SLA guarantee',
      '24/7 priority support'
    )
    WHEN tier_name = 'Partner Plus' THEN jsonb_build_array(
      'Plus API access (1M calls)',
      'Ultra rate limits (100,000/hour)',
      'Advanced white-label platform',
      'Unlimited organizations',
      'Personal success manager',
      'Custom feature development',
      'Enhanced revenue sharing',
      '99.99% SLA with credits',
      'Dedicated technical support'
    )
    WHEN tier_name = 'Partner Custom' THEN jsonb_build_array(
      'Custom API access (5M calls)',
      'Unlimited rate limits (250,000/hour)',
      'Fully customized platform',
      'Enterprise-grade infrastructure',
      'Dedicated development team',
      'White-glove onboarding',
      'Maximum revenue sharing',
      '99.99% SLA with penalties',
      'Private cloud option',
      'Custom contract terms'
    )
    ELSE features
  END,
  updated_at = now()
WHERE tier_name IN ('Partner Starter', 'Partner Professional', 'Partner Enterprise', 'Partner Plus', 'Partner Custom');