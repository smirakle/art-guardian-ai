-- Fix critical OAuth security vulnerability: Remove public access to oauth_states
-- The oauth_states table currently allows anonymous access which is a security risk

-- Drop the dangerous policy that allows anon access
DROP POLICY IF EXISTS "System can manage oauth states" ON public.oauth_states;

-- Create secure policies that only allow proper access patterns
-- 1. Service role can manage all states (for the OAuth handler function)
CREATE POLICY "Service role can manage oauth states" 
ON public.oauth_states 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Authenticated users can only create their own states
CREATE POLICY "Users can create their own oauth states" 
ON public.oauth_states 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Authenticated users can only read their own unexpired, unused states
CREATE POLICY "Users can read their own oauth states" 
ON public.oauth_states 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND expires_at > now() AND used = false);

-- 4. Users can update their own states (to mark as used)
CREATE POLICY "Users can update their own oauth states" 
ON public.oauth_states 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Allow cleanup of expired states
CREATE POLICY "System can delete expired oauth states" 
ON public.oauth_states 
FOR DELETE 
TO service_role
USING (expires_at <= now() OR used = true);