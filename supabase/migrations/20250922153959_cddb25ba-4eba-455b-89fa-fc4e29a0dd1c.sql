-- Add file size tracking and storage optimizations
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS original_file_size BIGINT DEFAULT 0;
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS compressed_file_size BIGINT DEFAULT 0;
ALTER TABLE public.artwork ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Add composite indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artwork_user_status ON public.artwork(user_id, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artwork_user_created ON public.artwork(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artwork_processing_status ON public.artwork(processing_status) WHERE processing_status IN ('pending', 'processing');

-- Update storage calculation function to use actual file sizes
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_storage BIGINT := 0;
  artwork_count_val INTEGER := 0;
  base_limit BIGINT;
  addon_storage BIGINT := 0;
  total_limit BIGINT;
  user_plan TEXT;
BEGIN
  -- Count artworks and sum actual file sizes
  SELECT 
    COUNT(*),
    COALESCE(SUM(GREATEST(file_size, original_file_size, 1048576)), 0) -- Default 1MB if no size recorded
  INTO artwork_count_val, total_storage
  FROM public.artwork
  WHERE user_id = user_id_param AND status = 'active';
  
  -- Get user's plan to determine base limit
  SELECT s.plan_id INTO user_plan
  FROM public.subscriptions s
  WHERE s.user_id = user_id_param 
    AND s.status = 'active' 
    AND s.current_period_end > now()
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Set base storage limit based on plan
  CASE user_plan
    WHEN 'free' THEN base_limit := 1073741824; -- 1GB
    WHEN 'student' THEN base_limit := 5368709120; -- 5GB
    WHEN 'starter' THEN base_limit := 21474836480; -- 20GB
    WHEN 'professional' THEN base_limit := 1099511627776; -- 1TB for 250k images
    WHEN 'enterprise' THEN base_limit := 5497558138880; -- 5TB
    ELSE base_limit := 1073741824; -- 1GB default
  END CASE;
  
  -- Calculate addon storage
  SELECT COALESCE(SUM(storage_amount_gb * 1073741824), 0)
  INTO addon_storage
  FROM public.storage_addons
  WHERE user_id = user_id_param AND is_active = true;
  
  total_limit := base_limit + addon_storage;
  
  -- Upsert storage usage with actual file sizes
  INSERT INTO public.user_storage_usage (
    user_id,
    storage_used_bytes,
    storage_limit_bytes,
    artwork_count,
    last_calculated_at
  ) VALUES (
    user_id_param,
    total_storage,
    total_limit,
    artwork_count_val,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    storage_used_bytes = EXCLUDED.storage_used_bytes,
    storage_limit_bytes = EXCLUDED.storage_limit_bytes,
    artwork_count = EXCLUDED.artwork_count,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
END;
$$;

-- Add performance monitoring table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on performance metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for performance metrics
CREATE POLICY "Users can view their own performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert performance metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create batch processing queue table
CREATE TABLE IF NOT EXISTS public.batch_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type TEXT NOT NULL,
  batch_size INTEGER NOT NULL DEFAULT 10,
  items_processed INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  progress_percentage NUMERIC DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on batch processing queue
ALTER TABLE public.batch_processing_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for batch processing
CREATE POLICY "Users can manage their own batch processes" 
ON public.batch_processing_queue 
FOR ALL 
USING (auth.uid() = user_id);

-- Update artwork limits function for better performance
CREATE OR REPLACE FUNCTION public.get_artwork_limit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_subscription RECORD;
    limit_count INTEGER := 0;
BEGIN
    SELECT s.plan_id, (s.status = 'active' AND s.current_period_end > now()) as is_active
    INTO user_subscription
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active' 
    AND s.current_period_end > now()
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 1000; -- Default limit for free users
    END IF;
    
    CASE user_subscription.plan_id
        WHEN 'free' THEN limit_count := 1000;
        WHEN 'student' THEN limit_count := 5000;
        WHEN 'starter' THEN limit_count := 15000;
        WHEN 'professional' THEN limit_count := 250000; -- Updated for 250k
        WHEN 'enterprise' THEN limit_count := 1000000; -- 1M for enterprise
        ELSE limit_count := 1000;
    END CASE;
    
    RETURN limit_count;
END;
$$;

-- Add trigger to update file sizes on artwork upload
CREATE OR REPLACE FUNCTION public.update_artwork_file_size()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update storage calculation whenever artwork is modified
  PERFORM public.calculate_user_storage_usage(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Create trigger for automatic storage updates
DROP TRIGGER IF EXISTS update_storage_on_artwork_change ON public.artwork;
CREATE TRIGGER update_storage_on_artwork_change
  AFTER INSERT OR UPDATE OR DELETE ON public.artwork
  FOR EACH ROW
  EXECUTE FUNCTION public.update_artwork_file_size();