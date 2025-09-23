-- Production Security Hardening Migration (Fixed)
-- Secure critical RLS policies and add production monitoring

-- 1. Secure partner pricing data - restrict to authenticated users only
DROP POLICY IF EXISTS "Partner pricing tiers are publicly readable" ON public.partner_pricing_tiers;
CREATE POLICY "Partner pricing tiers viewable by authenticated users only" 
ON public.partner_pricing_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Secure community data - require authentication
DROP POLICY IF EXISTS "Community posts are publicly readable" ON public.community_posts;
CREATE POLICY "Community posts viewable by authenticated users only" 
ON public.community_posts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Community votes are publicly readable" ON public.community_votes;
CREATE POLICY "Community votes viewable by authenticated users only" 
ON public.community_votes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Secure industry data - restrict to authenticated users
DROP POLICY IF EXISTS "Industry verticals are publicly readable" ON public.industry_verticals;
CREATE POLICY "Industry verticals viewable by authenticated users only" 
ON public.industry_verticals 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Update function search paths without dropping (fix existing functions)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. Create production monitoring table
CREATE TABLE IF NOT EXISTS public.production_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on production metrics
ALTER TABLE public.production_metrics ENABLE ROW LEVEL SECURITY;

-- Only allow system/admin access to production metrics
CREATE POLICY "Production metrics admin only" 
ON public.production_metrics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. Fix advanced alerts policies to require user ownership
DROP POLICY IF EXISTS "Users can view their own advanced alerts" ON public.advanced_alerts;
DROP POLICY IF EXISTS "Users can update their own advanced alerts" ON public.advanced_alerts;

CREATE POLICY "Users can manage only their own advanced alerts" 
ON public.advanced_alerts 
FOR ALL 
USING (auth.uid() = user_id);

-- 7. Secure AI monitoring tables properly
DROP POLICY IF EXISTS "Users can manage their own agent deployments" ON public.ai_agent_deployments;
CREATE POLICY "Users can manage only their own ai agent deployments" 
ON public.ai_agent_deployments 
FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own auto responses" ON public.ai_auto_responses;
CREATE POLICY "Users can manage only their own ai auto responses" 
ON public.ai_auto_responses 
FOR ALL 
USING (auth.uid() = user_id);

-- 8. Create production health monitoring function
CREATE OR REPLACE FUNCTION public.log_production_metric(
  metric_type_param TEXT,
  metric_name_param TEXT,
  metric_value_param NUMERIC,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.production_metrics (
    metric_type,
    metric_name,
    metric_value,
    metadata
  ) VALUES (
    metric_type_param,
    metric_name_param,
    metric_value_param,
    metadata_param
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- 9. Create production health check function
CREATE OR REPLACE FUNCTION public.get_production_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  uptime_hours NUMERIC;
  error_count INTEGER;
  active_users INTEGER;
BEGIN
  -- Calculate basic health metrics
  SELECT COUNT(*) INTO error_count
  FROM public.error_logs
  WHERE created_at > now() - interval '1 hour';
  
  SELECT COUNT(DISTINCT user_id) INTO active_users
  FROM public.ai_monitoring_agents
  WHERE last_scan > now() - interval '1 hour';
  
  -- Build health report
  result := jsonb_build_object(
    'status', CASE 
      WHEN error_count > 100 THEN 'critical'
      WHEN error_count > 50 THEN 'warning'
      ELSE 'healthy'
    END,
    'error_count_1h', error_count,
    'active_users_1h', active_users,
    'timestamp', now(),
    'uptime_status', 'operational'
  );
  
  RETURN result;
END;
$$;