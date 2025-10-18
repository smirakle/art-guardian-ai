# Security Hardening Guide

## Overview
This guide addresses the 190 security warnings from Supabase linter, focusing on high-priority issues that expose sensitive data or allow unauthorized access.

---

## Priority 1: Anonymous Access Policies (CRITICAL)

### Issue
Many RLS policies allow access to anonymous users (`auth.uid()` can be NULL), exposing data to unauthenticated users.

### Impact
- 🔴 **HIGH RISK**: Sensitive user data exposed to anyone
- 🔴 **HIGH RISK**: Admin functions accessible without authentication
- 🟡 **MEDIUM RISK**: Performance data visible to competitors

### Fix Strategy

#### Pattern to Replace
```sql
-- ❌ WRONG - Allows anonymous access
USING (auth.uid() = user_id)

-- ✅ CORRECT - Requires authentication
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
```

### Tables to Fix Immediately

#### 1. User-Specific Data Tables
These tables contain personal/sensitive data:

```sql
-- ai_protection_records
DROP POLICY IF EXISTS "Users can view their own protection records" ON ai_protection_records;
CREATE POLICY "Users can view their own protection records" 
ON ai_protection_records FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- artwork
DROP POLICY IF EXISTS "Users can manage their own artwork" ON artwork;
CREATE POLICY "Users can manage their own artwork" 
ON artwork FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ai_detection_results
DROP POLICY IF EXISTS "Authenticated users can manage their own AI detection results" ON ai_detection_results;
CREATE POLICY "Authenticated users can manage their own AI detection results" 
ON ai_detection_results FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- subscriptions (if exists)
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription" 
ON subscriptions FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND id = auth.uid());
```

#### 2. Admin-Only Tables
These should ONLY be accessible to admins:

```sql
-- admin_sessions
DROP POLICY IF EXISTS "Service role can manage admin sessions" ON admin_sessions;
CREATE POLICY "Only admins can manage sessions" 
ON admin_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- production_metrics
DROP POLICY IF EXISTS "System and admins can manage production metrics" ON production_metrics;
CREATE POLICY "Only admins can view production metrics" 
ON production_metrics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- error_logs
CREATE POLICY "Only admins can view error logs" 
ON error_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- operating_costs (if exists)
CREATE POLICY "Only admins can manage operating costs" 
ON operating_costs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

#### 3. Public-Read Tables
Only these tables should allow anonymous SELECT:

```sql
-- community_posts (public content)
-- Keep existing: "Anyone can view community posts"

-- legal_templates (public resources)
-- Keep existing: "Anyone can view legal templates"

-- pricing_tiers (public pricing info)
-- Keep existing: "Anyone can view pricing"
```

---

## Priority 2: Extensions in Public Schema

### Issue
PostgreSQL extensions should be in a dedicated schema, not `public`.

### Migration Steps

```sql
-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_stat_statements
DROP EXTENSION IF EXISTS pg_stat_statements CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

-- Move pgcrypto (if exists)
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Update search_path for functions that use extensions
ALTER DATABASE postgres SET search_path TO public, extensions;
```

---

## Priority 3: Admin Role Security

### Issue
Admin role assignment must be strictly controlled to prevent privilege escalation.

### Current Implementation
✅ Already implemented in `validate_role_change()` trigger

### Additional Hardening

```sql
-- Add audit logging for all admin role changes
CREATE OR REPLACE FUNCTION audit_admin_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all admin role assignments
  IF NEW.role = 'admin' THEN
    INSERT INTO security_audit_log (
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'admin_role_assigned',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object(
        'assigned_by', auth.uid(),
        'assigned_to', NEW.user_id,
        'timestamp', now()
      ),
      'critical'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_admin_assignments
  AFTER INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin'::app_role)
  EXECUTE FUNCTION audit_admin_role_assignment();
```

### Admin Access Monitoring

```sql
-- Create admin activity monitoring
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin activity
CREATE POLICY "Admins can view admin activity" 
ON admin_activity_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

---

## Priority 4: Rate Limiting & Abuse Prevention

### API Rate Limiting

```sql
-- Check if rate limit table needs stricter policies
ALTER TABLE ai_protection_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own rate limits" 
ON ai_protection_rate_limits FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Prevent tampering
CREATE POLICY "System only can update rate limits" 
ON ai_protection_rate_limits FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### Brute Force Protection

```sql
-- Track failed login attempts
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT
);

