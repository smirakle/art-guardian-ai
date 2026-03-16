
-- ==========================================
-- BETA READINESS: Drop dangerous public-role permissive policies (FIXED)
-- ==========================================

-- Drop all "System can..." public-role INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "System can create advanced alerts" ON advanced_alerts;
DROP POLICY IF EXISTS "System can create AI detection results" ON ai_detection_results;
DROP POLICY IF EXISTS "System can create predictive analyses" ON ai_predictive_analyses;
DROP POLICY IF EXISTS "System can insert audit logs" ON ai_protection_audit_log;
DROP POLICY IF EXISTS "System can create DMCA notices" ON ai_protection_dmca_notices;
DROP POLICY IF EXISTS "System can create AI protection notifications" ON ai_protection_notifications;
DROP POLICY IF EXISTS "System can create violations" ON ai_training_violations;
DROP POLICY IF EXISTS "System can create notification logs" ON alert_notifications_log;
DROP POLICY IF EXISTS "System can insert cache analytics" ON cdn_cache_analytics;
DROP POLICY IF EXISTS "System can create scan results" ON copyright_scan_results;
DROP POLICY IF EXISTS "System can create deepfake analysis results" ON deepfake_analysis_results;
DROP POLICY IF EXISTS "System can create deepfake matches" ON deepfake_matches;
DROP POLICY IF EXISTS "Service role can insert AI analysis" ON document_ai_analysis;
DROP POLICY IF EXISTS "System can create protection jobs" ON document_protection_jobs;
DROP POLICY IF EXISTS "System can create detailed events" ON email_detailed_events;
DROP POLICY IF EXISTS "System can create AI analyses" ON enterprise_ai_analyses;
DROP POLICY IF EXISTS "System can create API usage records" ON enterprise_api_usage;
DROP POLICY IF EXISTS "System can create error logs" ON error_logs;
DROP POLICY IF EXISTS "System can create gov API usage records" ON government_api_usage;
DROP POLICY IF EXISTS "System can create government security events" ON government_security_events;
DROP POLICY IF EXISTS "System can create analytics" ON legal_document_analytics;
DROP POLICY IF EXISTS "System can create notifications" ON legal_notifications;
DROP POLICY IF EXISTS "System can create NFT records" ON nft_tokens;
DROP POLICY IF EXISTS "System can create certificates" ON ownership_certificates;
DROP POLICY IF EXISTS "System can insert performance metrics" ON performance_metrics;
DROP POLICY IF EXISTS "System can create audit logs" ON portfolio_monitoring_audit_log;
DROP POLICY IF EXISTS "System can create metrics" ON portfolio_monitoring_metrics;
DROP POLICY IF EXISTS "System can create notifications" ON portfolio_monitoring_notifications;
DROP POLICY IF EXISTS "System can create portfolio monitoring results" ON portfolio_monitoring_results;
DROP POLICY IF EXISTS "System can create performance metrics" ON portfolio_performance_metrics;
DROP POLICY IF EXISTS "System can create profile scan results" ON profile_scan_results;
DROP POLICY IF EXISTS "System can create redemptions" ON promo_code_redemptions;
DROP POLICY IF EXISTS "System can insert analysis results" ON realtime_analysis_results;
DROP POLICY IF EXISTS "System can create realtime matches" ON realtime_matches;
DROP POLICY IF EXISTS "System can create matches" ON realtime_matches;
DROP POLICY IF EXISTS "System can create monitoring stats" ON realtime_monitoring_stats;
DROP POLICY IF EXISTS "System can create scan sessions" ON realtime_scan_sessions;
DROP POLICY IF EXISTS "System can create scan updates" ON realtime_scan_updates;
DROP POLICY IF EXISTS "System can create scan execution logs" ON scan_execution_log;
DROP POLICY IF EXISTS "System can update scan execution logs" ON scan_execution_log;
DROP POLICY IF EXISTS "System can create security alerts" ON security_alerts;
DROP POLICY IF EXISTS "System can create security audit logs" ON security_audit_log;
DROP POLICY IF EXISTS "System can create contract interactions" ON smart_contract_interactions;
DROP POLICY IF EXISTS "System can create monitoring results" ON social_media_monitoring_results;
DROP POLICY IF EXISTS "System can create storage transactions" ON storage_transactions;
DROP POLICY IF EXISTS "System can create template usage stats" ON template_usage_stats;
DROP POLICY IF EXISTS "System can manage retention metrics" ON visitor_retention_metrics;
DROP POLICY IF EXISTS "System can update cases" ON legal_cases;
DROP POLICY IF EXISTS "System can update all sessions" ON realtime_monitoring_sessions;
DROP POLICY IF EXISTS "Service role can update scheduled monitoring" ON scheduled_document_monitoring;
DROP POLICY IF EXISTS "System can update storage usage" ON user_storage_usage;
DROP POLICY IF EXISTS "System can manage storage usage" ON user_storage_usage;
DROP POLICY IF EXISTS "System can manage session data" ON visitor_sessions;
DROP POLICY IF EXISTS "System can update all sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous session updates" ON visitor_sessions;

