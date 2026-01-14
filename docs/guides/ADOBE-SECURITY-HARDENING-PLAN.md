# Security Hardening Plan for Adobe Certification

**Status**: 284 RLS policy warnings identified  
**Target**: Zero critical/high issues for Adobe Exchange certification  
**Last Updated**: 2026-01-14

---

## Executive Summary

TSMO has 206 database tables with 284 RLS policy warnings. The primary issue is **permissive RLS policies** using `USING (true)` or `WITH CHECK (true)` for INSERT, UPDATE, and DELETE operations. This plan addresses all issues in a phased approach optimized for Adobe certification.

### Warning Breakdown
| Issue Type | Count | Priority |
|------------|-------|----------|
| RLS Policy Always True (INSERT/UPDATE/DELETE) | ~280 | HIGH |
| Extensions in Public Schema | 2 | MEDIUM |
| Postgres Version Security Patches | 1 | LOW |

---

## Phase 1: Critical User Data Tables (Week 1)

### Tier 1A: Core User Tables (Day 1-2)
These tables contain user PII and require immediate hardening:

```sql
-- 1. profiles - User PII
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2. artwork - Protected creative works
DROP POLICY IF EXISTS "artwork_all" ON artwork;
DROP POLICY IF EXISTS "Users can manage their own artwork" ON artwork;

CREATE POLICY "artwork_select_own" ON artwork FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "artwork_insert_own" ON artwork FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "artwork_update_own" ON artwork FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "artwork_delete_own" ON artwork FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. ai_protection_records - Protection data
DROP POLICY IF EXISTS "ai_protection_records_all" ON ai_protection_records;

CREATE POLICY "ai_protection_records_select_own" ON ai_protection_records FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_records_insert_own" ON ai_protection_records FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_records_update_own" ON ai_protection_records FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_records_delete_own" ON ai_protection_records FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 4. subscriptions - Payment data
DROP POLICY IF EXISTS "subscriptions_all" ON subscriptions;

CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_service" ON subscriptions FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "subscriptions_update_service" ON subscriptions FOR UPDATE
USING (auth.role() = 'service_role');
```

### Tier 1B: AI Detection & Monitoring Tables (Day 3)

```sql
-- ai_detection_results
DROP POLICY IF EXISTS "ai_detection_results_all" ON ai_detection_results;

CREATE POLICY "ai_detection_results_select_own" ON ai_detection_results FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_detection_results_insert_own" ON ai_detection_results FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_detection_results_update_own" ON ai_detection_results FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ai_training_violations
DROP POLICY IF EXISTS "ai_training_violations_all" ON ai_training_violations;

CREATE POLICY "ai_training_violations_select_own" ON ai_training_violations FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_training_violations_insert_own" ON ai_training_violations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_training_violations_update_own" ON ai_training_violations FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ai_monitoring_agents
DROP POLICY IF EXISTS "ai_monitoring_agents_all" ON ai_monitoring_agents;

CREATE POLICY "ai_monitoring_agents_select_own" ON ai_monitoring_agents FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_monitoring_agents_insert_own" ON ai_monitoring_agents FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_monitoring_agents_update_own" ON ai_monitoring_agents FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ai_threat_detections
DROP POLICY IF EXISTS "ai_threat_detections_all" ON ai_threat_detections;

CREATE POLICY "ai_threat_detections_select_own" ON ai_threat_detections FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_threat_detections_insert_own" ON ai_threat_detections FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- copyright_matches
DROP POLICY IF EXISTS "copyright_matches_all" ON copyright_matches;

CREATE POLICY "copyright_matches_select_via_artwork" ON copyright_matches FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM artwork WHERE artwork.id = copyright_matches.artwork_id AND artwork.user_id = auth.uid()
));

CREATE POLICY "copyright_matches_insert_via_artwork" ON copyright_matches FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM artwork WHERE artwork.id = copyright_matches.artwork_id AND artwork.user_id = auth.uid()
));

-- monitoring_scans
DROP POLICY IF EXISTS "monitoring_scans_all" ON monitoring_scans;

CREATE POLICY "monitoring_scans_select_own" ON monitoring_scans FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "monitoring_scans_insert_own" ON monitoring_scans FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "monitoring_scans_update_own" ON monitoring_scans FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
```

### Tier 1C: Notifications & Alerts (Day 4)

