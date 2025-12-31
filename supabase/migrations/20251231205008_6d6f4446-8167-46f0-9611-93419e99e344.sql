-- Batch 4: Clean up duplicate policies and fix more tables

-- Clean up duplicates from ai_protection_dmca_notices
DROP POLICY IF EXISTS "Users can update their own DMCA notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Users can view their own DMCA notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Users can update own ai dmca notices" ON public.ai_protection_dmca_notices;
DROP POLICY IF EXISTS "Users can view own ai dmca notices" ON public.ai_protection_dmca_notices;

-- Clean up duplicates from ai_protection_metrics  
DROP POLICY IF EXISTS "Admins can manage ai protection metrics" ON public.ai_protection_metrics;
DROP POLICY IF EXISTS "Auth users can view metrics" ON public.ai_protection_metrics;

-- Clean up duplicates from ai_protection_notifications
DROP POLICY IF EXISTS "Users can update own ai protection notifications" ON public.ai_protection_notifications;
DROP POLICY IF EXISTS "Users can view own ai protection notifications" ON public.ai_protection_notifications;

-- Clean up duplicates from ai_protection_rate_limits
DROP POLICY IF EXISTS "Users can manage own rate limits" ON public.ai_protection_rate_limits;

-- Clean up duplicates from ai_protection_records
DROP POLICY IF EXISTS "Admins can view all protection records v2" ON public.ai_protection_records;

-- Clean up duplicates from ai_threat_detections
DROP POLICY IF EXISTS "Users can manage own threat detections" ON public.ai_threat_detections;

-- Clean up duplicates from ai_training_datasets
DROP POLICY IF EXISTS "Admins can manage ai training datasets" ON public.ai_training_datasets;
DROP POLICY IF EXISTS "Auth users can view ai training datasets" ON public.ai_training_datasets;

-- Clean up duplicates from ai_training_enforcement_workflows
DROP POLICY IF EXISTS "Users can manage own enforcement workflows" ON public.ai_training_enforcement_workflows;

-- Clean up duplicates from ai_training_violations
DROP POLICY IF EXISTS "Admins can manage all ai training violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can update own violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can view own violations" ON public.ai_training_violations;

-- Clean up duplicates from alert_channels
DROP POLICY IF EXISTS "Users can manage own alert channels" ON public.alert_channels;

-- Clean up duplicates from alert_notifications_log
DROP POLICY IF EXISTS "Users can view own notification logs" ON public.alert_notifications_log;

-- Clean up duplicates from artwork
DROP POLICY IF EXISTS "Admins can view all artwork v2" ON public.artwork;
DROP POLICY IF EXISTS "Users can manage own artwork" ON public.artwork;

-- Clean up duplicates from backup_logs
DROP POLICY IF EXISTS "Admins can manage backup logs v2" ON public.backup_logs;

-- Clean up duplicates from batch_processing_queue
DROP POLICY IF EXISTS "Users can manage own batch processes" ON public.batch_processing_queue;

-- Clean up duplicates from blockchain_certificates
DROP POLICY IF EXISTS "Users can view own blockchain certificates" ON public.blockchain_certificates;

-- Clean up duplicates from blockchain_licenses
DROP POLICY IF EXISTS "Users can manage own blockchain licenses" ON public.blockchain_licenses;

-- Clean up duplicates from blockchain_ownership_registry
DROP POLICY IF EXISTS "Auth users can verify ownership" ON public.blockchain_ownership_registry;
DROP POLICY IF EXISTS "Users can manage own ownership registration" ON public.blockchain_ownership_registry;

-- Clean up duplicates from blockchain_verifications
DROP POLICY IF EXISTS "Auth users can view blockchain verifications" ON public.blockchain_verifications;

-- Now recreate clean policies with TO authenticated

-- ai_protection_dmca_notices
CREATE POLICY "Users can view own dmca notices v3" ON public.ai_protection_dmca_notices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own dmca notices v3" ON public.ai_protection_dmca_notices FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_protection_metrics
CREATE POLICY "Auth users can view metrics v3" ON public.ai_protection_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage metrics v3" ON public.ai_protection_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_protection_notifications
CREATE POLICY "Users can view notifications v3" ON public.ai_protection_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update notifications v3" ON public.ai_protection_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_protection_rate_limits
CREATE POLICY "Users can manage rate limits v3" ON public.ai_protection_rate_limits FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_protection_records
CREATE POLICY "Admins can view all records v3" ON public.ai_protection_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_threat_detections
CREATE POLICY "Users can manage threats v3" ON public.ai_threat_detections FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_training_datasets
CREATE POLICY "Auth users can view datasets v3" ON public.ai_training_datasets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage datasets v3" ON public.ai_training_datasets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_training_enforcement_workflows
CREATE POLICY "Users can manage workflows v3" ON public.ai_training_enforcement_workflows FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ai_training_violations
CREATE POLICY "Users can view violations v3" ON public.ai_training_violations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update violations v3" ON public.ai_training_violations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage violations v3" ON public.ai_training_violations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- alert_channels
CREATE POLICY "Users can manage channels v3" ON public.alert_channels FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- alert_notifications_log
CREATE POLICY "Users can view notifications log v3" ON public.alert_notifications_log FOR SELECT TO authenticated USING (user_id = auth.uid());

-- artwork
CREATE POLICY "Admins can view artwork v3" ON public.artwork FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can manage artwork v3" ON public.artwork FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- backup_logs
CREATE POLICY "Admins can manage backups v3" ON public.backup_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- batch_processing_queue
CREATE POLICY "Users can manage batch v3" ON public.batch_processing_queue FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- blockchain_certificates
CREATE POLICY "Users can view certs v3" ON public.blockchain_certificates FOR SELECT TO authenticated USING (user_id = auth.uid());

-- blockchain_licenses
CREATE POLICY "Users can manage licenses v3" ON public.blockchain_licenses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- blockchain_ownership_registry
CREATE POLICY "Auth users verify ownership v3" ON public.blockchain_ownership_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage ownership v3" ON public.blockchain_ownership_registry FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- blockchain_verifications
CREATE POLICY "Auth users view verifications v3" ON public.blockchain_verifications FOR SELECT TO authenticated USING (true);