-- Harden remaining authenticated policies

-- leads: no user_id, restrict to authenticated only
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
CREATE POLICY "Auth users can insert leads" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- license_events: has user_id, scope to auth.uid()
DROP POLICY IF EXISTS "license_events_system_insert" ON license_events;
CREATE POLICY "Auth users can insert own license events" ON license_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- blockchain_verifications: no user_id, restrict to authenticated only
DROP POLICY IF EXISTS "Auth users can create verifications" ON blockchain_verifications;
CREATE POLICY "Auth users can create verifications" ON blockchain_verifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_artwork_user_id ON artwork(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_protection_audit_log_user ON ai_protection_audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_copyright_matches_artwork ON copyright_matches(artwork_id);
CREATE INDEX IF NOT EXISTS idx_ai_protection_records_user ON ai_protection_records(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_scans_artwork ON monitoring_scans(artwork_id);
