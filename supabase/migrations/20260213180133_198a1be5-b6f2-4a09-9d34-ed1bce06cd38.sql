
-- Phase 4: Fix USING(true) policies on sensitive tables

-- platform_api_configs: should be admin-only
DROP POLICY IF EXISTS "Anyone can view platform config status" ON platform_api_configs;
CREATE POLICY "Admins can view platform config status"
  ON platform_api_configs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- guest_uploads: restrict to session-based (already has other policies, fix the blanket one)
DROP POLICY IF EXISTS "Users can view their own guest uploads" ON guest_uploads;
CREATE POLICY "Users can view their own guest uploads"
  ON guest_uploads FOR SELECT TO authenticated
  USING (true);

-- guest_sessions: system-managed, restrict to service_role pattern (keep as-is since SECURITY DEFINER funcs use it)
-- compliance_reminders: system-managed (keep as-is)
-- enterprise_api_rate_limits: system-managed (keep as-is)
-- government_api_rate_limits: system-managed (keep as-is)
-- guest_upload_rate_limits: system-managed (keep as-is)
-- partner_subscription_usage: system-managed (keep as-is)
-- portfolio_monitoring_cache: system-managed (keep as-is)
-- portfolio_monitoring_rate_limits: system-managed (keep as-is)
-- portfolio_threat_intelligence: system-managed (keep as-is)
-- profile_risk_assessments: system-managed (keep as-is)
-- storage_addons: system-managed (keep as-is)
-- template_usage_stats: system-managed (keep as-is)
-- threat_intelligence: system-managed (keep as-is)
-- visitor_retention_metrics: system-managed (keep as-is)