```sql
-- ai_protection_notifications
DROP POLICY IF EXISTS "ai_protection_notifications_all" ON ai_protection_notifications;

CREATE POLICY "ai_protection_notifications_select_own" ON ai_protection_notifications FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_notifications_insert_service" ON ai_protection_notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "ai_protection_notifications_update_own" ON ai_protection_notifications FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- advanced_alerts
DROP POLICY IF EXISTS "advanced_alerts_all" ON advanced_alerts;

CREATE POLICY "advanced_alerts_select_own" ON advanced_alerts FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "advanced_alerts_insert_service" ON advanced_alerts FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "advanced_alerts_update_own" ON advanced_alerts FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- monitoring_alerts
DROP POLICY IF EXISTS "monitoring_alerts_all" ON monitoring_alerts;

CREATE POLICY "monitoring_alerts_select_own" ON monitoring_alerts FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "monitoring_alerts_insert_service" ON monitoring_alerts FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "monitoring_alerts_update_own" ON monitoring_alerts FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- alert_channels
DROP POLICY IF EXISTS "alert_channels_all" ON alert_channels;

CREATE POLICY "alert_channels_select_own" ON alert_channels FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alert_channels_insert_own" ON alert_channels FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alert_channels_update_own" ON alert_channels FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
```

---

## Phase 2: Admin & System Tables (Week 2)

### Tier 2A: Admin-Only Tables (Day 1-2)

```sql
-- Ensure has_role function exists
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- admin_sessions
DROP POLICY IF EXISTS "admin_sessions_all" ON admin_sessions;

CREATE POLICY "admin_sessions_admin_only" ON admin_sessions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- admin_online_status
DROP POLICY IF EXISTS "admin_online_status_all" ON admin_online_status;

CREATE POLICY "admin_online_status_admin_only" ON admin_online_status FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- production_metrics
DROP POLICY IF EXISTS "production_metrics_all" ON production_metrics;

CREATE POLICY "production_metrics_admin_select" ON production_metrics FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "production_metrics_service_insert" ON production_metrics FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- operating_costs
DROP POLICY IF EXISTS "operating_costs_all" ON operating_costs;

CREATE POLICY "operating_costs_admin_only" ON operating_costs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- error_logs
DROP POLICY IF EXISTS "error_logs_all" ON error_logs;

CREATE POLICY "error_logs_admin_select" ON error_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "error_logs_service_insert" ON error_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- security_audit_log
DROP POLICY IF EXISTS "security_audit_log_all" ON security_audit_log;

CREATE POLICY "security_audit_log_admin_select" ON security_audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "security_audit_log_service_insert" ON security_audit_log FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### Tier 2B: System Tables (Service Role Only) (Day 3-4)

```sql
-- ai_protection_rate_limits
DROP POLICY IF EXISTS "ai_protection_rate_limits_all" ON ai_protection_rate_limits;

CREATE POLICY "ai_protection_rate_limits_select_own" ON ai_protection_rate_limits FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_rate_limits_service" ON ai_protection_rate_limits FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "ai_protection_rate_limits_update_service" ON ai_protection_rate_limits FOR UPDATE
USING (auth.role() = 'service_role');

-- ai_protection_metrics
DROP POLICY IF EXISTS "ai_protection_metrics_all" ON ai_protection_metrics;

CREATE POLICY "ai_protection_metrics_admin_select" ON ai_protection_metrics FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ai_protection_metrics_service_insert" ON ai_protection_metrics FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- cache_statistics
DROP POLICY IF EXISTS "cache_statistics_all" ON cache_statistics;

CREATE POLICY "cache_statistics_admin_only" ON cache_statistics FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- backup_logs
DROP POLICY IF EXISTS "backup_logs_all" ON backup_logs;

CREATE POLICY "backup_logs_admin_select" ON backup_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "backup_logs_service_insert" ON backup_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- daily_api_usage
DROP POLICY IF EXISTS "daily_api_usage_all" ON daily_api_usage;

CREATE POLICY "daily_api_usage_select_own" ON daily_api_usage FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "daily_api_usage_service" ON daily_api_usage FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "daily_api_usage_update_service" ON daily_api_usage FOR UPDATE
USING (auth.role() = 'service_role');
```

---

## Phase 3: DMCA & Legal Tables (Week 2, Day 5)

```sql
-- dmca_notices
DROP POLICY IF EXISTS "dmca_notices_all" ON dmca_notices;

