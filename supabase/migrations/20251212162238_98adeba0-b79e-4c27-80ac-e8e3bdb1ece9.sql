-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;

-- Create a new policy that allows anyone (including anonymous users) to view posts
CREATE POLICY "Anyone can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (true);