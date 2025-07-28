-- CRITICAL SECURITY FIX: Update RLS policies to require authentication
-- Phase 1: Fix anonymous access to sensitive tables

-- 1. Fix artwork table - should only allow authenticated users
DROP POLICY IF EXISTS "Users can manage their own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Admins can view all artwork" ON public.artwork;

CREATE POLICY "Users can manage their own artwork" 
ON public.artwork 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all artwork" 
ON public.artwork 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix profiles table - require authentication
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix subscriptions table - require authentication
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- System operations need to be done via service role, not anonymous
CREATE POLICY "Service role can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (auth.role() = 'service_role');

-- 4. Fix security_audit_log - remove system insert policy, require service role
DROP POLICY IF EXISTS "System can create audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins can view security audit logs" ON public.security_audit_log;

CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can create audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 5. Fix admin_sessions - should only be accessible by service role
DROP POLICY IF EXISTS "System manages admin sessions" ON public.admin_sessions;

CREATE POLICY "Service role manages admin sessions" 
ON public.admin_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- 6. Fix monitoring tables - require authentication
DROP POLICY IF EXISTS "Users can manage their own monitoring schedules" ON public.monitoring_schedules;
CREATE POLICY "Users can manage their own monitoring schedules" 
ON public.monitoring_schedules 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own scheduled scans" ON public.scheduled_scans;
CREATE POLICY "Users can manage their own scheduled scans" 
ON public.scheduled_scans 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 7. Fix social media tables - require authentication
DROP POLICY IF EXISTS "Users can manage their own social media accounts" ON public.social_media_accounts;
CREATE POLICY "Users can manage their own social media accounts" 
ON public.social_media_accounts 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 8. Fix monitoring alerts - require authentication
DROP POLICY IF EXISTS "Users can view their own alerts" ON public.monitoring_alerts;
CREATE POLICY "Users can view their own alerts" 
ON public.monitoring_alerts 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 9. Fix copyright_matches - require authentication and proper ownership
DROP POLICY IF EXISTS "Users can view their own matches" ON public.copyright_matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.copyright_matches;
DROP POLICY IF EXISTS "Users can create matches for their own scans" ON public.copyright_matches;
DROP POLICY IF EXISTS "Users can delete their copyright matches" ON public.copyright_matches;
DROP POLICY IF EXISTS "Admins can view all copyright matches" ON public.copyright_matches;

CREATE POLICY "Users can view their own matches" 
ON public.copyright_matches 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND artwork_id IN (
  SELECT id FROM artwork WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own matches" 
ON public.copyright_matches 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND artwork_id IN (
  SELECT id FROM artwork WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create matches for their own scans" 
ON public.copyright_matches 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND artwork_id IN (
  SELECT id FROM artwork WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their copyright matches" 
ON public.copyright_matches 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND artwork_id IN (
  SELECT id FROM artwork WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all copyright matches" 
ON public.copyright_matches 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 10. Keep community tables public but add rate limiting considerations
-- community_posts, community_comments, community_votes can remain public for viewing
-- but creation should require authentication

DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Similarly for comments
DROP POLICY IF EXISTS "Users can create comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.community_comments;

CREATE POLICY "Authenticated users can create comments" 
ON public.community_comments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.community_comments 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.community_comments 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- And for votes
DROP POLICY IF EXISTS "Users can create votes" ON public.community_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.community_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.community_votes;

CREATE POLICY "Authenticated users can create votes" 
ON public.community_votes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.community_votes 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.community_votes 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);