-- Auto-cleanup old attempts
CREATE INDEX idx_failed_login_cleanup ON failed_login_attempts(attempted_at);

-- Function to check if IP is rate limited
CREATE OR REPLACE FUNCTION is_ip_rate_limited(check_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM failed_login_attempts
  WHERE ip_address = check_ip
    AND attempted_at > now() - INTERVAL '15 minutes';
  
  RETURN attempt_count >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

## Priority 5: Data Encryption & PII Protection

### Sensitive Data Audit

Tables containing PII (Personal Identifiable Information):
- `profiles` (email, full_name, username)
- `subscriptions` (stripe_customer_id)
- `artwork` (potentially personal artwork)
- `legal_cases` (legal information)

### PII Protection Checklist

```sql
-- Ensure profiles table has proper RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own PII
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" 
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND id = auth.uid());

-- Public profiles should expose limited data
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  created_at
FROM profiles
WHERE id IN (
  SELECT user_id FROM artwork WHERE status = 'active'
);

-- Grant access to public view
GRANT SELECT ON public_profiles TO anon, authenticated;
```

---

## Implementation Plan

### Week 1: Critical Fixes
- [ ] Day 1-2: Fix anonymous access policies on user tables
- [ ] Day 3: Fix admin-only table policies
- [ ] Day 4: Test all RLS policies with different user roles
- [ ] Day 5: Verify no data leaks to anonymous users

### Week 2: Infrastructure Hardening
- [ ] Day 1: Move extensions to dedicated schema
- [ ] Day 2: Implement rate limiting
- [ ] Day 3: Add admin activity monitoring
- [ ] Day 4: Set up security alerts
- [ ] Day 5: Documentation and testing

### Week 3: Monitoring & Auditing
- [ ] Day 1-2: Implement security audit logging
- [ ] Day 3: Set up automated security scans
- [ ] Day 4: Create security dashboard
- [ ] Day 5: Final security review

---

## Testing Checklist

### RLS Policy Testing

```typescript
// Test 1: Anonymous user cannot access user data
// Logout completely
await supabase.auth.signOut();

// Try to access protected data
const { data, error } = await supabase
  .from('artwork')
  .select('*');

// Expected: error or empty array, NOT user data

// Test 2: User A cannot see User B's data
// Login as User A
const { data: userAData } = await supabase
  .from('artwork')
  .select('*');

// Should only see User A's artwork

// Test 3: Admin can see all data
// Login as admin
const { data: allData } = await supabase
  .from('artwork')
  .select('*');

// Should see all users' artwork
```

### Security Audit

```sql
-- Check for tables without RLS
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename
    FROM pg_tables t
    JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.schemaname = 'public'
  )
  AND rowsecurity = false;

-- Expected: Empty result or only non-sensitive tables
```

---

## Success Criteria

✅ Zero anonymous access to user data
✅ Admin-only tables restricted to admin role
✅ All PII protected by RLS
✅ Extensions moved to dedicated schema
✅ Rate limiting active on critical endpoints
✅ Security audit log capturing admin actions
✅ Failed login attempt tracking working
✅ All security linter warnings reviewed and addressed

---

## Monitoring & Alerts

### Set Up Security Alerts

1. **Failed Login Monitoring**:
   - Alert when 10+ failed logins from same IP in 5 minutes
   
2. **Admin Activity Monitoring**:
   - Alert on any admin role assignments
   - Alert on bulk data exports

3. **RLS Policy Violations**:
   - Log and alert when policies deny access
   - Track potential attack patterns

### Weekly Security Review

Create a scheduled job to:
- Review admin activity log
- Check for unusual access patterns
- Verify RLS policies are functioning
- Review and rotate API keys
