
-- Update subscription plan for shc302@g.harvard.edu to professional for advanced monitoring access
UPDATE public.subscriptions 
SET plan_id = 'professional'
WHERE user_id = 'a8743e75-d9b7-4b72-af64-e9c1c42f4236';