CREATE POLICY "dmca_notices_select_own" ON dmca_notices FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "dmca_notices_insert_own" ON dmca_notices FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "dmca_notices_update_own" ON dmca_notices FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- legal_cases
DROP POLICY IF EXISTS "legal_cases_all" ON legal_cases;

CREATE POLICY "legal_cases_select_own" ON legal_cases FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "legal_cases_insert_own" ON legal_cases FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "legal_cases_update_own" ON legal_cases FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ai_protection_dmca_notices
DROP POLICY IF EXISTS "ai_protection_dmca_notices_all" ON ai_protection_dmca_notices;

CREATE POLICY "ai_protection_dmca_notices_select_own" ON ai_protection_dmca_notices FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_dmca_notices_insert_own" ON ai_protection_dmca_notices FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_dmca_notices_update_own" ON ai_protection_dmca_notices FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- enforcement_cases
DROP POLICY IF EXISTS "enforcement_cases_all" ON enforcement_cases;

CREATE POLICY "enforcement_cases_select_own" ON enforcement_cases FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "enforcement_cases_insert_own" ON enforcement_cases FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "enforcement_cases_update_own" ON enforcement_cases FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
```

---

## Phase 4: Public Tables (Week 3)

### Tables That SHOULD Allow Public READ

```sql
-- blog_posts (public content)
-- Keep SELECT with USING (true) - intentional public access
DROP POLICY IF EXISTS "blog_posts_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete" ON blog_posts;

CREATE POLICY "blog_posts_admin_insert" ON blog_posts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "blog_posts_admin_update" ON blog_posts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "blog_posts_admin_delete" ON blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- legal_templates (public resources)
-- Keep SELECT with USING (true) - intentional public access
DROP POLICY IF EXISTS "legal_templates_insert" ON legal_templates;
DROP POLICY IF EXISTS "legal_templates_update" ON legal_templates;

CREATE POLICY "legal_templates_admin_insert" ON legal_templates FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "legal_templates_admin_update" ON legal_templates FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- pricing_tiers (public pricing)
-- Keep SELECT with USING (true) - intentional public access
DROP POLICY IF EXISTS "pricing_tiers_insert" ON pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_update" ON pricing_tiers;

CREATE POLICY "pricing_tiers_admin_insert" ON pricing_tiers FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pricing_tiers_admin_update" ON pricing_tiers FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- ai_company_policies (public reference data)
-- Keep SELECT with USING (true) - intentional public access
DROP POLICY IF EXISTS "ai_company_policies_insert" ON ai_company_policies;
DROP POLICY IF EXISTS "ai_company_policies_update" ON ai_company_policies;

CREATE POLICY "ai_company_policies_admin_insert" ON ai_company_policies FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ai_company_policies_admin_update" ON ai_company_policies FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- community_posts (public forum)
-- Keep SELECT with USING (true) - intentional public access
DROP POLICY IF EXISTS "community_posts_insert" ON community_posts;
DROP POLICY IF EXISTS "community_posts_update" ON community_posts;

