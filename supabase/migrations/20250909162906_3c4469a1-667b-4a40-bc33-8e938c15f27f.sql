-- Critical Security Fix 5: Fix Function Search Paths
CREATE OR REPLACE FUNCTION public.hash_session_token(token text)
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(sha256(convert_to(token, 'UTF8')), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_hashed_admin_session(session_token text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_sessions 
    WHERE session_token_hash = public.hash_session_token(session_token)
    AND expires_at > now() 
    AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.invalidate_admin_sessions_by_ip(ip_param inet)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_sessions 
  SET is_active = false 
  WHERE ip_address = ip_param AND is_active = true;
END;
$$;

-- Critical Security Fix 6: Tighten Anonymous Access RLS Policies
-- Fix leads table to require authentication for all operations except public insert
DROP POLICY IF EXISTS "Leads readable by staff" ON public.leads;
DROP POLICY IF EXISTS "Leads updatable by authenticated" ON public.leads;
DROP POLICY IF EXISTS "Leads deletable by authenticated" ON public.leads;

CREATE POLICY "Admins can manage all leads" 
ON public.leads 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix blockchain_verifications to require authentication for inserts
DROP POLICY IF EXISTS "Anyone can create blockchain verifications" ON public.blockchain_verifications;

CREATE POLICY "Authenticated users can create blockchain verifications" 
ON public.blockchain_verifications 
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix template_usage_stats to remove anonymous access
DROP POLICY IF EXISTS "Anyone can view template stats" ON public.template_usage_stats;

CREATE POLICY "Authenticated users can view template stats" 
ON public.template_usage_stats 
FOR SELECT
TO authenticated
USING (true);

-- Critical Security Fix 7: Add missing constraints for security
ALTER TABLE public.admin_sessions 
ADD CONSTRAINT check_session_expiry 
CHECK (expires_at > created_at);

-- Add rate limiting constraints
ALTER TABLE public.enterprise_api_rate_limits
ADD CONSTRAINT check_positive_request_count 
CHECK (request_count >= 0);

-- Critical Security Fix 8: Create secure API key generation
CREATE OR REPLACE FUNCTION public.generate_secure_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  api_key text;
BEGIN
  -- Generate a cryptographically secure API key
  api_key := 'tsmo_' || encode(gen_random_bytes(40), 'hex');
  RETURN api_key;
END;
$$;