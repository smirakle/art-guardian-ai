-- Add discount_duration_months column to promo_codes table
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS discount_duration_months INTEGER DEFAULT NULL;

-- Add promo_discount_ends_at column to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS promo_discount_ends_at TIMESTAMP WITH TIME ZONE;

-- Update validate_promo_code function to return duration info
CREATE OR REPLACE FUNCTION public.validate_promo_code(code_param text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  promo_record RECORD;
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
  
  -- Check if user already used this code (only if authenticated)
  IF auth.uid() IS NOT NULL AND EXISTS (
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
    'discount_duration_months', promo_record.discount_duration_months,
    'uses_remaining', promo_record.max_uses - promo_record.current_uses
  );
END;
$function$;

-- Insert the STUDENTUSER promo code (30% off for 3 months)
INSERT INTO public.promo_codes (
  code, 
  discount_percentage, 
  max_uses, 
  is_lifetime, 
  is_active,
  discount_duration_months
)
VALUES (
  'STUDENTUSER', 
  30,
  1000,
  false,
  true,
  3
)
ON CONFLICT (code) DO UPDATE SET
  discount_percentage = 30,
  discount_duration_months = 3,
  is_lifetime = false,
  is_active = true;