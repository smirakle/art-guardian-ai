-- Update community tables to allow public access

-- Drop existing policies for community_posts
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;  
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

-- Create new public policies for community_posts
CREATE POLICY "Anyone can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create community posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update community posts" 
ON public.community_posts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete community posts" 
ON public.community_posts 
FOR DELETE 
USING (true);

-- Drop existing policies for community_comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.community_comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.community_comments;

-- Create new public policies for community_comments
CREATE POLICY "Anyone can view community comments" 
ON public.community_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create community comments" 
ON public.community_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update community comments" 
ON public.community_comments 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete community comments" 
ON public.community_comments 
FOR DELETE 
USING (true);

-- Drop existing policies for community_votes
DROP POLICY IF EXISTS "Authenticated users can create votes" ON public.community_votes;
DROP POLICY IF EXISTS "Authenticated users can view votes" ON public.community_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.community_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.community_votes;

-- Create new public policies for community_votes
CREATE POLICY "Anyone can view community votes" 
ON public.community_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create community votes" 
ON public.community_votes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update community votes" 
ON public.community_votes 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete community votes" 
ON public.community_votes 
FOR DELETE 
USING (true);

-- Make user_id nullable for anonymous posting
ALTER TABLE public.community_posts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.community_comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.community_votes ALTER COLUMN user_id DROP NOT NULL;