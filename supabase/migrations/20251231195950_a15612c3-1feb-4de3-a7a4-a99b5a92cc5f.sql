-- Phase 1: Security Hardening - Fix Anonymous Access Policies
-- This migration fixes RLS policies to require authentication

-- =====================================================
-- 1. admin_online_status - Restrict public view
-- =====================================================
DROP POLICY IF EXISTS "Everyone can view admin online status" ON public.admin_online_status;
CREATE POLICY "Authenticated users can view admin online status" 
ON public.admin_online_status
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 2. advanced_alerts - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own advanced alerts" ON public.advanced_alerts;
CREATE POLICY "Authenticated users can manage their own advanced alerts" 
ON public.advanced_alerts
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 3. ai_agent_deployments - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own ai agent deployments" ON public.ai_agent_deployments;
CREATE POLICY "Authenticated users can manage their own ai agent deployments" 
ON public.ai_agent_deployments
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 4. ai_auto_responses - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own ai auto responses" ON public.ai_auto_responses;
CREATE POLICY "Authenticated users can manage their own ai auto responses" 
ON public.ai_auto_responses
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 5. ai_company_policies - Restrict to authenticated for viewing
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view AI company policies" ON public.ai_company_policies;
CREATE POLICY "Authenticated users can view AI company policies" 
ON public.ai_company_policies
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND is_active = true);

-- =====================================================
-- 6. ai_detection_results - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own AI detection results" ON public.ai_detection_results;
CREATE POLICY "Authenticated users can manage their own AI detection results" 
ON public.ai_detection_results
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 7. ai_monitoring_agents - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own monitoring agents" ON public.ai_monitoring_agents;
CREATE POLICY "Authenticated users can manage their own monitoring agents" 
ON public.ai_monitoring_agents
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 8. ai_predictive_analyses - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own predictive analyses" ON public.ai_predictive_analyses;
CREATE POLICY "Users can view their own predictive analyses" 
ON public.ai_predictive_analyses
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 9. ai_protection_audit_log - Add auth check to user policy
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.ai_protection_audit_log;
CREATE POLICY "Users can view their own audit logs" 
ON public.ai_protection_audit_log
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.ai_protection_audit_log;
CREATE POLICY "Admins can view all audit logs" 
ON public.ai_protection_audit_log
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 10. ai_protection_rate_limits - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users manage their rate limits" ON public.ai_protection_rate_limits;
CREATE POLICY "Authenticated users manage their rate limits" 
ON public.ai_protection_rate_limits
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 11. ai_threat_detections - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view their own threat detections" ON public.ai_threat_detections;
CREATE POLICY "Authenticated users can view their own threat detections" 
ON public.ai_threat_detections
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 12. ai_training_datasets - Restrict to authenticated
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view AI training datasets" ON public.ai_training_datasets;
CREATE POLICY "Authenticated users can view AI training datasets" 
ON public.ai_training_datasets
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 13. ai_training_enforcement_workflows - Fix system policy
-- =====================================================
DROP POLICY IF EXISTS "System can create and update enforcement workflows" ON public.ai_training_enforcement_workflows;
CREATE POLICY "Service role can manage enforcement workflows" 
ON public.ai_training_enforcement_workflows
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own enforcement workflows" ON public.ai_training_enforcement_workflows;
CREATE POLICY "Users can manage their own enforcement workflows" 
ON public.ai_training_enforcement_workflows
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 14. alert_channels - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own alert channels" ON public.alert_channels;
CREATE POLICY "Authenticated users can manage their own alert channels" 
ON public.alert_channels
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 15. batch_processing_queue - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own batch processes" ON public.batch_processing_queue;
CREATE POLICY "Authenticated users can manage their own batch processes" 
ON public.batch_processing_queue
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 16. blockchain_licenses - Add auth check
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage their own blockchain licenses" ON public.blockchain_licenses;
CREATE POLICY "Authenticated users can manage their own blockchain licenses" 
ON public.blockchain_licenses
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 17. blockchain_ownership_registry - Restrict public verify
-- =====================================================
DROP POLICY IF EXISTS "Public can verify ownership" ON public.blockchain_ownership_registry;
CREATE POLICY "Authenticated users can verify ownership" 
ON public.blockchain_ownership_registry
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage their own ownership registration" ON public.blockchain_ownership_registry;
CREATE POLICY "Authenticated users can manage their own ownership registration" 
ON public.blockchain_ownership_registry
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 18. blockchain_verifications - Restrict to authenticated
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view blockchain verifications" ON public.blockchain_verifications;
CREATE POLICY "Authenticated users can view blockchain verifications" 
ON public.blockchain_verifications
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create blockchain verifications" ON public.blockchain_verifications;
CREATE POLICY "Authenticated users can create blockchain verifications" 
ON public.blockchain_verifications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);