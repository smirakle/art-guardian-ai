-- Batch 3: Fix RLS policies for remaining tables with TO authenticated

-- admin_online_status
DROP POLICY IF EXISTS "Admins can update own status" ON public.admin_online_status;
DROP POLICY IF EXISTS "Auth users can view admin online status" ON public.admin_online_status;
CREATE POLICY "Admins can update own status" ON public.admin_online_status FOR UPDATE TO authenticated USING (admin_id = auth.uid()) WITH CHECK (admin_id = auth.uid());
CREATE POLICY "Auth users can view admin online status" ON public.admin_online_status FOR SELECT TO authenticated USING (true);

-- ai_agent_deployments
DROP POLICY IF EXISTS "Users can update own ai agent deployments" ON public.ai_agent_deployments;
DROP POLICY IF EXISTS "Users can view own ai agent deployments" ON public.ai_agent_deployments;
CREATE POLICY "Users can view own ai agent deployments" ON public.ai_agent_deployments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own ai agent deployments" ON public.ai_agent_deployments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_auto_responses
DROP POLICY IF EXISTS "Users can update own ai auto responses" ON public.ai_auto_responses;
DROP POLICY IF EXISTS "Users can view own ai auto responses" ON public.ai_auto_responses;
CREATE POLICY "Users can view own ai auto responses" ON public.ai_auto_responses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own ai auto responses" ON public.ai_auto_responses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_company_policies
DROP POLICY IF EXISTS "Admins can manage ai company policies" ON public.ai_company_policies;
DROP POLICY IF EXISTS "Auth users can view ai company policies" ON public.ai_company_policies;
CREATE POLICY "Auth users can view ai company policies" ON public.ai_company_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage ai company policies" ON public.ai_company_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_detection_results
DROP POLICY IF EXISTS "Users can update own ai detection results" ON public.ai_detection_results;
DROP POLICY IF EXISTS "Users can view own ai detection results" ON public.ai_detection_results;
CREATE POLICY "Users can view own ai detection results" ON public.ai_detection_results FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own ai detection results" ON public.ai_detection_results FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_document_tracers
DROP POLICY IF EXISTS "Users can delete own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can update own document tracers" ON public.ai_document_tracers;
DROP POLICY IF EXISTS "Users can view own document tracers" ON public.ai_document_tracers;
CREATE POLICY "Users can view own document tracers" ON public.ai_document_tracers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own document tracers" ON public.ai_document_tracers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own document tracers" ON public.ai_document_tracers FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ai_monitoring_agents
DROP POLICY IF EXISTS "Users can delete own monitoring agents" ON public.ai_monitoring_agents;
DROP POLICY IF EXISTS "Users can update own monitoring agents" ON public.ai_monitoring_agents;
DROP POLICY IF EXISTS "Users can view own monitoring agents" ON public.ai_monitoring_agents;
CREATE POLICY "Users can view own monitoring agents" ON public.ai_monitoring_agents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own monitoring agents" ON public.ai_monitoring_agents FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own monitoring agents" ON public.ai_monitoring_agents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ai_predictive_analyses
DROP POLICY IF EXISTS "Users can view own predictive analyses" ON public.ai_predictive_analyses;
CREATE POLICY "Users can view own predictive analyses" ON public.ai_predictive_analyses FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ai_protection_audit_log
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.ai_protection_audit_log;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.ai_protection_audit_log;
CREATE POLICY "Users can view own audit logs" ON public.ai_protection_audit_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all audit logs" ON public.ai_protection_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_protection_dmca_notices
DROP POLICY IF EXISTS "Users can create own dmca notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Users can update own dmca notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Users can view own dmca notices" ON public.ai_protection_dmca_notices;
CREATE POLICY "Users can view own dmca notices" ON public.ai_protection_dmca_notices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own dmca notices" ON public.ai_protection_dmca_notices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own dmca notices" ON public.ai_protection_dmca_notices FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_protection_metrics
DROP POLICY IF EXISTS "Admins can manage metrics" ON public.ai_protection_metrics;
DROP POLICY IF EXISTS "Auth users can view metrics" ON public.ai_protection_metrics;
CREATE POLICY "Auth users can view metrics" ON public.ai_protection_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage metrics" ON public.ai_protection_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_protection_notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.ai_protection_notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.ai_protection_notifications;
CREATE POLICY "Users can view own notifications" ON public.ai_protection_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.ai_protection_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_protection_rate_limits
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.ai_protection_rate_limits;
CREATE POLICY "Users can view own rate limits" ON public.ai_protection_rate_limits FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ai_protection_records
DROP POLICY IF EXISTS "Users can create own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can delete own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can update own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can view own protection records" ON public.ai_protection_records;
CREATE POLICY "Users can view own protection records" ON public.ai_protection_records FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own protection records" ON public.ai_protection_records FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own protection records" ON public.ai_protection_records FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own protection records" ON public.ai_protection_records FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ai_threat_detections
DROP POLICY IF EXISTS "Users can update own threat detections" ON public.ai_threat_detections;
DROP POLICY IF EXISTS "Users can view own threat detections" ON public.ai_threat_detections;
CREATE POLICY "Users can view own threat detections" ON public.ai_threat_detections FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own threat detections" ON public.ai_threat_detections FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_training_datasets
DROP POLICY IF EXISTS "Admins can manage training datasets" ON public.ai_training_datasets;
DROP POLICY IF EXISTS "Auth users can view training datasets" ON public.ai_training_datasets;
CREATE POLICY "Auth users can view training datasets" ON public.ai_training_datasets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage training datasets" ON public.ai_training_datasets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_training_enforcement_workflows
DROP POLICY IF EXISTS "Users can update own enforcement workflows" ON public.ai_training_enforcement_workflows;
DROP POLICY IF EXISTS "Users can view own enforcement workflows" ON public.ai_training_enforcement_workflows;
CREATE POLICY "Users can view own enforcement workflows" ON public.ai_training_enforcement_workflows FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own enforcement workflows" ON public.ai_training_enforcement_workflows FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_training_violations
DROP POLICY IF EXISTS "Users can update own training violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can view own training violations" ON public.ai_training_violations;
CREATE POLICY "Users can view own training violations" ON public.ai_training_violations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own training violations" ON public.ai_training_violations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- alert_channels
DROP POLICY IF EXISTS "Users can delete own alert channels" ON public.alert_channels;
DROP POLICY IF EXISTS "Users can update own alert channels" ON public.alert_channels;
DROP POLICY IF EXISTS "Users can view own alert channels" ON public.alert_channels;
CREATE POLICY "Users can view own alert channels" ON public.alert_channels FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own alert channels" ON public.alert_channels FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own alert channels" ON public.alert_channels FOR DELETE TO authenticated USING (user_id = auth.uid());

