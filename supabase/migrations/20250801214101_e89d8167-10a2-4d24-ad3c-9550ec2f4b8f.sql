-- Continue fixing remaining function search_path issues
-- Update all remaining functions to have secure search_path settings

-- Update trigger_scheduled_scans function
CREATE OR REPLACE FUNCTION public.trigger_scheduled_scans()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    net.http_post(
        url:='https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/scheduled-scan-executor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQzMDM3MiwiZXhwIjoyMDY4MDA2MzcyfQ.BUIClCgdNB-TBbRbI5sH_M9NTVkKIDJUDHdNNFWqEb4"}'::jsonb,
        body:='{"action": "manual_trigger"}'::jsonb
    );
$function$;

-- Update update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_legal_updated_at function
CREATE OR REPLACE FUNCTION public.update_legal_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_post_counts function
CREATE OR REPLACE FUNCTION public.update_post_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update comments count
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update update_vote_counts function
CREATE OR REPLACE FUNCTION public.update_vote_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update likes count for posts
  IF NEW.post_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.vote_type = 'like' AND NEW.vote_type != 'like' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count - 1 
        WHERE id = NEW.post_id;
      ELSIF OLD.vote_type != 'like' AND NEW.vote_type = 'like' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
      END IF;
    END IF;
  END IF;
  
  -- Update likes count for expert advice
  IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
    UPDATE public.expert_advice 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
    UPDATE public.expert_advice 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with better error handling
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Assign role based on email - ONLY admin email gets admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'shc302@g.harvard.edu' THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create free subscription for new users
  PERFORM public.create_free_subscription_for_user(NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;