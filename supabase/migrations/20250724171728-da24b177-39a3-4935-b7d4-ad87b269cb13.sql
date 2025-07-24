-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.validate_admin_token(token_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the provided token hash matches the stored admin token
  -- This should be set through environment variables, not hardcoded
  RETURN token_hash = encode(sha256(convert_to(current_setting('app.admin_token', true), 'UTF8')), 'hex');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Fix the admin session validation function
CREATE OR REPLACE FUNCTION public.is_valid_admin_session(session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_sessions 
    WHERE session_token = $1 
    AND expires_at > now() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';