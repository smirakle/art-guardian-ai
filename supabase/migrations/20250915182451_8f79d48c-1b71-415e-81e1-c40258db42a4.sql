-- Reset the admin user password directly using Supabase auth admin functions
-- Update the specific admin user with a known password hash

-- First, let's ensure the user exists and is confirmed
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  email_confirm_token = null,
  recovery_token = null,
  recovery_sent_at = null,
  updated_at = now()
WHERE email = 'shc302@g.harvard.edu';

-- Now reset the password using auth.users update
-- This sets the password to 'TradeMark2024!' with proper encryption
UPDATE auth.users 
SET 
  encrypted_password = crypt('TradeMark2024!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'shc302@g.harvard.edu';