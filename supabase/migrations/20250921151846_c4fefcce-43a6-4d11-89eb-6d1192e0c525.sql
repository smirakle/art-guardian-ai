-- Create email marketing settings table
CREATE TABLE IF NOT EXISTS public.email_marketing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.email_marketing_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own email settings"
ON public.email_marketing_settings
FOR ALL
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_email_marketing_settings_updated_at
BEFORE UPDATE ON public.email_marketing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create email marketing campaigns table
CREATE TABLE IF NOT EXISTS public.email_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  campaign_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own campaigns"
ON public.email_marketing_campaigns
FOR ALL
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_email_marketing_campaigns_updated_at
BEFORE UPDATE ON public.email_marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();