-- alert_notifications_log
DROP POLICY IF EXISTS "Users can view own alert notifications" ON public.alert_notifications_log;
CREATE POLICY "Users can view own alert notifications" ON public.alert_notifications_log FOR SELECT TO authenticated USING (user_id = auth.uid());

-- artwork
DROP POLICY IF EXISTS "Users can create own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can delete own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can update own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can view own artwork" ON public.artwork;
CREATE POLICY "Users can view own artwork" ON public.artwork FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own artwork" ON public.artwork FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own artwork" ON public.artwork FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own artwork" ON public.artwork FOR DELETE TO authenticated USING (user_id = auth.uid());

-- backup_logs
DROP POLICY IF EXISTS "Admins can manage backup logs" ON public.backup_logs;
DROP POLICY IF EXISTS "Auth users can view backup logs" ON public.backup_logs;
CREATE POLICY "Admins can manage backup logs" ON public.backup_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- batch_processing_queue
DROP POLICY IF EXISTS "Users can update own batch jobs" ON public.batch_processing_queue;
DROP POLICY IF EXISTS "Users can view own batch jobs" ON public.batch_processing_queue;
CREATE POLICY "Users can view own batch jobs" ON public.batch_processing_queue FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own batch jobs" ON public.batch_processing_queue FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- blockchain_certificates
DROP POLICY IF EXISTS "Users can create own certificates" ON public.blockchain_certificates;
DROP POLICY IF EXISTS "Users can view own certificates" ON public.blockchain_certificates;
CREATE POLICY "Users can view own certificates" ON public.blockchain_certificates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own certificates" ON public.blockchain_certificates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- blockchain_licenses
DROP POLICY IF EXISTS "Users can create own licenses" ON public.blockchain_licenses;
DROP POLICY IF EXISTS "Users can update own licenses" ON public.blockchain_licenses;
DROP POLICY IF EXISTS "Users can view own licenses" ON public.blockchain_licenses;
CREATE POLICY "Users can view own licenses" ON public.blockchain_licenses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own licenses" ON public.blockchain_licenses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own licenses" ON public.blockchain_licenses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- blockchain_ownership_registry
DROP POLICY IF EXISTS "Users can create own ownership records" ON public.blockchain_ownership_registry;
DROP POLICY IF EXISTS "Users can view own ownership records" ON public.blockchain_ownership_registry;
CREATE POLICY "Users can view own ownership records" ON public.blockchain_ownership_registry FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own ownership records" ON public.blockchain_ownership_registry FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- blockchain_verifications
DROP POLICY IF EXISTS "Auth users can create verifications" ON public.blockchain_verifications;
DROP POLICY IF EXISTS "Auth users can view verifications" ON public.blockchain_verifications;
CREATE POLICY "Auth users can view verifications" ON public.blockchain_verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can create verifications" ON public.blockchain_verifications FOR INSERT TO authenticated WITH CHECK (true);