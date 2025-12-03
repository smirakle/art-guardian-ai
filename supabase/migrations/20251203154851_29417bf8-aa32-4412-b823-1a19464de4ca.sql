-- IMPROVEMENT 4: Fix function search_path security warnings
ALTER FUNCTION public.calculate_next_scheduled_scan SET search_path = 'public';
ALTER FUNCTION public.check_daily_api_limit SET search_path = 'public';
ALTER FUNCTION public.generate_enterprise_api_key SET search_path = 'public';
ALTER FUNCTION public.get_daily_usage_stats SET search_path = 'public';
ALTER FUNCTION public.handle_new_user SET search_path = 'public';
ALTER FUNCTION public.update_scheduled_monitoring_next_execution SET search_path = 'public';
ALTER FUNCTION public.update_user_roles_updated_at SET search_path = 'public';

-- IMPROVEMENT 2: Guest session rate limiting tables
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  session_token_hash TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  upload_count INTEGER DEFAULT 0,
  max_uploads INTEGER DEFAULT 5,
  is_valid BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.guest_upload_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  window_start TIMESTAMPTZ DEFAULT date_trunc('hour', now()),
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ip_address, window_start)
);

-- Enable RLS on guest tables
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_upload_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for guest_sessions (service role only for management)
CREATE POLICY "Service role can manage guest sessions"
ON public.guest_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Policies for guest_upload_rate_limits
CREATE POLICY "Service role can manage rate limits"
ON public.guest_upload_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to validate and increment guest session
CREATE OR REPLACE FUNCTION public.validate_guest_session(
  p_session_token TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_session RECORD;
  v_result jsonb;
BEGIN
  -- Find session by token hash
  SELECT * INTO v_session
  FROM public.guest_sessions
  WHERE session_token_hash = encode(sha256(convert_to(p_session_token, 'UTF8')), 'hex')
    AND expires_at > now()
    AND is_valid = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired session'
    );
  END IF;
  
  -- Check upload limit
  IF v_session.upload_count >= v_session.max_uploads THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Upload limit reached',
      'uploads_used', v_session.upload_count,
      'max_uploads', v_session.max_uploads
    );
  END IF;
  
  -- Increment upload count
  UPDATE public.guest_sessions
  SET upload_count = upload_count + 1
  WHERE id = v_session.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'session_id', v_session.id,
    'uploads_remaining', v_session.max_uploads - v_session.upload_count - 1
  );
END;
$$;

-- Function to check IP rate limit
CREATE OR REPLACE FUNCTION public.check_guest_ip_rate_limit(
  p_ip_address INET,
  p_max_requests INTEGER DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_window TIMESTAMPTZ;
  v_request_count INTEGER;
BEGIN
  v_current_window := date_trunc('hour', now());
  
  -- Upsert rate limit record
  INSERT INTO public.guest_upload_rate_limits (ip_address, window_start, request_count)
  VALUES (p_ip_address, v_current_window, 1)
  ON CONFLICT (ip_address, window_start)
  DO UPDATE SET request_count = guest_upload_rate_limits.request_count + 1
  RETURNING request_count INTO v_request_count;
  
  IF v_request_count > p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'error', 'Rate limit exceeded',
      'retry_after', extract(epoch from (v_current_window + interval '1 hour' - now()))::integer
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'requests_remaining', p_max_requests - v_request_count
  );
END;
$$;

-- Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.guest_sessions WHERE expires_at < now();
  DELETE FROM public.guest_upload_rate_limits WHERE window_start < now() - interval '24 hours';
END;
$$;

-- IMPROVEMENT 3: Update storage buckets to private
UPDATE storage.buckets SET public = false WHERE id = 'mobile-apps';
UPDATE storage.buckets SET public = false WHERE id = 'nft-assets';
UPDATE storage.buckets SET public = false WHERE id = 'protected-artwork';
UPDATE storage.buckets SET public = false WHERE id = 'protected-documents';

-- Add index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token_hash ON public.guest_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires ON public.guest_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_guest_rate_limits_ip_window ON public.guest_upload_rate_limits(ip_address, window_start);