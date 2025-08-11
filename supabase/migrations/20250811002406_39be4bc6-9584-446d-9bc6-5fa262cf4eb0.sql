
-- 1) Email Campaigns
CREATE TABLE public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft',         -- draft | scheduled | sent | paused
  trigger_type text NOT NULL DEFAULT 'manual',  -- welcome | abandonment | renewal | engagement | manual
  send_time timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_campaigns_user_id_idx ON public.email_campaigns (user_id);
CREATE INDEX email_campaigns_status_idx ON public.email_campaigns (status);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_campaigns"
  ON public.email_campaigns
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their email_campaigns"
  ON public.email_campaigns
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER email_campaigns_set_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Email Templates
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_templates_user_id_idx ON public.email_templates (user_id);
CREATE INDEX email_templates_is_active_idx ON public.email_templates (is_active);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_templates"
  ON public.email_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their email_templates"
  ON public.email_templates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER email_templates_set_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Email Subscribers
CREATE TABLE public.email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  status text NOT NULL DEFAULT 'subscribed',  -- subscribed | unsubscribed | bounced
  last_engaged_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email)
);

CREATE INDEX email_subscribers_user_id_idx ON public.email_subscribers (user_id);
CREATE INDEX email_subscribers_status_idx ON public.email_subscribers (status);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_subscribers"
  ON public.email_subscribers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their email_subscribers"
  ON public.email_subscribers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER email_subscribers_set_updated_at
BEFORE UPDATE ON public.email_subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Campaign Recipients (per-campaign delivery status)
CREATE TABLE public.email_campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid NULL REFERENCES public.email_subscribers(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',   -- pending | sent | opened | clicked | bounced | unsubscribed
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  unsubscribed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);

CREATE INDEX ecr_user_id_idx ON public.email_campaign_recipients (user_id);
CREATE INDEX ecr_campaign_id_idx ON public.email_campaign_recipients (campaign_id);
CREATE INDEX ecr_status_idx ON public.email_campaign_recipients (status);

ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_campaign_recipients"
  ON public.email_campaign_recipients
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users may manage their own recipients if the campaign is theirs
CREATE POLICY "Users can manage their email_campaign_recipients"
  ON public.email_campaign_recipients
  FOR ALL
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.email_campaigns c
      WHERE c.id = campaign_id AND c.user_id = auth.uid()
    )
  );

CREATE TRIGGER ecr_set_updated_at
BEFORE UPDATE ON public.email_campaign_recipients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Email Events (delivery/open/click/bounce/unsubscribe logs)
CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid REFERENCES public.email_subscribers(id) ON DELETE SET NULL,
  email text,
  event_type text NOT NULL,                 -- sent | opened | clicked | bounced | unsubscribed
  occurred_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX email_events_user_idx ON public.email_events (user_id);
CREATE INDEX email_events_campaign_idx ON public.email_events (campaign_id);
CREATE INDEX email_events_type_idx ON public.email_events (event_type);
CREATE INDEX email_events_occurred_idx ON public.email_events (occurred_at);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_events"
  ON public.email_events
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their email_events"
  ON public.email_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
