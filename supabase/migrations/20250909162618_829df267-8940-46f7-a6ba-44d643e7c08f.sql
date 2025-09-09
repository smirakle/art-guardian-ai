-- Security Fix 1: Hash admin session tokens
CREATE OR REPLACE FUNCTION public.hash_session_token(token text)
RETURNS text AS $$
BEGIN
  RETURN encode(sha256(convert_to(token, 'UTF8')), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin_sessions table to store hashed tokens
ALTER TABLE public.admin_sessions 
ADD COLUMN IF NOT EXISTS session_token_hash text;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash 
ON public.admin_sessions (session_token_hash);

-- Security Fix 2: Create function to validate hashed admin sessions
CREATE OR REPLACE FUNCTION public.is_valid_hashed_admin_session(session_token text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

-- Security Fix 3: Add IP address tracking to admin sessions
ALTER TABLE public.admin_sessions 
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Security Fix 4: Add session invalidation on suspicious activity
CREATE OR REPLACE FUNCTION public.invalidate_admin_sessions_by_ip(ip_param inet)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_sessions 
  SET is_active = false 
  WHERE ip_address = ip_param AND is_active = true;
END;
$$;