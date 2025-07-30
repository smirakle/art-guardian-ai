-- Create the get_portfolio_limit function to include portfolio limits
CREATE OR REPLACE FUNCTION public.get_portfolio_limit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    user_subscription RECORD;
    limit_count INTEGER := 0;
BEGIN
    -- Get user subscription details using proper status check
    SELECT s.plan_id, (s.status = 'active' AND s.current_period_end > now()) as is_active
    INTO user_subscription
    FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active' 
    AND s.current_period_end > now()
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no active subscription found, return free tier limit
    IF NOT FOUND THEN
        RETURN 2; -- Free tier: 2 portfolios
    END IF;
    
    -- Set limits based on plan
    CASE user_subscription.plan_id
        WHEN 'free' THEN
            limit_count := 2;
        WHEN 'student' THEN
            limit_count := 5;
        WHEN 'starter' THEN
            limit_count := 10;
        WHEN 'professional' THEN
            limit_count := 50;
        WHEN 'enterprise' THEN
            limit_count := -1; -- Unlimited
        ELSE
            limit_count := 2; -- Default to free tier
    END CASE;
    
    RETURN limit_count;
END;
$function$