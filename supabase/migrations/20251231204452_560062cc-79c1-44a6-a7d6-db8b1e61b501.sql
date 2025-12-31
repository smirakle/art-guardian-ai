
-- Batch: Fix more tables with anonymous access issues

-- ai_protection_metrics - admin only
DROP POLICY IF EXISTS "System and admins can manage AI protection metrics" ON public.ai_protection_metrics;

CREATE POLICY "Admins can manage ai protection metrics" 
  ON public.ai_protection_metrics FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_protection_notifications
DROP POLICY IF EXISTS "Users can update their own AI protection notifications" ON public.ai_protection_notifications;
DROP POLICY IF EXISTS "Users can view their own AI protection notifications" ON public.ai_protection_notifications;

CREATE POLICY "Users can view own ai protection notifications" 
  ON public.ai_protection_notifications FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ai protection notifications" 
  ON public.ai_protection_notifications FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_protection_rate_limits
DROP POLICY IF EXISTS "Authenticated users manage their rate limits" ON public.ai_protection_rate_limits;

CREATE POLICY "Users can manage own rate limits" 
  ON public.ai_protection_rate_limits FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_protection_records
DROP POLICY IF EXISTS "Admins can view all protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can update their own protection records" ON public.ai_protection_records;
DROP POLICY IF EXISTS "Users can view their own protection records" ON public.ai_protection_records;

CREATE POLICY "Users can view own protection records" 
  ON public.ai_protection_records FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own protection records" 
  ON public.ai_protection_records FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all protection records v2" 
  ON public.ai_protection_records FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_threat_detections
DROP POLICY IF EXISTS "Authenticated users can view their own threat detections" ON public.ai_threat_detections;

CREATE POLICY "Users can manage own threat detections" 
  ON public.ai_threat_detections FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_training_datasets
DROP POLICY IF EXISTS "Admins can manage AI training datasets" ON public.ai_training_datasets;
DROP POLICY IF EXISTS "Authenticated users can view AI training datasets" ON public.ai_training_datasets;

CREATE POLICY "Auth users can view ai training datasets" 
  ON public.ai_training_datasets FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ai training datasets" 
  ON public.ai_training_datasets FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_training_enforcement_workflows
DROP POLICY IF EXISTS "Users can manage their own enforcement workflows" ON public.ai_training_enforcement_workflows;

CREATE POLICY "Users can manage own enforcement workflows" 
  ON public.ai_training_enforcement_workflows FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_training_violations
DROP POLICY IF EXISTS "Admins can manage all violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can update their own violations" ON public.ai_training_violations;
DROP POLICY IF EXISTS "Users can view their own violations" ON public.ai_training_violations;

CREATE POLICY "Users can view own violations" 
  ON public.ai_training_violations FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own violations" 
  ON public.ai_training_violations FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ai training violations" 
  ON public.ai_training_violations FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- alert_channels
DROP POLICY IF EXISTS "Authenticated users can manage their own alert channels" ON public.alert_channels;

CREATE POLICY "Users can manage own alert channels" 
  ON public.alert_channels FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- alert_notifications_log
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.alert_notifications_log;

CREATE POLICY "Users can view own notification logs" 
  ON public.alert_notifications_log FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- artwork
DROP POLICY IF EXISTS "Admins can view all artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can manage their own artwork" ON public.artwork;

CREATE POLICY "Users can manage own artwork" 
  ON public.artwork FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all artwork v2" 
  ON public.artwork FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- backup_logs
DROP POLICY IF EXISTS "Admins can manage backup logs" ON public.backup_logs;

CREATE POLICY "Admins can manage backup logs v2" 
  ON public.backup_logs FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- batch_processing_queue
DROP POLICY IF EXISTS "Authenticated users can manage their own batch processes" ON public.batch_processing_queue;

CREATE POLICY "Users can manage own batch processes" 
  ON public.batch_processing_queue FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- blockchain_certificates
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.blockchain_certificates;

CREATE POLICY "Users can view own blockchain certificates" 
  ON public.blockchain_certificates FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- blockchain_licenses
DROP POLICY IF EXISTS "Authenticated users can manage their own blockchain licenses" ON public.blockchain_licenses;

CREATE POLICY "Users can manage own blockchain licenses" 
  ON public.blockchain_licenses FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- blockchain_ownership_registry
DROP POLICY IF EXISTS "Authenticated users can manage their own ownership registration" ON public.blockchain_ownership_registry;
DROP POLICY IF EXISTS "Authenticated users can verify ownership" ON public.blockchain_ownership_registry;

CREATE POLICY "Users can manage own ownership registration" 
  ON public.blockchain_ownership_registry FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can verify ownership" 
  ON public.blockchain_ownership_registry FOR SELECT 
  TO authenticated
  USING (true);

-- blockchain_verifications
DROP POLICY IF EXISTS "Authenticated users can view blockchain verifications" ON public.blockchain_verifications;

CREATE POLICY "Auth users can view blockchain verifications" 
  ON public.blockchain_verifications FOR SELECT 
  TO authenticated
  USING (true);
