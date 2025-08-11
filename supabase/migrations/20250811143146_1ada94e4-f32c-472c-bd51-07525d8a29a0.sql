-- Clean up duplicate policies and fix the OAuth flow
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can insert their tokens" ON public.user_integrations;

-- Update system policies to allow service role access
DROP POLICY IF EXISTS "System can manage oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "System can manage user integrations" ON public.user_integrations;

-- Create comprehensive system policies for OAuth flow
CREATE POLICY "System can manage oauth states" 
ON public.oauth_states 
FOR ALL 
TO authenticated, anon, service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "System can manage user integrations" 
ON public.user_integrations 
FOR ALL 
TO authenticated, anon, service_role
USING (true)
WITH CHECK (true);