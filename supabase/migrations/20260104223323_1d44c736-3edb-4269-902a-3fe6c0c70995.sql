-- Drop existing permissive policies on leads table
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Leads are publicly readable" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous inserts for lead capture" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous lead insertions" ON public.leads;

-- Create secure policies requiring authentication
CREATE POLICY "Authenticated users can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);