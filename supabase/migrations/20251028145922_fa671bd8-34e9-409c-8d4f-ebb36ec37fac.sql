-- Enable pgcrypto extension for secure random generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the generate_enterprise_api_key function to ensure it works
CREATE OR REPLACE FUNCTION public.generate_enterprise_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_key TEXT;
BEGIN
  -- Generate a secure random API key with prefix
  api_key := 'tsmo_' || encode(gen_random_bytes(32), 'hex');
  RETURN api_key;
END;
$$;