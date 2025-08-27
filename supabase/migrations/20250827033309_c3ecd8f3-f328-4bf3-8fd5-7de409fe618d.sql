-- Create storage usage tracking table
CREATE TABLE public.user_storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 1073741824, -- 1GB default
  artwork_count INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage add-ons table
CREATE TABLE public.storage_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_type TEXT NOT NULL, -- 'extra_storage', 'premium_storage'
  storage_amount_gb INTEGER NOT NULL,
  monthly_price_cents INTEGER NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage transactions table for audit
CREATE TABLE public.storage_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'upload', 'delete', 'addon_purchase'
  storage_delta_bytes BIGINT NOT NULL DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_storage_usage
CREATE POLICY "Users can view their own storage usage"
ON public.user_storage_usage
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage storage usage"
ON public.user_storage_usage
FOR ALL
USING (true);

-- RLS Policies for storage_addons
CREATE POLICY "Users can view their own storage addons"
ON public.storage_addons
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage storage addons"
ON public.storage_addons
FOR ALL
USING (true);

-- RLS Policies for storage_transactions
CREATE POLICY "Users can view their own storage transactions"
ON public.storage_transactions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create storage transactions"
ON public.storage_transactions
FOR INSERT
WITH CHECK (true);

-- Create function to calculate user storage
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_storage BIGINT := 0;
  artwork_count_val INTEGER := 0;
  base_limit BIGINT := 1073741824; -- 1GB
  addon_storage BIGINT := 0;
  total_limit BIGINT;
BEGIN
  -- Calculate total storage from artwork
  SELECT 
    COALESCE(SUM(file_size), 0),
    COUNT(*)
  INTO total_storage, artwork_count_val
  FROM public.artwork
  WHERE user_id = user_id_param AND status = 'active';
  
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
$$;

-- Create trigger to update storage on artwork changes
CREATE OR REPLACE FUNCTION public.update_storage_on_artwork_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.calculate_user_storage_usage(NEW.user_id);
    
    INSERT INTO public.storage_transactions (
      user_id,
      transaction_type,
      storage_delta_bytes,
      description
    ) VALUES (
      NEW.user_id,
      'upload',
      NEW.file_size,
      'Artwork uploaded: ' || NEW.title
    );
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_user_storage_usage(OLD.user_id);
    
    INSERT INTO public.storage_transactions (
      user_id,
      transaction_type,
      storage_delta_bytes,
      description
    ) VALUES (
      OLD.user_id,
      'delete',
      -OLD.file_size,
      'Artwork deleted: ' || OLD.title
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER artwork_storage_update
AFTER INSERT OR DELETE ON public.artwork
FOR EACH ROW
EXECUTE FUNCTION public.update_storage_on_artwork_change();

-- Add unique constraint for user_id in storage usage
ALTER TABLE public.user_storage_usage ADD CONSTRAINT user_storage_usage_user_id_key UNIQUE (user_id);