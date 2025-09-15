-- Fix database function security by setting proper search_path
-- This addresses the mutable search_path security warnings

-- Update existing functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.generate_enterprise_api_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  api_key TEXT;
BEGIN
  -- Generate a secure random API key with prefix
  api_key := 'tsmo_' || encode(gen_random_bytes(32), 'hex');
  RETURN api_key;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_government_api_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  api_key TEXT;
BEGIN
  -- Generate a secure government API key with prefix
  api_key := 'gov_' || encode(gen_random_bytes(40), 'hex');
  RETURN api_key;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_secure_api_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  api_key text;
BEGIN
  -- Generate a cryptographically secure API key
  api_key := 'tsmo_' || encode(gen_random_bytes(40), 'hex');
  RETURN api_key;
END;
$function$;

CREATE OR REPLACE FUNCTION public.hash_session_token(token text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(sha256(convert_to(token, 'UTF8')), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_document_hash(content text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$function$;

-- Fix community data exposure by requiring authentication
-- Update RLS policies to require authentication for community features

-- Secure community posts
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Community posts viewable by authenticated users" ON public.community_posts;

CREATE POLICY "Authenticated users can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Secure community comments  
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_comments;

CREATE POLICY "Authenticated users can view comments" 
ON public.community_comments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Secure community votes
DROP POLICY IF EXISTS "Community votes viewable by authenticated users" ON public.community_votes;
DROP POLICY IF EXISTS "Users can view all votes" ON public.community_votes;

CREATE POLICY "Authenticated users can view votes" 
ON public.community_votes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Secure expert profiles (if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expert_profiles' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view expert profiles" ON public.expert_profiles';
    EXECUTE 'CREATE POLICY "Authenticated users can view expert profiles" ON public.expert_profiles FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Secure expert advice (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expert_advice' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view expert advice" ON public.expert_advice';
    EXECUTE 'CREATE POLICY "Authenticated users can view expert advice" ON public.expert_advice FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Create production monitoring tables
CREATE TABLE IF NOT EXISTS public.production_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_type text NOT NULL DEFAULT 'counter',
  labels jsonb DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on production metrics
ALTER TABLE public.production_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins can view production metrics
CREATE POLICY "Admins can manage production metrics" 
ON public.production_metrics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create error tracking table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message text NOT NULL,
  error_stack text,
  user_id uuid,
  request_path text,
  user_agent text,
  ip_address inet,
  severity text NOT NULL DEFAULT 'error',
  metadata jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on error logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- System can create error logs, admins can view all
CREATE POLICY "System can create error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all error logs" 
ON public.error_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create backup tracking table
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type text NOT NULL,
  status text NOT NULL DEFAULT 'started',
  file_size_bytes bigint,
  backup_location text,
  error_message text,
  metadata jsonb DEFAULT '{}',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on backup logs
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage backups
CREATE POLICY "Admins can manage backup logs" 
ON public.backup_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create compliance tracking enhancements
CREATE TABLE IF NOT EXISTS public.gdpr_consent_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL,
  consent_version text NOT NULL DEFAULT '1.0',
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on GDPR consent
ALTER TABLE public.gdpr_consent_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent logs, admins can view all
CREATE POLICY "Users can view their own consent logs" 
ON public.gdpr_consent_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent logs" 
ON public.gdpr_consent_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create data retention policies table
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  retention_days integer NOT NULL,
  last_cleanup timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on data retention policies
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Only admins can manage data retention policies
CREATE POLICY "Admins can manage data retention policies" 
ON public.data_retention_policies 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data retention policies
INSERT INTO public.data_retention_policies (table_name, retention_days) VALUES
('error_logs', 90),
('backup_logs', 365),
('gdpr_consent_logs', 2555), -- 7 years for legal compliance
('production_metrics', 365),
('ai_protection_audit_log', 2555),
('portfolio_monitoring_audit_log', 1095) -- 3 years
ON CONFLICT DO NOTHING;

-- Create function to record production metrics
CREATE OR REPLACE FUNCTION public.record_production_metric(
  metric_name_param text,
  metric_value_param numeric,
  metric_type_param text DEFAULT 'counter',
  labels_param jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.production_metrics (
    metric_name,
    metric_value,
    metric_type,
    labels
  ) VALUES (
    metric_name_param,
    metric_value_param,
    metric_type_param,
    labels_param
  );
END;
$function$;

-- Create function to log errors
CREATE OR REPLACE FUNCTION public.log_error(
  error_message_param text,
  error_stack_param text DEFAULT NULL,
  user_id_param uuid DEFAULT NULL,
  request_path_param text DEFAULT NULL,
  severity_param text DEFAULT 'error',
  metadata_param jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  error_id uuid;
BEGIN
  INSERT INTO public.error_logs (
    error_message,
    error_stack,
    user_id,
    request_path,
    severity,
    metadata
  ) VALUES (
    error_message_param,
    error_stack_param,
    user_id_param,
    request_path_param,
    severity_param,
    metadata_param
  ) RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$function$;