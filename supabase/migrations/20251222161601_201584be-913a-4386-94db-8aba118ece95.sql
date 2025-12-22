-- Allow anonymous newsletter subscribers by making user_id nullable
ALTER TABLE public.email_subscribers ALTER COLUMN user_id DROP NOT NULL;