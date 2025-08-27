-- Fix the calculate_user_storage_usage function to work without file_size column
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  total_storage BIGINT := 0;
  artwork_count_val INTEGER := 0;
  base_limit BIGINT := 1073741824; -- 1GB
  addon_storage BIGINT := 0;
  total_limit BIGINT;
BEGIN
  -- Count artworks (estimate storage based on count for now)
  SELECT COUNT(*)
  INTO artwork_count_val
  FROM public.artwork
  WHERE user_id = user_id_param AND status = 'active';
  
  -- Estimate storage as 5MB per artwork (this is a placeholder until we have actual file sizes)
  total_storage := artwork_count_val * 5242880; -- 5MB per artwork
  
  -- Calculate addon storage
  SELECT COALESCE(SUM(storage_amount_gb * 1073741824), 0)
  INTO addon_storage
  FROM public.storage_addons
  WHERE user_id = user_id_param AND is_active = true;
  
  total_limit := base_limit + addon_storage;
  
  -- Upsert storage usage
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
$function$;