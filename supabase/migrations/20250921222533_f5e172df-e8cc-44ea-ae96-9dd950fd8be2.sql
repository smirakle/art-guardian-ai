-- Update artwork limits for subscription plans
CREATE OR REPLACE FUNCTION public.get_artwork_limit()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
        RETURN 0;
    END IF;
    
    CASE user_subscription.plan_id
        WHEN 'student' THEN
            limit_count := 1000;
        WHEN 'starter' THEN
            limit_count := 3500;
        WHEN 'professional' THEN
            limit_count := 250000;
        WHEN 'enterprise' THEN
            limit_count := 10000;
        ELSE
            limit_count := 0;
    END CASE;
    
    RETURN limit_count;
END;
$function$