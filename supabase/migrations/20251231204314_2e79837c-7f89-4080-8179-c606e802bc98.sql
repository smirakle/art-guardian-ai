
-- Fix policies that still allow anonymous access by dropping and recreating with TO authenticated

-- admin_online_status
DROP POLICY IF EXISTS "Admins can update their own status" ON public.admin_online_status;
DROP POLICY IF EXISTS "Authenticated users can view admin online status" ON public.admin_online_status;

CREATE POLICY "Auth users can view admin online status" 
  ON public.admin_online_status FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update own status" 
  ON public.admin_online_status FOR UPDATE 
  TO authenticated
  USING (auth.uid() = admin_id);

-- advanced_alerts (fix existing)
DROP POLICY IF EXISTS "Authenticated users can manage their own advanced alerts" ON public.advanced_alerts;

CREATE POLICY "Users can create advanced alerts" 
  ON public.advanced_alerts FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ai_agent_deployments
DROP POLICY IF EXISTS "Authenticated users can manage their own ai agent deployments" ON public.ai_agent_deployments;

CREATE POLICY "Users can view own ai agent deployments" 
  ON public.ai_agent_deployments FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai agent deployments" 
  ON public.ai_agent_deployments FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai agent deployments" 
  ON public.ai_agent_deployments FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_auto_responses
DROP POLICY IF EXISTS "Authenticated users can manage their own ai auto responses" ON public.ai_auto_responses;

CREATE POLICY "Users can view own ai auto responses" 
  ON public.ai_auto_responses FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai auto responses" 
  ON public.ai_auto_responses FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai auto responses" 
  ON public.ai_auto_responses FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_company_policies (admin-managed, auth read)
DROP POLICY IF EXISTS "Admins can manage AI company policies" ON public.ai_company_policies;
DROP POLICY IF EXISTS "Authenticated users can view AI company policies" ON public.ai_company_policies;

CREATE POLICY "Auth users can view ai company policies" 
  ON public.ai_company_policies FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ai company policies" 
  ON public.ai_company_policies FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_detection_results
DROP POLICY IF EXISTS "Authenticated users can manage their own AI detection results" ON public.ai_detection_results;

CREATE POLICY "Users can view own ai detection results" 
  ON public.ai_detection_results FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai detection results" 
  ON public.ai_detection_results FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai detection results" 
  ON public.ai_detection_results FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_document_tracers
DROP POLICY IF EXISTS "Users can delete their own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can update their own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can view their own document tracers" ON public.ai_document_tracers;

CREATE POLICY "Users can view own document tracers" 
  ON public.ai_document_tracers FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create document tracers" 
  ON public.ai_document_tracers FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document tracers" 
  ON public.ai_document_tracers FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own document tracers" 
  ON public.ai_document_tracers FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_monitoring_agents
DROP POLICY IF EXISTS "Authenticated users can manage their own monitoring agents" ON public.ai_monitoring_agents;

CREATE POLICY "Users can view own monitoring agents" 
  ON public.ai_monitoring_agents FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create monitoring agents" 
  ON public.ai_monitoring_agents FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitoring agents" 
  ON public.ai_monitoring_agents FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitoring agents" 
  ON public.ai_monitoring_agents FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_predictive_analyses
DROP POLICY IF EXISTS "Users can view their own predictive analyses" ON public.ai_predictive_analyses;

CREATE POLICY "Users can view own predictive analyses" 
  ON public.ai_predictive_analyses FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_protection_audit_log
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.ai_protection_audit_log;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.ai_protection_audit_log;

CREATE POLICY "Users can view own audit logs" 
  ON public.ai_protection_audit_log FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" 
  ON public.ai_protection_audit_log FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_protection_dmca_notices
DROP POLICY IF EXISTS "Users can manage their own dmca notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Authenticated users can manage their own AI protection DMCA notices" ON public.ai_protection_dmca_notices;

CREATE POLICY "Users can view own ai dmca notices" 
  ON public.ai_protection_dmca_notices FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai dmca notices" 
  ON public.ai_protection_dmca_notices FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai dmca notices" 
  ON public.ai_protection_dmca_notices FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);
