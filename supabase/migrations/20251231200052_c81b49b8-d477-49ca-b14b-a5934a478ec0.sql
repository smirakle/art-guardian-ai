-- Phase 1 Batch 2: Security Hardening - Fix More Anonymous Access Policies

-- =====================================================
-- 19. ai_document_tracers - Add auth check to all policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can update their own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can delete their own document tracers" ON public.ai_document_tracers;

CREATE POLICY "Users can view their own document tracers" 
ON public.ai_document_tracers FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own document tracers" 
ON public.ai_document_tracers FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own document tracers" 
ON public.ai_document_tracers FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 20. ai_protection_dmca_notices - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own DMCA notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Users can update their own DMCA notices" ON public.ai_protection_dmca_notices;

CREATE POLICY "Users can view their own DMCA notices" 
ON public.ai_protection_dmca_notices FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own DMCA notices" 
ON public.ai_protection_dmca_notices FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 21. ai_protection_metrics - Fix admin policy
-- =====================================================
DROP POLICY IF EXISTS "System and admins can manage AI protection metrics" ON public.ai_protection_metrics;
CREATE POLICY "System and admins can manage AI protection metrics" 
ON public.ai_protection_metrics FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage AI protection metrics" 
ON public.ai_protection_metrics FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =====================================================
-- 22. ai_protection_notifications - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own AI protection notifications" ON public.ai_protection_notifications;
DROP POLICY IF EXISTS "Users can update their own AI protection notifications" ON public.ai_protection_notifications;

CREATE POLICY "Users can view their own AI protection notifications" 
ON public.ai_protection_notifications FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own AI protection notifications" 
ON public.ai_protection_notifications FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 23. ai_protection_records - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can update their own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Admins can view all protection records" ON public.ai_protection_records;

CREATE POLICY "Users can view their own protection records" 
ON public.ai_protection_records FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own protection records" 
ON public.ai_protection_records FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all protection records" 
ON public.ai_protection_records FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 24. ai_training_datasets - Fix admin policy
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage AI training datasets" ON public.ai_training_datasets;
CREATE POLICY "Admins can manage AI training datasets" 
ON public.ai_training_datasets FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 25. ai_training_violations - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can update their own violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Admins can manage all violations" ON public.ai_training_violations;

CREATE POLICY "Users can view their own violations" 
ON public.ai_training_violations FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own violations" 
ON public.ai_training_violations FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can manage all violations" 
ON public.ai_training_violations FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 26. alert_notifications_log - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.alert_notifications_log;
CREATE POLICY "Users can view their own notification logs" 
ON public.alert_notifications_log FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 27. artwork - Already has auth check, keep as is
-- =====================================================

-- =====================================================
-- 28. backup_logs - Fix admin policy
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage backup logs" ON public.backup_logs;
CREATE POLICY "Admins can manage backup logs" 
ON public.backup_logs FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 29. blockchain_certificates - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.blockchain_certificates;
CREATE POLICY "Users can view their own certificates" 
ON public.blockchain_certificates FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 30. cache_statistics - Fix admin policy
-- =====================================================
DROP POLICY IF EXISTS "System and admins can manage cache statistics" ON public.cache_statistics;
CREATE POLICY "Admins can manage cache statistics" 
ON public.cache_statistics FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage cache statistics" 
ON public.cache_statistics FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =====================================================
-- 31. cdn_cache_analytics - Fix admin policy
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage CDN cache analytics" ON public.cdn_cache_analytics;
CREATE POLICY "Admins can manage CDN cache analytics" 
ON public.cdn_cache_analytics FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 32. cdn_configurations - Fix policies
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all CDN configurations" ON public.cdn_configurations;
DROP POLICY IF EXISTS "Authenticated users can view CDN configurations" ON public.cdn_configurations;

CREATE POLICY "Admins can manage all CDN configurations" 
ON public.cdn_configurations FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view CDN configurations" 
ON public.cdn_configurations FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 33. profiles - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 34. subscriptions - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 35. user_roles - Fix policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));