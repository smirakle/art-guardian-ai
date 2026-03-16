

# Beta Readiness Fix Plan

## Current State
- **287 RLS warnings**: Many tables have `WITH CHECK (true)` or `USING (true)` on INSERT/UPDATE/DELETE, allowing any user (including anonymous via `public` role) to write data.
- **Secrets**: `STRIPE_SECRET_KEY` exists but **`STRIPE_WEBHOOK_SECRET`** is missing — subscriptions won't update after payment.
- **No database indexes** on high-traffic columns.

## Plan (3 Phases)

### Phase 1: Critical RLS Hardening
Run a single SQL migration to fix the most dangerous policies — tables with `public` role INSERT/UPDATE/DELETE using `true`. Priority tables:

**High-risk user-data tables** (have `user_id`, should scope to `auth.uid()`):
- `artwork`, `subscriptions`, `profiles`, `ai_protection_records`, `portfolios`, `copyright_matches`

**System/audit tables** (should restrict to `service_role` only — drop the `public` role policy):
- `error_logs`, `ai_protection_audit_log`, `security_audit_log`, `ai_training_violations`, `ai_detection_results`, `document_protection_jobs`

**Approach**: For each table, `DROP POLICY` the permissive one, then `CREATE POLICY` scoped to `authenticated` with `auth.uid() = user_id`. For system tables, drop the public policy entirely (edge functions use service_role key which bypasses RLS).

### Phase 2: Add Missing Stripe Webhook Secret
- Prompt you to add `STRIPE_WEBHOOK_SECRET` to Supabase edge function secrets
- This is required for the `stripe-webhook` function to verify Stripe signatures

### Phase 3: Database Performance Indexes
Single migration adding:
```sql
CREATE INDEX IF NOT EXISTS idx_artwork_user_id ON artwork(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_protection_audit_log_user ON ai_protection_audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_copyright_matches_artwork ON copyright_matches(artwork_id);
```

### Estimated Impact
- Security scan warnings: ~287 → ~50 (remaining would be intentional SELECT `true` policies)
- Stripe webhooks: fully functional
- Query performance: significantly improved on dashboard and monitoring pages

