-- Enable pg_net extension for HTTP requests from triggers (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the handle_new_user function to send signup notifications
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_full_name text;
  v_username text;
BEGIN
  -- Extract metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown');
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', '');

  -- Create profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    v_username,
    v_full_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Set default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create free subscription
  INSERT INTO public.subscriptions (
    user_id,
    subscription_tier,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  );

  -- Send async notification to admin (non-blocking)
  PERFORM net.http_post(
    url := 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/new-user-signup-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.headers', true)::json->>'authorization'
    ),
    body := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'fullName', v_full_name,
      'username', v_username,
      'signupTime', now()
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;