-- Create alert notifications log table
CREATE TABLE IF NOT EXISTS public.alert_notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'email',
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  email_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email notification preferences table
CREATE TABLE IF NOT EXISTS public.email_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  copyright_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  deepfake_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  high_priority_only BOOLEAN NOT NULL DEFAULT false,
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  digest_time TIME NOT NULL DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.alert_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alert_notifications_log
CREATE POLICY "Users can view their own notification logs"
ON public.alert_notifications_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notification logs"
ON public.alert_notifications_log FOR INSERT
WITH CHECK (true);

-- Create RLS policies for email_notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.email_notification_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_preferences_updated_at();

-- Create function to get user notification preferences
CREATE OR REPLACE FUNCTION public.get_user_notification_preferences(user_id_param UUID)
RETURNS TABLE(
  copyright_alerts_enabled BOOLEAN,
  deepfake_alerts_enabled BOOLEAN,
  high_priority_only BOOLEAN,
  daily_digest_enabled BOOLEAN,
  digest_time TIME
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(enp.copyright_alerts_enabled, true),
    COALESCE(enp.deepfake_alerts_enabled, true),
    COALESCE(enp.high_priority_only, false),
    COALESCE(enp.daily_digest_enabled, true),
    COALESCE(enp.digest_time, '09:00:00'::TIME)
  FROM public.email_notification_preferences enp
  WHERE enp.user_id = user_id_param
  UNION ALL
  SELECT true, true, false, true, '09:00:00'::TIME
  WHERE NOT EXISTS (
    SELECT 1 FROM public.email_notification_preferences 
    WHERE user_id = user_id_param
  )
  LIMIT 1;
$$;