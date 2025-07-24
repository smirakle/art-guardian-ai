-- Create social media accounts table for monitoring
CREATE TABLE public.social_media_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram', 'tiktok')),
  account_handle TEXT NOT NULL,
  account_url TEXT NOT NULL,
  account_name TEXT,
  follower_count INTEGER,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  monitoring_enabled BOOLEAN DEFAULT true,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, account_handle)
);

-- Enable RLS
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own social media accounts" 
ON public.social_media_accounts 
FOR ALL 
USING (auth.uid() = user_id);

-- Create social media monitoring results table
CREATE TABLE public.social_media_monitoring_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.social_media_accounts(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'post', 'story')),
  content_url TEXT NOT NULL,
  content_title TEXT,
  content_description TEXT,
  thumbnail_url TEXT,
  detection_type TEXT NOT NULL CHECK (detection_type IN ('deepfake', 'copyright', 'impersonation')),
  confidence_score DOUBLE PRECISION NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  threat_level TEXT NOT NULL DEFAULT 'medium' CHECK (threat_level IN ('low', 'medium', 'high')),
  artifacts_detected TEXT[],
  is_reviewed BOOLEAN DEFAULT false,
  action_taken TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_monitoring_results ENABLE ROW LEVEL SECURITY;

-- Create policies for monitoring results
CREATE POLICY "Users can view their social media monitoring results" 
ON public.social_media_monitoring_results 
FOR SELECT 
USING (account_id IN (
  SELECT id FROM public.social_media_accounts WHERE user_id = auth.uid()
));

CREATE POLICY "System can create monitoring results" 
ON public.social_media_monitoring_results 
FOR INSERT 
WITH CHECK (true);

-- Create social media monitoring scans table
CREATE TABLE public.social_media_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.social_media_accounts(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('full', 'incremental', 'realtime')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  content_scanned INTEGER DEFAULT 0,
  detections_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for scans
CREATE POLICY "Users can view their social media scans" 
ON public.social_media_scans 
FOR ALL 
USING (account_id IN (
  SELECT id FROM public.social_media_accounts WHERE user_id = auth.uid()
));

-- Create trigger for updating timestamps
CREATE TRIGGER update_social_media_accounts_updated_at
BEFORE UPDATE ON public.social_media_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all social media tables
ALTER TABLE public.social_media_accounts REPLICA IDENTITY FULL;
ALTER TABLE public.social_media_monitoring_results REPLICA IDENTITY FULL;
ALTER TABLE public.social_media_scans REPLICA IDENTITY FULL;