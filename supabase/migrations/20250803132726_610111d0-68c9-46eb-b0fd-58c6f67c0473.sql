-- Update community posts RLS policy to allow public viewing
DROP POLICY IF EXISTS "Authenticated users can view posts" ON community_posts;

-- Create new policy that explicitly allows public access to view posts
CREATE POLICY "Anyone can view community posts" 
ON community_posts 
FOR SELECT 
USING (true);