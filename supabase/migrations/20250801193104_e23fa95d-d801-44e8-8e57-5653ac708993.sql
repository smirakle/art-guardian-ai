-- Production Optimization: Fix remaining linter warnings and performance improvements

-- 1. Fix Function Search Path for remaining functions
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Update comments count
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Update likes count for posts
  IF NEW.post_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.vote_type = 'like' AND NEW.vote_type != 'like' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count - 1 
        WHERE id = NEW.post_id;
      ELSIF OLD.vote_type != 'like' AND NEW.vote_type = 'like' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
      END IF;
    END IF;
  END IF;
  
  -- Update likes count for expert advice
  IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
    UPDATE public.expert_advice 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
    UPDATE public.expert_advice 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_legal_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_document_hash(content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$$;

-- 2. Tighten RLS policies to restrict anonymous access for service-related tables
DROP POLICY IF EXISTS "Service role manages admin sessions" ON public.admin_sessions;
CREATE POLICY "Service role can manage admin sessions"
  ON public.admin_sessions FOR ALL
  TO service_role
  USING (true);

-- 3. Add performance optimizations: Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_artwork_user_id_status 
  ON public.artwork(user_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_copyright_matches_artwork_threat 
  ON public.copyright_matches(artwork_id, threat_level, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_user_unread 
  ON public.monitoring_alerts(user_id, is_read, created_at DESC) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_portfolio_items_portfolio_active 
  ON public.portfolio_items(portfolio_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_social_media_results_account_threat 
  ON public.social_media_monitoring_results(account_id, threat_level, detected_at DESC);

-- 4. Create optimized function for dashboard data retrieval with built-in security
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats()
RETURNS TABLE(
  protected_artworks bigint,
  total_scans bigint,
  high_threats bigint,
  total_portfolios bigint,
  protection_score integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as protected_artworks,
    COUNT(DISTINCT cm.id) as total_scans,
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.threat_level = 'high') as high_threats,
    COUNT(DISTINCT p.id) as total_portfolios,
    CASE 
      WHEN COUNT(DISTINCT a.id) = 0 THEN 0
      ELSE (100 - (COUNT(DISTINCT cm.id) FILTER (WHERE cm.threat_level = 'high') * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0)))::integer
    END as protection_score
  FROM public.artwork a
  LEFT JOIN public.copyright_matches cm ON a.id = cm.artwork_id
  LEFT JOIN public.portfolios p ON a.user_id = p.user_id AND p.is_active = true
  WHERE a.user_id = auth.uid();
$$;

-- 5. Add audit log entry for production optimization
INSERT INTO public.security_audit_log (
  user_id, 
  action, 
  resource_type, 
  resource_id, 
  details
) VALUES (
  auth.uid(),
  'production_optimization',
  'database',
  'performance_security',
  jsonb_build_object(
    'description', 'Applied production optimization: fixed remaining security issues and added performance improvements',
    'timestamp', now(),
    'changes', jsonb_build_array(
      'Fixed search_path for remaining trigger functions',
      'Tightened admin session policies',
      'Added performance indexes for common queries',
      'Created optimized dashboard stats function with built-in security'
    )
  )
);