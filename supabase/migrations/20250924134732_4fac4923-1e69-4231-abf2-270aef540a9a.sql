-- CRITICAL SECURITY FIXES - Phase 2: Targeted fixes avoiding conflicts

-- 1. Fix database functions with missing search_path (highest priority security fix)
-- These functions were identified as security vulnerabilities by the linter

CREATE OR REPLACE FUNCTION public.validate_admin_token(token_hash text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the provided token hash matches the stored admin token
  -- This should be set through environment variables, not hardcoded
  RETURN token_hash = encode(sha256(convert_to(current_setting('app.admin_token', true), 'UTF8')), 'hex');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_admin_session(session_token text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_sessions 
    WHERE session_token = $1 
    AND expires_at > now() 
    AND is_active = true
  );
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

-- 2. Fix blockchain verifications anonymous access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blockchain_verifications' AND policyname = 'Anyone can view blockchain verifications') THEN
        DROP POLICY "Anyone can view blockchain verifications" ON public.blockchain_verifications;
        
        CREATE POLICY "Authenticated users can view blockchain verifications" 
        ON public.blockchain_verifications FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;
END $$;

-- 3. Fix legal professionals anonymous access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legal_professionals' AND policyname = 'Anyone can view verified professionals') THEN
        DROP POLICY "Anyone can view verified professionals" ON public.legal_professionals;
        
        CREATE POLICY "Authenticated users can view verified professionals" 
        ON public.legal_professionals FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;
END $$;

-- 4. Fix deepfake analysis anonymous access  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deepfake_analysis_results' AND policyname = 'Anyone can view deepfake analysis results') THEN
        DROP POLICY "Anyone can view deepfake analysis results" ON public.deepfake_analysis_results;
        
        CREATE POLICY "Authenticated users can view deepfake analysis results" 
        ON public.deepfake_analysis_results FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;
END $$;

-- 5. Remove overly permissive industry verticals policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'industry_verticals' AND policyname = 'Anyone can view active industry verticals') THEN
        DROP POLICY "Anyone can view active industry verticals" ON public.industry_verticals;
    END IF;
END $$;

-- 6. Remove overly permissive partner pricing policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_pricing_tiers' AND policyname = 'Anyone can view active pricing tiers') THEN
        DROP POLICY "Anyone can view active pricing tiers" ON public.partner_pricing_tiers;
    END IF;
END $$;