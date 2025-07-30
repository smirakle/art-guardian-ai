-- Create comprehensive profile monitoring system tables

-- Table to store profiles that users want to monitor
CREATE TABLE public.profile_monitoring_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_name TEXT NOT NULL,
  target_description TEXT,
  profile_images TEXT[] DEFAULT '{}',
  target_usernames TEXT[] DEFAULT '{}',
  target_emails TEXT[] DEFAULT '{}',
  platforms_to_monitor TEXT[] DEFAULT '{}',
  monitoring_enabled BOOLEAN DEFAULT true,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_monitoring_targets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own monitoring targets"
ON public.profile_monitoring_targets
FOR ALL
USING (auth.uid() = user_id);

-- Table to store comprehensive scan results across all platforms
CREATE TABLE public.profile_scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  platform TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  profile_username TEXT,
  profile_name TEXT,
  profile_bio TEXT,
  profile_image_url TEXT,
  similarity_score DOUBLE PRECISION DEFAULT 0,
  confidence_score DOUBLE PRECISION DEFAULT 0,
  risk_level TEXT DEFAULT 'low',
  scan_type TEXT DEFAULT 'automated',
  detected_issues TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_reviewed BOOLEAN DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_scan_results ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their profile scan results"
ON public.profile_scan_results
FOR SELECT
USING (target_id IN (
  SELECT id FROM profile_monitoring_targets WHERE user_id = auth.uid()
));

CREATE POLICY "System can create profile scan results"
ON public.profile_scan_results
FOR INSERT
WITH CHECK (true);

-- Table for impersonation alerts
CREATE TABLE public.profile_impersonation_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  scan_result_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_actions TEXT[] DEFAULT '{}',
  is_acknowledged BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_impersonation_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own impersonation alerts"
ON public.profile_impersonation_alerts
FOR ALL
USING (auth.uid() = user_id);

-- Table for risk assessments
CREATE TABLE public.profile_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  overall_risk_score INTEGER DEFAULT 0,
  identity_theft_risk INTEGER DEFAULT 0,
  impersonation_risk INTEGER DEFAULT 0,
  brand_damage_risk INTEGER DEFAULT 0,
  financial_risk INTEGER DEFAULT 0,
  assessment_factors JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their risk assessments"
ON public.profile_risk_assessments
FOR SELECT
USING (target_id IN (
  SELECT id FROM profile_monitoring_targets WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage risk assessments"
ON public.profile_risk_assessments
FOR ALL
USING (true);

-- Table for platform configurations
CREATE TABLE public.monitored_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL UNIQUE,
  platform_category TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  api_endpoint TEXT,
  scan_frequency_minutes INTEGER DEFAULT 60,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitored_platforms ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view monitored platforms"
ON public.monitored_platforms
FOR SELECT
USING (true);

-- Insert default platforms
INSERT INTO public.monitored_platforms (platform_name, platform_category, features) VALUES
('Facebook', 'social_media', '{"image_search": true, "username_search": true, "bio_analysis": true}'),
('Instagram', 'social_media', '{"image_search": true, "username_search": true, "story_monitoring": true}'),
('Twitter/X', 'social_media', '{"real_time_monitoring": true, "username_search": true, "bio_analysis": true}'),
('LinkedIn', 'professional', '{"profile_monitoring": true, "company_search": true, "experience_tracking": true}'),
('YouTube', 'content', '{"channel_monitoring": true, "video_analysis": true, "comment_tracking": true}'),
('TikTok', 'social_media', '{"video_analysis": true, "username_search": true, "trend_monitoring": true}'),
('GitHub', 'professional', '{"repository_monitoring": true, "contribution_tracking": true, "profile_analysis": true}'),
('Behance', 'creative', '{"portfolio_monitoring": true, "project_tracking": true, "image_analysis": true}'),
('DeviantArt', 'creative', '{"artwork_monitoring": true, "gallery_tracking": true, "image_analysis": true}'),
('Etsy', 'ecommerce', '{"shop_monitoring": true, "product_tracking": true, "review_analysis": true}'),
('Amazon', 'ecommerce', '{"seller_monitoring": true, "product_listings": true, "review_tracking": true}'),
('eBay', 'ecommerce', '{"listing_monitoring": true, "seller_tracking": true, "image_analysis": true}'),
('Medium', 'content', '{"article_monitoring": true, "author_tracking": true, "content_analysis": true}'),
('WordPress', 'content', '{"blog_monitoring": true, "author_tracking": true, "content_analysis": true}'),
('Dark Web', 'security', '{"marketplace_monitoring": true, "forum_tracking": true, "credential_monitoring": true}');

-- Create trigger for updating timestamps
CREATE TRIGGER update_profile_monitoring_targets_updated_at
BEFORE UPDATE ON public.profile_monitoring_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.profile_scan_results
ADD CONSTRAINT fk_profile_scan_results_target
FOREIGN KEY (target_id) REFERENCES public.profile_monitoring_targets(id) ON DELETE CASCADE;

ALTER TABLE public.profile_impersonation_alerts
ADD CONSTRAINT fk_profile_impersonation_alerts_target
FOREIGN KEY (target_id) REFERENCES public.profile_monitoring_targets(id) ON DELETE CASCADE;

ALTER TABLE public.profile_impersonation_alerts
ADD CONSTRAINT fk_profile_impersonation_alerts_scan_result
FOREIGN KEY (scan_result_id) REFERENCES public.profile_scan_results(id) ON DELETE CASCADE;

ALTER TABLE public.profile_risk_assessments
ADD CONSTRAINT fk_profile_risk_assessments_target
FOREIGN KEY (target_id) REFERENCES public.profile_monitoring_targets(id) ON DELETE CASCADE;