-- Function to check if user can upload more artworks based on their plan limit
CREATE OR REPLACE FUNCTION public.check_artwork_limit_before_upload(files_to_upload integer DEFAULT 1)
RETURNS TABLE(
  can_upload boolean,
  current_count bigint,
  artwork_limit integer,
  remaining_slots bigint,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id_val uuid;
  current_artwork_count bigint;
  user_artwork_limit integer;
  slots_remaining bigint;
BEGIN
  user_id_val := auth.uid();
  
  IF user_id_val IS NULL THEN
    RETURN QUERY SELECT 
      false::boolean,
      0::bigint,
      0::integer,
      0::bigint,
      'Authentication required'::text;
    RETURN;
  END IF;
  
  -- Get current artwork count for user
  SELECT COUNT(*) INTO current_artwork_count
  FROM public.artwork
  WHERE user_id = user_id_val;
  
  -- Get user's artwork limit based on subscription
  SELECT public.get_artwork_limit() INTO user_artwork_limit;
  
  -- Handle unlimited (-1) or no subscription (0)
  IF user_artwork_limit <= 0 THEN
    IF user_artwork_limit = -1 THEN
      -- Enterprise with unlimited
      RETURN QUERY SELECT 
        true::boolean,
        current_artwork_count,
        -1::integer,
        999999::bigint,
        'Unlimited uploads available'::text;
    ELSE
      -- No active subscription
      RETURN QUERY SELECT 
        false::boolean,
        current_artwork_count,
        0::integer,
        0::bigint,
        'Active subscription required to upload'::text;
    END IF;
    RETURN;
  END IF;
  
  -- Calculate remaining slots
  slots_remaining := user_artwork_limit - current_artwork_count;
  
  -- Check if user can upload the requested number of files
  IF slots_remaining >= files_to_upload THEN
    RETURN QUERY SELECT 
      true::boolean,
      current_artwork_count,
      user_artwork_limit,
      slots_remaining,
      format('You can upload %s more artworks', slots_remaining)::text;
  ELSE
    RETURN QUERY SELECT 
      false::boolean,
      current_artwork_count,
      user_artwork_limit,
      GREATEST(slots_remaining, 0::bigint),
      format('Upload limit reached. You have %s of %s artworks. Upgrade your plan for more.', current_artwork_count, user_artwork_limit)::text;
  END IF;
END;
$$;

-- Optimized function to get artwork count efficiently
CREATE OR REPLACE FUNCTION public.get_user_artwork_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) FROM public.artwork WHERE user_id = auth.uid();
$$;

-- Create index for faster counting if not exists
CREATE INDEX IF NOT EXISTS idx_artwork_user_id ON public.artwork(user_id);