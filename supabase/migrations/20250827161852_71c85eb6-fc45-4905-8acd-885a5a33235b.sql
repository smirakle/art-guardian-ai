-- Create mobile app usage tracking table
CREATE TABLE public.mobile_app_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_info JSONB,
  app_version TEXT,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  features_used TEXT[],
  crash_reports JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mobile app usage
ALTER TABLE public.mobile_app_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile app usage
CREATE POLICY "Users can view their own mobile usage" 
ON public.mobile_app_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mobile usage" 
ON public.mobile_app_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mobile usage" 
ON public.mobile_app_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mobile usage" 
ON public.mobile_app_usage 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create mobile notifications table
CREATE TABLE public.mobile_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  platform TEXT CHECK (platform IN ('ios', 'android', 'both')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  push_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mobile notifications
ALTER TABLE public.mobile_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile notifications
CREATE POLICY "Users can view their own notifications" 
ON public.mobile_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.mobile_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" 
ON public.mobile_notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create mobile app settings table
CREATE TABLE public.mobile_app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  biometric_auth_enabled BOOLEAN NOT NULL DEFAULT false,
  offline_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  theme_preference TEXT NOT NULL DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language_preference TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mobile app settings
ALTER TABLE public.mobile_app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile app settings
CREATE POLICY "Users can view their own mobile settings" 
ON public.mobile_app_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mobile settings" 
ON public.mobile_app_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mobile settings" 
ON public.mobile_app_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create update triggers
CREATE TRIGGER update_mobile_app_usage_updated_at
BEFORE UPDATE ON public.mobile_app_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mobile_notifications_updated_at
BEFORE UPDATE ON public.mobile_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mobile_app_settings_updated_at
BEFORE UPDATE ON public.mobile_app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_mobile_app_usage_user_id ON public.mobile_app_usage(user_id);
CREATE INDEX idx_mobile_app_usage_platform ON public.mobile_app_usage(platform);
CREATE INDEX idx_mobile_notifications_user_id ON public.mobile_notifications(user_id);
CREATE INDEX idx_mobile_notifications_status ON public.mobile_notifications(status);
CREATE INDEX idx_mobile_app_settings_user_id ON public.mobile_app_settings(user_id);