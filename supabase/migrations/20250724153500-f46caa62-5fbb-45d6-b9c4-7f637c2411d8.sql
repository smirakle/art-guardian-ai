-- CRITICAL SECURITY FIXES

-- 1. Fix Database Function Security - Add search_path protection
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  
  -- Assign role based on email - ONLY admin email gets admin role
  IF NEW.email = 'shc302@g.harvard.edu' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Create audit log table for security events
CREATE TABLE public.security_audit_log (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view security audit logs"
ON public.security_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can create audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- 3. Strengthen user_roles table security with additional validation
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Prevent privilege escalation - only admins can assign admin role
  IF NEW.role = 'admin' AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    -- Special case: during user creation via handle_new_user trigger
    IF TG_OP = 'INSERT' AND NEW.user_id IN (
      SELECT id FROM auth.users WHERE email = 'shc302@g.harvard.edu'
    ) THEN
      -- Allow admin role assignment for the designated admin email
      RETURN NEW;
    END IF;
    
    RAISE EXCEPTION 'Only administrators can assign admin roles';
  END IF;
  
  -- Log role changes for audit
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.security_audit_log (
      user_id, 
      action, 
      resource_type, 
      resource_id, 
      details
    ) VALUES (
      auth.uid(),
      'role_change',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_user_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role validation
CREATE TRIGGER validate_role_change_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_change();

-- 4. Add additional RLS policy to prevent unauthorized role modifications
CREATE POLICY "Prevent unauthorized admin role assignment"
ON public.user_roles
FOR INSERT
WITH CHECK (
  -- Allow system operations (during user registration)
  (role != 'admin' OR auth.uid() IS NULL) OR
  -- Allow admin users to assign any role
  has_role(auth.uid(), 'admin'::app_role) OR
  -- Allow the designated admin email during registration
  (role = 'admin' AND user_id IN (
    SELECT id FROM auth.users WHERE email = 'shc302@g.harvard.edu'
  ))
);

CREATE POLICY "Prevent unauthorized role updates"
ON public.user_roles
FOR UPDATE
USING (
  -- Only admins can update roles
  has_role(auth.uid(), 'admin'::app_role)
);

-- 5. Remove the insecure assign_admin_role function
DROP FUNCTION IF EXISTS public.assign_admin_role();