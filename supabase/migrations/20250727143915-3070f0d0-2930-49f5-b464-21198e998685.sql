-- Update artwork limits to match pricing page
-- Student: 50, Starter: 150, Professional: 1000

-- First, let's create or update the get_artwork_limit function
CREATE OR REPLACE FUNCTION public.get_artwork_limit()
RETURNS INTEGER AS $$
DECLARE
    user_subscription RECORD;
    limit_count INTEGER := 0;
BEGIN
    -- Get user subscription details
    SELECT s.plan_id, s.is_active
    INTO user_subscription
    FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.is_active = true
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no active subscription found, return 0
    IF NOT FOUND OR user_subscription.is_active = false THEN
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
        ELSE
            limit_count := 0;
    END CASE;
    
    RETURN limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;