-- Create secure admin authentication function
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create admin sessions table for secure maintenance mode access
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour'),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on admin sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only allow system to manage admin sessions
CREATE POLICY "System manages admin sessions" ON public.admin_sessions
FOR ALL USING (false);

-- Create function to validate admin session
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;