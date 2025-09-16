-- Phase 2-4: Advanced Email Marketing Features

-- Subscriber segments for advanced targeting
CREATE TABLE public.email_subscriber_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  subscriber_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Drip campaign sequences
CREATE TABLE public.email_drip_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, signup, purchase, etc.
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual steps in drip sequences
CREATE TABLE public.email_drip_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.email_drip_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  template_id UUID REFERENCES public.email_templates(id),
  subject_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track subscriber progress through drip sequences
CREATE TABLE public.email_drip_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.email_drip_sequences(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active', -- active, paused, completed, failed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sequence_id, subscriber_id)
);

-- A/B test configurations
CREATE TABLE public.email_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'subject', -- subject, content, sender, send_time
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  split_percentage INTEGER DEFAULT 50,
  sample_size INTEGER DEFAULT 100,
  winner_criteria TEXT DEFAULT 'open_rate', -- open_rate, click_rate, conversion_rate
  test_duration_hours INTEGER DEFAULT 24,
  status TEXT DEFAULT 'draft', -- draft, running, completed, paused
  winner_variant TEXT, -- a, b, or null if no winner
  confidence_level NUMERIC,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced email events tracking
CREATE TABLE public.email_detailed_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- sent, delivered, opened, clicked, bounced, complained, unsubscribed
  event_data JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address INET,
  location_country TEXT,
  location_city TEXT,
  device_type TEXT,
  email_client TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email deliverability monitoring
CREATE TABLE public.email_deliverability_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  date DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  complained INTEGER DEFAULT 0,
  reputation_score NUMERIC DEFAULT 100,
  deliverability_rate NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  complaint_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain, date)
);

-- Webhook configurations for external integrations
CREATE TABLE public.email_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['delivered', 'opened', 'clicked']::text[],
  secret_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced subscriber profiles with custom fields
CREATE TABLE public.email_subscriber_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- text, number, date, boolean, select
  field_options JSONB DEFAULT '[]'::jsonb, -- for select fields
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, field_name)
);

-- Store custom field values for subscribers
CREATE TABLE public.email_subscriber_field_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.email_subscriber_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, field_id)
);

-- Email validation results
CREATE TABLE public.email_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  validation_status TEXT NOT NULL, -- valid, invalid, risky, unknown
  validation_details JSONB DEFAULT '{}'::jsonb,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Enable RLS on all new tables
ALTER TABLE public.email_subscriber_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drip_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drip_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_detailed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_deliverability_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriber_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriber_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user-owned resources
CREATE POLICY "Users can manage their own segments" ON public.email_subscriber_segments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own drip sequences" ON public.email_drip_sequences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage drip steps for their sequences" ON public.email_drip_steps
  FOR ALL USING (sequence_id IN (SELECT id FROM public.email_drip_sequences WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage drip enrollments for their sequences" ON public.email_drip_enrollments
  FOR ALL USING (sequence_id IN (SELECT id FROM public.email_drip_sequences WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own A/B tests" ON public.email_ab_tests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view events for their campaigns" ON public.email_detailed_events
  FOR SELECT USING (campaign_id IN (SELECT id FROM public.email_campaigns WHERE user_id = auth.uid()));

CREATE POLICY "System can create detailed events" ON public.email_detailed_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their deliverability stats" ON public.email_deliverability_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own webhooks" ON public.email_webhooks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their subscriber fields" ON public.email_subscriber_fields
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage field values for their subscribers" ON public.email_subscriber_field_values
  FOR ALL USING (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their email validations" ON public.email_validations
  FOR ALL USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.email_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_segments_updated_at 
  BEFORE UPDATE ON public.email_subscriber_segments
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_drip_sequences_updated_at 
  BEFORE UPDATE ON public.email_drip_sequences
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_drip_steps_updated_at 
  BEFORE UPDATE ON public.email_drip_steps
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_drip_enrollments_updated_at 
  BEFORE UPDATE ON public.email_drip_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_ab_tests_updated_at 
  BEFORE UPDATE ON public.email_ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_deliverability_stats_updated_at 
  BEFORE UPDATE ON public.email_deliverability_stats
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_webhooks_updated_at 
  BEFORE UPDATE ON public.email_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

CREATE TRIGGER update_field_values_updated_at 
  BEFORE UPDATE ON public.email_subscriber_field_values
  FOR EACH ROW EXECUTE FUNCTION public.email_marketing_updated_at();

-- Useful functions for email marketing
CREATE OR REPLACE FUNCTION public.calculate_segment_size(segment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  -- This is a placeholder - in real implementation, you'd evaluate the segment conditions
  SELECT COUNT(*) INTO count_result
  FROM public.email_subscribers 
  WHERE user_id = (SELECT user_id FROM public.email_subscriber_segments WHERE id = segment_id);
  
  UPDATE public.email_subscriber_segments 
  SET subscriber_count = count_result 
  WHERE id = segment_id;
  
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;