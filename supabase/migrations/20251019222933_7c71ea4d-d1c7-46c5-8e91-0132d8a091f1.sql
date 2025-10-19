-- Create table to track daily API usage across services
CREATE TABLE IF NOT EXISTS public.daily_api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL, -- 'full_scan', 'monitoring', 'ai_analysis'
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_type, usage_date)
);

-- Enable RLS
ALTER TABLE public.daily_api_usage ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own usage"
ON public.daily_api_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.daily_api_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.daily_api_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to check and increment daily usage
CREATE OR REPLACE FUNCTION check_daily_api_limit(
  p_user_id UUID,
  p_service_type TEXT,
  p_daily_limit INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_current_usage INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get or create today's usage record
  INSERT INTO public.daily_api_usage (user_id, service_type, usage_date, daily_limit, request_count)
  VALUES (p_user_id, p_service_type, v_today, p_daily_limit, 0)
  ON CONFLICT (user_id, service_type, usage_date) 
  DO NOTHING;

  -- Get current usage
  SELECT request_count INTO v_current_usage
  FROM public.daily_api_usage
  WHERE user_id = p_user_id 
    AND service_type = p_service_type 
    AND usage_date = v_today;

  -- Check if limit exceeded
  IF v_current_usage >= p_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage', v_current_usage,
      'daily_limit', p_daily_limit,
      'reset_time', (v_today + INTERVAL '1 day')::TEXT
    );
  END IF;

  -- Increment usage
  UPDATE public.daily_api_usage
  SET request_count = request_count + 1,
      updated_at = now()
  WHERE user_id = p_user_id 
    AND service_type = p_service_type 
    AND usage_date = v_today;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_usage', v_current_usage + 1,
    'daily_limit', p_daily_limit,
    'remaining', p_daily_limit - (v_current_usage + 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage stats
CREATE OR REPLACE FUNCTION get_daily_usage_stats(p_user_id UUID)
RETURNS TABLE (
  service_type TEXT,
  current_usage INTEGER,
  daily_limit INTEGER,
  remaining INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dau.service_type,
    dau.request_count,
    dau.daily_limit,
    GREATEST(0, dau.daily_limit - dau.request_count) as remaining,
    (dau.usage_date + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE as reset_time
  FROM public.daily_api_usage dau
  WHERE dau.user_id = p_user_id 
    AND dau.usage_date = CURRENT_DATE
  ORDER BY dau.service_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;