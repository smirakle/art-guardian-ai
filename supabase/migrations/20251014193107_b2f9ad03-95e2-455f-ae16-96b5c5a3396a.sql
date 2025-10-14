-- Continue fixing security issues - Part 2
-- Fix remaining functions and tighten more RLS policies

-- Additional function search_path fixes
CREATE OR REPLACE FUNCTION public.schedule_compliance_reminder(
  compliance_id_param uuid,
  reminder_type_param text,
  scheduled_date_param timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  reminder_id UUID;
  user_id_var UUID;
BEGIN
  SELECT user_id INTO user_id_var 
  FROM public.legal_compliance_tracking 
  WHERE id = compliance_id_param;
  
  INSERT INTO public.compliance_reminders (
    user_id, compliance_tracking_id, reminder_type, scheduled_for
  ) VALUES (
    user_id_var, compliance_id_param, reminder_type_param, scheduled_date_param
  ) RETURNING id INTO reminder_id;
  
  RETURN reminder_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
      UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
      UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.vote_type = 'like' AND NEW.vote_type != 'like' THEN
        UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = NEW.post_id;
      ELSIF OLD.vote_type != 'like' AND NEW.vote_type = 'like' THEN
        UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  END IF;
  
  IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
    UPDATE public.expert_advice SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
    UPDATE public.expert_advice SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  total_storage BIGINT := 0;
  artwork_count_val INTEGER := 0;
  base_limit BIGINT := 1073741824;
  addon_storage BIGINT := 0;
  total_limit BIGINT;
BEGIN
  SELECT COUNT(*) INTO artwork_count_val
  FROM public.artwork
  WHERE user_id = user_id_param AND status = 'active';
  
  total_storage := artwork_count_val * 5242880;
  
  SELECT COALESCE(SUM(storage_amount_gb * 1073741824), 0) INTO addon_storage
  FROM public.storage_addons
  WHERE user_id = user_id_param AND is_active = true;
  
  total_limit := base_limit + addon_storage;
  
  INSERT INTO public.user_storage_usage (
    user_id, storage_used_bytes, storage_limit_bytes, artwork_count, last_calculated_at
  ) VALUES (
    user_id_param, total_storage, total_limit, artwork_count_val, now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    storage_used_bytes = EXCLUDED.storage_used_bytes,
    storage_limit_bytes = EXCLUDED.storage_limit_bytes,
    artwork_count = EXCLUDED.artwork_count,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_ai_protection_rate_limit(
  user_id_param uuid,
  endpoint_param text,
  max_requests_param integer DEFAULT 100,
  window_minutes_param integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes_param) * 
    (window_minutes_param || ' minutes')::interval;
  
  INSERT INTO public.ai_protection_rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (user_id_param, endpoint_param, window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET 
    request_count = ai_protection_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  RETURN current_count <= max_requests_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_portfolio_monitoring_rate_limit(
  user_id_param uuid,
  endpoint_param text,
  max_requests_param integer DEFAULT 100,
  window_minutes_param integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes_param) * 
    (window_minutes_param || ' minutes')::interval;
  
  INSERT INTO public.portfolio_monitoring_rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (user_id_param, endpoint_param, window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET 
    request_count = portfolio_monitoring_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  RETURN current_count <= max_requests_param;
END;
$function$;

-- Add authentication requirements to remaining sensitive tables
-- Community features should still be viewable by all but managed by authenticated users only
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- Cache and performance tables should only be managed by authenticated users
DROP POLICY IF EXISTS "Users can manage their own rate limits" ON public.ai_protection_rate_limits;
CREATE POLICY "Authenticated users manage their rate limits"
ON public.ai_protection_rate_limits
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System metrics should only be viewable by admins
DROP POLICY IF EXISTS "System can manage cache statistics" ON public.cache_statistics;
CREATE POLICY "System and admins can manage cache statistics"
ON public.cache_statistics
FOR ALL
TO authenticated
USING (
  auth.role() = 'service_role' OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Production metrics should be admin-only
DROP POLICY IF EXISTS "Admins can view all AI protection metrics" ON public.ai_protection_metrics;
DROP POLICY IF EXISTS "System can insert AI protection metrics" ON public.ai_protection_metrics;

CREATE POLICY "System and admins can manage AI protection metrics"
ON public.ai_protection_metrics
FOR ALL
TO authenticated
USING (
  auth.role() = 'service_role' OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.role() = 'service_role' OR 
  has_role(auth.uid(), 'admin'::app_role)
);