-- Fix the handle_new_user trigger function to properly set user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  -- Generate username from email or metadata
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Get full name from metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    v_username
  );

  -- Insert profile with user_id (not id)
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    v_username,
    v_full_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create default subscription with plan_id
  INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '1 year');

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Backfill missing profile for user d68fc2d5-884e-4d37-8487-7a6f3b49c8bd
INSERT INTO public.profiles (user_id, full_name, username)
VALUES ('d68fc2d5-884e-4d37-8487-7a6f3b49c8bd', 'Plugin User', 'pluginuser')
ON CONFLICT (user_id) DO NOTHING;

-- Backfill missing role
INSERT INTO public.user_roles (user_id, role)
VALUES ('d68fc2d5-884e-4d37-8487-7a6f3b49c8bd', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Backfill missing subscription
INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
VALUES ('d68fc2d5-884e-4d37-8487-7a6f3b49c8bd', 'free', 'active', NOW(), NOW() + INTERVAL '1 year')
ON CONFLICT DO NOTHING;