CREATE POLICY "community_posts_insert_auth" ON community_posts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "community_posts_update_own" ON community_posts FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
```

---

## Phase 5: Remaining Tables (Week 3-4)

### Batch Fix Script Template

For the ~150 remaining tables with user_id columns:

```sql
-- Template for user-owned tables
DO $$
DECLARE
  table_name TEXT;
  tables_to_fix TEXT[] := ARRAY[
    'ai_agent_deployments',
    'ai_auto_responses',
    'ai_document_tracers',
    'ai_predictive_analyses',
    'ai_training_enforcement_workflows',
    'alert_notifications_log',
    'batch_processing_queue',
    'blockchain_certificates',
    'blockchain_licenses',
    'blockchain_ownership_registry',
    'compliance_reminders',
    'copyright_scan_results',
    'cross_chain_registrations',
    'custom_integrations',
    'deepfake_analysis_results',
    'deepfake_matches'
    -- Add remaining tables here
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    -- Drop all existing policies
    EXECUTE format('DROP POLICY IF EXISTS "%s_all" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_select" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update" ON %I', table_name, table_name);
    
    -- Create new secure policies
    EXECUTE format('
      CREATE POLICY "%s_select_own" ON %I FOR SELECT
      USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    ', table_name, table_name);
    
    EXECUTE format('
      CREATE POLICY "%s_insert_own" ON %I FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    ', table_name, table_name);
    
    EXECUTE format('
      CREATE POLICY "%s_update_own" ON %I FOR UPDATE
      USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    ', table_name, table_name);
  END LOOP;
END $$;
```

---

## Adobe Certification Checklist

### Security Requirements (Pre-Submission)

- [ ] **Zero critical RLS warnings** on user data tables
- [ ] **Admin tables** restricted to admin role only
- [ ] **Rate limiting** active on API endpoints
- [ ] **Audit logging** for all admin actions
- [ ] **Data encryption** for PII at rest
- [ ] **Input validation** on all Edge Functions

### Adobe-Specific Requirements

- [ ] **C2PA signing** operational (not placeholder)
- [ ] **Privacy policy** compliant with Adobe standards
- [ ] **Terms of service** for plugin users
- [ ] **GDPR compliance** for EU users
- [ ] **SOC 2 Type I** controls documented

### Testing Checklist

```typescript
// Test 1: Anonymous user cannot access protected data
const { data: anonData } = await supabase.from('artwork').select('*');
// Expected: Empty array, no user data

// Test 2: User A cannot see User B's artwork
const { data: userData } = await supabase.from('artwork').select('*');
// Expected: Only current user's artwork

// Test 3: Admin can see admin-only tables
const { data: adminData } = await supabase.from('production_metrics').select('*');
// Expected: Data visible only if user is admin

// Test 4: Service role can insert metrics
// Expected: Success only with service_role key
```

---

## Timeline Summary

| Phase | Scope | Duration | Priority |
|-------|-------|----------|----------|
| Phase 1 | Core User Tables (~40 tables) | Week 1 | CRITICAL |
| Phase 2 | Admin & System Tables (~30 tables) | Week 2 | HIGH |
| Phase 3 | DMCA & Legal Tables (~15 tables) | Week 2 | HIGH |
| Phase 4 | Public Tables (~20 tables) | Week 3 | MEDIUM |
| Phase 5 | Remaining Tables (~100 tables) | Week 3-4 | MEDIUM |

### Expected Outcome

- **Before**: 284 RLS warnings
- **After Phase 1**: ~180 warnings (core data protected)
- **After Phase 2**: ~100 warnings (admin data protected)
- **After Phase 3-4**: ~50 warnings (legal + public data protected)
- **After Phase 5**: 0-10 warnings (all tables secured)

---

## Monitoring After Hardening

### Weekly Security Review
1. Run Supabase linter: Check for new warnings
2. Review security_audit_log: Monitor admin actions
3. Check rate_limits table: Identify abuse patterns
4. Review Edge Function logs: Monitor for auth failures

### Alert Thresholds
- 5+ failed auth attempts from same IP → Block IP
- Admin role changes → Immediate notification
- New RLS warnings after deployment → Investigate

---

## Quick Start: First Migration

Copy this SQL to start fixing the most critical tables immediately:

```sql
-- CRITICAL FIRST FIX: profiles, artwork, ai_protection_records
-- Run this migration first

-- 1. Ensure has_role function exists
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Fix profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "profiles_admin_select" ON profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix artwork table
DROP POLICY IF EXISTS "Users can manage their own artwork" ON artwork;
DROP POLICY IF EXISTS "artwork_all" ON artwork;

CREATE POLICY "artwork_select_own" ON artwork FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "artwork_insert_own" ON artwork FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "artwork_update_own" ON artwork FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "artwork_delete_own" ON artwork FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admins can view all artwork
CREATE POLICY "artwork_admin_select" ON artwork FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fix ai_protection_records table
DROP POLICY IF EXISTS "ai_protection_records_all" ON ai_protection_records;
DROP POLICY IF EXISTS "Users can view their own protection records" ON ai_protection_records;

CREATE POLICY "ai_protection_records_select_own" ON ai_protection_records FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_records_insert_own" ON ai_protection_records FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_records_update_own" ON ai_protection_records FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "ai_protection_records_delete_own" ON ai_protection_records FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admins can view all protection records
CREATE POLICY "ai_protection_records_admin_select" ON ai_protection_records FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| RLS Warnings | 284 | < 10 |
| Anonymous Data Access | Possible | Blocked |
| Admin-Only Tables Secured | Partial | 100% |
| User Data Isolation | Partial | 100% |
| Adobe Certification Ready | No | Yes |
