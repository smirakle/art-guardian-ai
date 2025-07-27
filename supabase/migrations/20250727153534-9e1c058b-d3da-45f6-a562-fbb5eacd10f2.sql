-- Fix the get_artwork_limit function to properly check subscription status
CREATE OR REPLACE FUNCTION public.get_artwork_limit()
RETURNS INTEGER AS $$
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
    
    -- If no active subscription found, return 0
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Set limits based on plan
    CASE user_subscription.plan_id
        WHEN 'student' THEN
            limit_count := 50;
        WHEN 'starter' THEN
            limit_count := 150;
        WHEN 'professional' THEN
            limit_count := 1000;
        WHEN 'enterprise' THEN
            limit_count := 10000;
        ELSE
            limit_count := 0;
    END CASE;
    
    RETURN limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;