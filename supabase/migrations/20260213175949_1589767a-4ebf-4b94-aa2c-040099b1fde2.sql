
-- Phase 1A: Fix ip_lawyers - restrict from public to authenticated
DROP POLICY IF EXISTS "Everyone can view IP lawyers directory" ON ip_lawyers;
DROP POLICY IF EXISTS "Authenticated users can view IP lawyers" ON ip_lawyers;
CREATE POLICY "Authenticated users can view IP lawyers"
  ON ip_lawyers FOR SELECT TO authenticated
  USING (true);

-- Phase 1B: Fix leads - remove anonymous insert, restrict to authenticated only
DROP POLICY IF EXISTS "Enable insert for anonymous lead capture" ON leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can insert their own leads" ON leads;
CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT TO authenticated
  WITH CHECK (true);

-- Phase 1C: Fix promo_codes - restrict from public to authenticated
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can view active promo codes" ON promo_codes;
CREATE POLICY "Authenticated users can view active promo codes"
  ON promo_codes FOR SELECT TO authenticated
  USING (is_active = true);
