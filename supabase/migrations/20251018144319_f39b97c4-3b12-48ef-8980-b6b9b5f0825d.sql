-- Create promo codes table to track usage and limits
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL,
  max_uses INTEGER NOT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_lifetime BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo code redemptions table to track who used which codes
CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for promo_codes
CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for promo_code_redemptions  
CREATE POLICY "Users can view their own redemptions"
  ON public.promo_code_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create redemptions"
  ON public.promo_code_redemptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all redemptions"
  ON public.promo_code_redemptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_code_redemptions_user_id ON public.promo_code_redemptions(user_id);
CREATE INDEX idx_promo_code_redemptions_promo_code_id ON public.promo_code_redemptions(promo_code_id);

-- Insert the BETA200 promo code
INSERT INTO public.promo_codes (code, discount_percentage, max_uses, is_lifetime, is_active)
VALUES ('BETA200', 30, 200, true, true)
ON CONFLICT (code) DO NOTHING;

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION public.validate_promo_code(code_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  promo_record RECORD;
  result JSONB;
BEGIN
  -- Get promo code details
  SELECT * INTO promo_record
  FROM public.promo_codes
  WHERE code = UPPER(code_param)
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND current_uses < max_uses;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired promo code'
    );
  END IF;
  
  -- Check if user already used this code
  IF EXISTS (
    SELECT 1 FROM public.promo_code_redemptions
    WHERE promo_code_id = promo_record.id
      AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'You have already used this promo code'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'code_id', promo_record.id,
    'discount_percentage', promo_record.discount_percentage,
    'is_lifetime', promo_record.is_lifetime,
    'uses_remaining', promo_record.max_uses - promo_record.current_uses
  );
END;
$$;

-- Function to record promo code redemption
CREATE OR REPLACE FUNCTION public.redeem_promo_code(code_param TEXT, subscription_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  promo_id UUID;
BEGIN
  -- Get promo code ID and increment usage
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE code = UPPER(code_param)
    AND is_active = true
    AND current_uses < max_uses
  RETURNING id INTO promo_id;
  
  IF promo_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Record redemption
  INSERT INTO public.promo_code_redemptions (
    promo_code_id,
    user_id,
    subscription_id,
    metadata
  ) VALUES (
    promo_id,
    auth.uid(),
    subscription_id_param,
    jsonb_build_object('redeemed_at', now())
  );
  
  RETURN true;
END;
$$;