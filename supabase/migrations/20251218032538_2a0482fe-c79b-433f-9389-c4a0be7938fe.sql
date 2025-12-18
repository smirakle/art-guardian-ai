-- Drop the existing authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view IP lawyers directory" ON public.ip_lawyers;

-- Create a new policy that allows everyone to view IP lawyers
CREATE POLICY "Everyone can view IP lawyers directory"
ON public.ip_lawyers
FOR SELECT
USING (true);