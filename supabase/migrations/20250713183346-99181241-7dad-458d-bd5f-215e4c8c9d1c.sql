-- Function to assign admin role to specific email
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'shc302@g.harvard.edu';
    
    -- If user exists, assign admin role
    IF admin_user_id IS NOT NULL THEN
        -- Remove existing role if any
        DELETE FROM public.user_roles WHERE user_id = admin_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (admin_user_id, 'admin');
    END IF;
END;
$$;

-- Update the handle_new_user function to check for admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  
  -- Assign role based on email
  IF NEW.email = 'shc302@g.harvard.edu' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Run the function to assign admin role if user already exists
SELECT public.assign_admin_role();