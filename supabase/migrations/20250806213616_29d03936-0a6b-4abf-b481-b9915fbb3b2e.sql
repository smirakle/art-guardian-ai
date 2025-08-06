-- Create enterprise API keys table
CREATE TABLE public.enterprise_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for display
  permissions TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_requests INTEGER NOT NULL DEFAULT 1000,
  rate_limit_window_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API usage tracking table
CREATE TABLE public.enterprise_api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.enterprise_api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API rate limiting table
CREATE TABLE public.enterprise_api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.enterprise_api_keys(id) ON DELETE CASCADE,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(api_key_id, window_start)
);

-- Create webhooks table
CREATE TABLE public.enterprise_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT,
  event_types TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  last_delivery_at TIMESTAMP WITH TIME ZONE,
  last_delivery_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_enterprise_api_keys_user_id ON public.enterprise_api_keys(user_id);
CREATE INDEX idx_enterprise_api_keys_api_key ON public.enterprise_api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_enterprise_api_usage_api_key_id ON public.enterprise_api_usage(api_key_id);
CREATE INDEX idx_enterprise_api_usage_created_at ON public.enterprise_api_usage(created_at);
CREATE INDEX idx_enterprise_api_rate_limits_api_key_window ON public.enterprise_api_rate_limits(api_key_id, window_start);
CREATE INDEX idx_enterprise_webhooks_user_id ON public.enterprise_webhooks(user_id);

-- Enable RLS
ALTER TABLE public.enterprise_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for API keys
CREATE POLICY "Users can manage their own API keys"
ON public.enterprise_api_keys
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for API usage
CREATE POLICY "Users can view their own API usage"
ON public.enterprise_api_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create API usage records"
ON public.enterprise_api_usage
FOR INSERT
WITH CHECK (true);

-- RLS policies for rate limits
CREATE POLICY "System can manage rate limits"
ON public.enterprise_api_rate_limits
FOR ALL
USING (true);

-- RLS policies for webhooks
CREATE POLICY "Users can manage their own webhooks"
ON public.enterprise_webhooks
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_enterprise_api_keys_updated_at
  BEFORE UPDATE ON public.enterprise_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_api_rate_limits_updated_at
  BEFORE UPDATE ON public.enterprise_api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_webhooks_updated_at
  BEFORE UPDATE ON public.enterprise_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate API key
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

-- Function to check API rate limit
CREATE OR REPLACE FUNCTION public.check_enterprise_api_rate_limit(
  api_key_param TEXT,
  endpoint_param TEXT DEFAULT '/'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_record RECORD;
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get API key details
  SELECT ak.id, ak.rate_limit_requests, ak.rate_limit_window_minutes, ak.is_active
  INTO key_record
  FROM public.enterprise_api_keys ak
  WHERE ak.api_key = api_key_param AND ak.is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Calculate window start
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / key_record.rate_limit_window_minutes) * 
    (key_record.rate_limit_window_minutes || ' minutes')::interval;
  
  -- Get or create rate limit record
  INSERT INTO public.enterprise_api_rate_limits (api_key_id, window_start, request_count)
  VALUES (key_record.id, window_start, 1)
  ON CONFLICT (api_key_id, window_start)
  DO UPDATE SET 
    request_count = enterprise_api_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  -- Return true if under limit
  RETURN current_count <= key_record.rate_limit_requests;
END;
$$;

-- Function to log API usage
CREATE OR REPLACE FUNCTION public.log_enterprise_api_usage(
  api_key_param TEXT,
  endpoint_param TEXT,
  method_param TEXT,
  status_code_param INTEGER,
  response_time_ms_param INTEGER DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  error_message_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_record RECORD;
BEGIN
  -- Get API key details
  SELECT ak.id, ak.user_id
  INTO key_record
  FROM public.enterprise_api_keys ak
  WHERE ak.api_key = api_key_param AND ak.is_active = true;
  
  IF FOUND THEN
    -- Log the usage
    INSERT INTO public.enterprise_api_usage (
      api_key_id,
      user_id,
      endpoint,
      method,
      status_code,
      response_time_ms,
      ip_address,
      user_agent,
      error_message,
      metadata
    ) VALUES (
      key_record.id,
      key_record.user_id,
      endpoint_param,
      method_param,
      status_code_param,
      response_time_ms_param,
      ip_address_param,
      user_agent_param,
      error_message_param,
      metadata_param
    );
    
    -- Update last used timestamp
    UPDATE public.enterprise_api_keys
    SET last_used_at = now()
    WHERE id = key_record.id;
  END IF;
END;
$$;