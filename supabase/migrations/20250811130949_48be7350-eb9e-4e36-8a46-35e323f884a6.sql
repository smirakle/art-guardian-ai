-- Create email automation rules table
CREATE TABLE public.email_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL, -- 'user_signup', 'subscription_renewed', 'cart_abandoned', 'user_inactive', 'custom_event'
  trigger_conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  delay_minutes integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  execution_count integer NOT NULL DEFAULT 0,
  last_executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_automation_rules_user_id_idx ON public.email_automation_rules (user_id);
CREATE INDEX email_automation_rules_trigger_event_idx ON public.email_automation_rules (trigger_event);
CREATE INDEX email_automation_rules_is_active_idx ON public.email_automation_rules (is_active);

ALTER TABLE public.email_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_automation_rules"
  ON public.email_automation_rules
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their email_automation_rules"
  ON public.email_automation_rules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER email_automation_rules_set_updated_at
BEFORE UPDATE ON public.email_automation_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create email automation executions table (to track when rules fire)
CREATE TABLE public.email_automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.email_automation_rules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  trigger_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  campaign_sent boolean NOT NULL DEFAULT false,
  error_message text,
  executed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX eae_rule_id_idx ON public.email_automation_executions (rule_id);
CREATE INDEX eae_user_id_idx ON public.email_automation_executions (user_id);
CREATE INDEX eae_executed_at_idx ON public.email_automation_executions (executed_at);

ALTER TABLE public.email_automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email_automation_executions"
  ON public.email_automation_executions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their email_automation_executions"
  ON public.email_automation_executions
  FOR SELECT
  USING (auth.uid() = user_id);