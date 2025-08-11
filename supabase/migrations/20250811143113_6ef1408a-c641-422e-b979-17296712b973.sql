-- Fix RLS policies to be less restrictive for OAuth flow
-- Drop the overly restrictive policies first
DROP POLICY IF EXISTS "System can manage oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "System can manage user integrations" ON public.user_integrations;

-- Create better policies for oauth_states
CREATE POLICY "System can manage oauth states" 
ON public.oauth_states 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create better policies for user_integrations  
CREATE POLICY "System can manage user integrations" 
ON public.user_integrations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Also add policies to allow users to see their own oauth states (for debugging)
CREATE POLICY "Users can view their oauth states" 
ON public.oauth_states 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their oauth states" 
ON public.oauth_states 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their oauth states" 
ON public.oauth_states 
FOR DELETE 
USING (auth.uid() = user_id);