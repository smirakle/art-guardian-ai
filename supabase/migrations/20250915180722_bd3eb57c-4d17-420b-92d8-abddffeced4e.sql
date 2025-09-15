-- Reset admin password directly using Supabase admin functions
-- This will set a known password for the admin user

-- First let's update the user to ensure email is confirmed
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  email_confirm_token = null,
  recovery_token = null,
  recovery_sent_at = null
WHERE email = 'shc302@g.harvard.edu';

-- Note: Password reset will be done via the edge function
-- The password will be set to 'TradeMark2024!' for the admin user