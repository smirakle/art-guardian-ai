-- Fix function search_path security issues for legal-related functions
ALTER FUNCTION public.get_template_download_count(text) SET search_path = '';
ALTER FUNCTION public.get_all_template_download_counts() SET search_path = '';
ALTER FUNCTION public.update_legal_updated_at() SET search_path = '';
ALTER FUNCTION public.generate_document_hash(text) SET search_path = '';

-- Create table for legal document analytics
CREATE TABLE public.legal_document_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id TEXT NOT NULL,
  document_id UUID,
  event_type TEXT NOT NULL, -- 'generated', 'downloaded', 'viewed', 'signed', 'shared'
  event_metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for automated compliance reminders
CREATE TABLE public.compliance_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  compliance_tracking_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'deadline_warning', 'deadline_past', 'response_required'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  email_sent BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document versioning
CREATE TABLE public.legal_document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  changes_summary TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_current BOOLEAN DEFAULT false
);

-- Create table for electronic signatures
CREATE TABLE public.legal_document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  signer_email TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signature_type TEXT NOT NULL, -- 'electronic', 'digital', 'typed'
  signature_data JSONB NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'invalid'
  verification_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for template usage statistics
CREATE TABLE public.template_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_views INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_generations INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, date)
);

-- Create table for legal notifications
CREATE TABLE public.legal_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL, -- 'document_generated', 'compliance_reminder', 'deadline_warning'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.legal_document_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for legal_document_analytics
CREATE POLICY "Users can view their own analytics" ON public.legal_document_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create analytics" ON public.legal_document_analytics
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for compliance_reminders
CREATE POLICY "Users can view their own reminders" ON public.compliance_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage reminders" ON public.compliance_reminders
  FOR ALL USING (true);

-- Create RLS policies for legal_document_versions
CREATE POLICY "Users can view document versions they own" ON public.legal_document_versions
  FOR SELECT USING (document_id IN (
    SELECT id FROM public.legal_document_generations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create versions for their documents" ON public.legal_document_versions
  FOR INSERT WITH CHECK (document_id IN (
    SELECT id FROM public.legal_document_generations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for legal_document_signatures
CREATE POLICY "Users can view signatures for their documents" ON public.legal_document_signatures
  FOR SELECT USING (document_id IN (
    SELECT id FROM public.legal_document_generations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create signatures" ON public.legal_document_signatures
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for template_usage_stats
CREATE POLICY "Anyone can view template stats" ON public.template_usage_stats
  FOR SELECT USING (true);

CREATE POLICY "System can manage template stats" ON public.template_usage_stats
  FOR ALL USING (true);

-- Create RLS policies for legal_notifications
CREATE POLICY "Users can view their own notifications" ON public.legal_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.legal_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.legal_notifications
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_legal_document_analytics_user_id ON public.legal_document_analytics(user_id);
CREATE INDEX idx_legal_document_analytics_template_id ON public.legal_document_analytics(template_id);
CREATE INDEX idx_legal_document_analytics_event_type ON public.legal_document_analytics(event_type);
CREATE INDEX idx_compliance_reminders_user_id ON public.compliance_reminders(user_id);
CREATE INDEX idx_compliance_reminders_scheduled_for ON public.compliance_reminders(scheduled_for);
CREATE INDEX idx_legal_document_versions_document_id ON public.legal_document_versions(document_id);
CREATE INDEX idx_legal_document_signatures_document_id ON public.legal_document_signatures(document_id);
CREATE INDEX idx_template_usage_stats_template_id ON public.template_usage_stats(template_id);
CREATE INDEX idx_template_usage_stats_date ON public.template_usage_stats(date);
CREATE INDEX idx_legal_notifications_user_id ON public.legal_notifications(user_id);
CREATE INDEX idx_legal_notifications_is_read ON public.legal_notifications(is_read);

-- Create triggers for automatic updates
CREATE TRIGGER update_compliance_reminders_updated_at
  BEFORE UPDATE ON public.compliance_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_usage_stats_updated_at
  BEFORE UPDATE ON public.template_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to track template usage
CREATE OR REPLACE FUNCTION public.track_template_usage(
  template_id_param TEXT,
  event_type_param TEXT,
  user_id_param UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update daily stats
  INSERT INTO public.template_usage_stats (template_id, date)
  VALUES (template_id_param, CURRENT_DATE)
  ON CONFLICT (template_id, date) DO NOTHING;
  
  -- Update counters based on event type
  CASE event_type_param
    WHEN 'view' THEN
      UPDATE public.template_usage_stats 
      SET total_views = total_views + 1,
          updated_at = now()
      WHERE template_id = template_id_param AND date = CURRENT_DATE;
    WHEN 'download' THEN
      UPDATE public.template_usage_stats 
      SET total_downloads = total_downloads + 1,
          updated_at = now()
      WHERE template_id = template_id_param AND date = CURRENT_DATE;
    WHEN 'generate' THEN
      UPDATE public.template_usage_stats 
      SET total_generations = total_generations + 1,
          updated_at = now()
      WHERE template_id = template_id_param AND date = CURRENT_DATE;
  END CASE;
END;
$$;

-- Create function to send compliance reminders
CREATE OR REPLACE FUNCTION public.schedule_compliance_reminder(
  compliance_id_param UUID,
  reminder_type_param TEXT,
  scheduled_date_param TIMESTAMP WITH TIME ZONE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  reminder_id UUID;
  user_id_var UUID;
BEGIN
  -- Get user_id from compliance tracking
  SELECT user_id INTO user_id_var 
  FROM public.legal_compliance_tracking 
  WHERE id = compliance_id_param;
  
  -- Create reminder
  INSERT INTO public.compliance_reminders (
    user_id, 
    compliance_tracking_id, 
    reminder_type, 
    scheduled_for
  ) VALUES (
    user_id_var,
    compliance_id_param,
    reminder_type_param,
    scheduled_date_param
  ) RETURNING id INTO reminder_id;
  
  RETURN reminder_id;
END;
$$;