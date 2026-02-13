

# Security Hardening: Fix Critical Vulnerabilities and Anonymous Access Policies

## Scope

Fix **3 critical data exposure issues** and **93 anonymous-access-vulnerable policies** across the database, organized into 4 phases.

---

## Phase 1: Fix 3 Critical Data Exposures

### 1A. `ip_lawyers` -- 16 attorney records publicly readable

**Current policy**: `"Everyone can view IP lawyers directory"` with `USING (true)` on `public` role

**Fix**: Restrict to authenticated users only.

```sql
DROP POLICY "Everyone can view IP lawyers directory" ON ip_lawyers;
CREATE POLICY "Authenticated users can view IP lawyers"
  ON ip_lawyers FOR SELECT TO authenticated
  USING (true);
```

### 1B. `leads` -- Anonymous insert allows spam/abuse

**Current policies**:
- `"Enable insert for anonymous lead capture"` allows `anon` + `authenticated` with `WITH CHECK (true)`
- `"Authenticated users can insert leads"` is redundant

**Fix**: Remove anonymous insert. Keep authenticated-only insert. Require `user_id = auth.uid()`.

```sql
DROP POLICY "Enable insert for anonymous lead capture" ON leads;
DROP POLICY "Authenticated users can insert leads" ON leads;
CREATE POLICY "Authenticated users can insert their own leads"
  ON leads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
```

### 1C. `promo_codes` -- Active codes (BETA200, STUDENTUSER) publicly visible

**Current policy**: `"Anyone can view active promo codes"` with `USING (is_active = true)` on `public` role

**Fix**: Only authenticated users can view promo codes, and only validate them server-side (the `validate_promo_code` RPC already exists for this).

```sql
DROP POLICY "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Authenticated users can view active promo codes"
  ON promo_codes FOR SELECT TO authenticated
  USING (is_active = true);
```

---

## Phase 2: Fix 93 Anonymous-Vulnerable SELECT Policies

These policies use `auth.uid() = user_id` but are granted to `public` (which includes `anon`). When `auth.uid()` is NULL (anonymous user), the comparison doesn't fail -- it returns NULL/false, which is safe in most cases, but the Supabase linter flags it because the policy **should explicitly require authentication**.

**Pattern to apply across all 93 policies**:

```sql
-- Before (grants to public, no NULL check)
USING (auth.uid() = user_id)

-- After (grants to authenticated only)
-- Option A: Change role target
TO authenticated USING (auth.uid() = user_id)

-- Option B: Add explicit NULL check
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
```

We will use **Option A** (change to `TO authenticated`) as it is cleaner and prevents any anonymous evaluation.

This will be applied in batches of ~20 tables per migration:

- **Batch 1**: `c2pa_signing_logs`, `c2pa_validation_logs`, `compliance_reminders`, `copyright_scan_results`, `daily_api_usage`, `dmca_notices`, `document_ai_analysis`, `document_monitoring_sessions`, `document_plagiarism_matches`, `document_scan_updates`, `document_takedown_notices`, `document_version_comparisons`, `email_automation_executions`, `email_detailed_events`, `enterprise_ai_analyses`, `enterprise_api_usage`, `gdpr_consent_logs`, `gov_defense_ip_monitoring`, `gov_defense_monitoring_sessions`, `gov_defense_security_alerts`

- **Batch 2**: `government_agencies`, `government_api_keys`, `government_api_usage`, `government_filing_requests`, `government_security_events`, `legal_cases`, `legal_professionals`, `monitoring_results`, `portfolios`, `portfolio_monitoring_results`, `social_media_monitoring_results`, `subscriptions`, `support_conversations`, `support_messages`, `template_purchases`, and remaining tables

- **Batch 3**: Any remaining tables from the 93 total

---

## Phase 3: Fix Overly Permissive Write Policies

Tables with `WITH CHECK (true)` on INSERT that should restrict to `user_id = auth.uid()`:

Key targets include:
- `advanced_alerts`
- `ai_detection_results`
- `blockchain_verifications`
- `document_protection_jobs`
- `ai_training_violations`

For "system-only" tables (logs, metrics, notifications), the `WITH CHECK (true)` is acceptable because these are written by SECURITY DEFINER functions, not directly by users. We will verify each case.

---

## Phase 4: Fix Remaining `USING (true)` SELECT Policies

Tables with `USING (true)` SELECT on `public` role that are **not** legitimately public content:

- `admin_online_status` -- should be admin-only
- `admin_sessions` -- should be admin-only
- `ai_company_policies` -- could be public (reference data)
- `platform_api_configs` -- should be admin-only
- `guest_uploads` -- should be session-scoped

Legitimately public (keep as-is):
- `community_posts`, `community_comments`, `community_votes` -- public forum
- `expert_profiles`, `expert_advice` -- public directory

---

## Implementation Sequence

1. Phase 1 first (3 migrations, immediate risk reduction)
2. Phase 2 in 3 batches (largest volume)
3. Phase 3 (review and fix write policies)
4. Phase 4 (fix remaining USING(true) policies)

Total estimated: ~8 SQL migrations executed sequentially.

---

## What Will NOT Change

- Public community content policies (posts, comments, votes)
- SECURITY DEFINER function insert policies (system-level writes)
- Admin-gated policies already using `has_role()`
- The `user_roles` table structure (already correct)

