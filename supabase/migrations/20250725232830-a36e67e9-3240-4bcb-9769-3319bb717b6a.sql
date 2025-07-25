-- Update the user_has_membership function to properly check subscription status
-- instead of only looking at template purchases
CREATE OR REPLACE FUNCTION public.user_has_membership(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  -- Check if user has any active subscription
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = _user_id 
    AND status = 'active'
    AND current_period_end > now()
  );
$function$