-- Fix legal_document_signatures: require auth
DROP POLICY IF EXISTS "Anyone can create signatures" ON legal_document_signatures;
CREATE POLICY "Auth users can create signatures" ON legal_document_signatures
  FOR INSERT TO authenticated WITH CHECK (true);

-- Fix user_roles: scope to authenticated
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Auth users view own roles" ON user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Prevent unauthorized role updates" ON user_roles;
CREATE POLICY "Admins manage all roles" ON user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix web_scans: scope to authenticated
DROP POLICY IF EXISTS "Users can view their own web scans" ON web_scans;
CREATE POLICY "Auth users view own web scans" ON web_scans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own web scans" ON web_scans;
CREATE POLICY "Auth users update own web scans" ON web_scans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix web_scan_results: scope via scan join (no user_id column)
DROP POLICY IF EXISTS "Users can view their own web scan results" ON web_scan_results;
CREATE POLICY "Auth users view own scan results" ON web_scan_results
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM web_scans ws WHERE ws.id = web_scan_results.scan_id AND ws.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own web scan results" ON web_scan_results;
CREATE POLICY "Auth users update own scan results" ON web_scan_results
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM web_scans ws WHERE ws.id = web_scan_results.scan_id AND ws.user_id = auth.uid()
  ));

-- Fix wallet_connections
DROP POLICY IF EXISTS "Users can manage their own wallet connections" ON wallet_connections;
CREATE POLICY "Auth users manage own wallets" ON wallet_connections
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Fix user_legal_profiles
DROP POLICY IF EXISTS "Users can manage their own legal profile" ON user_legal_profiles;
CREATE POLICY "Auth users manage own legal profile" ON user_legal_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Fix white_label tables
DROP POLICY IF EXISTS "Admins can manage all domains" ON white_label_domains;
CREATE POLICY "Admins manage all domains" ON white_label_domains
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Organization owners can manage their domains" ON white_label_domains;
CREATE POLICY "Org owners manage domains" ON white_label_domains
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM white_label_organizations wlo
    WHERE wlo.id = white_label_domains.organization_id AND wlo.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can manage all organizations" ON white_label_organizations;
CREATE POLICY "Admins manage all orgs" ON white_label_organizations
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Organization owners can manage their organization" ON white_label_organizations;
CREATE POLICY "Org owners manage own org" ON white_label_organizations
  FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Fix white_label_users
DROP POLICY IF EXISTS "Organization admins can manage users" ON white_label_users;
DROP POLICY IF EXISTS "Organization members can view organization users" ON white_label_users;
DROP POLICY IF EXISTS "Organization members can view white label users" ON white_label_users;
DROP POLICY IF EXISTS "Organization owners can manage white label users" ON white_label_users;
DROP POLICY IF EXISTS "System admins can manage all white label users" ON white_label_users;
DROP POLICY IF EXISTS "Users can view white label users in their organizations" ON white_label_users;

CREATE POLICY "Auth users view org users" ON white_label_users
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM white_label_organizations wlo
    WHERE wlo.id = white_label_users.organization_id
    AND (wlo.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM white_label_users wlu2
      WHERE wlu2.organization_id = wlo.id AND wlu2.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Admins manage all wl users" ON white_label_users
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix visitor tables
DROP POLICY IF EXISTS "Admins can view all sessions" ON visitor_sessions;
CREATE POLICY "Admins view all sessions" ON visitor_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view retention metrics" ON visitor_retention_metrics;
CREATE POLICY "Admins view retention metrics" ON visitor_retention_metrics
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_storage_usage
DROP POLICY IF EXISTS "Admins can view all storage usage" ON user_storage_usage;
CREATE POLICY "Admins view all storage" ON user_storage_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own storage usage" ON user_storage_usage;
CREATE POLICY "Auth users view own storage" ON user_storage_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blockchain_certs_artwork ON blockchain_certificates(artwork_id);
CREATE INDEX IF NOT EXISTS idx_ai_threat_detections_user ON ai_threat_detections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dmca_notices_artwork ON dmca_notices(artwork_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category, created_at DESC);
