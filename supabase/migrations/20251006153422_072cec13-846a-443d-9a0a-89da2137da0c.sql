-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Community posts viewable by authenticated users only" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can view community votes" ON public.community_votes;
DROP POLICY IF EXISTS "Community votes viewable by authenticated users only" ON public.community_votes;
DROP POLICY IF EXISTS "Authenticated users can view community comments" ON public.community_comments;

-- Create public SELECT policies for community_posts
CREATE POLICY "Anyone can view community posts"
  ON public.community_posts FOR SELECT
  USING (true);

-- Create public SELECT policies for community_votes
CREATE POLICY "Anyone can view community votes"
  ON public.community_votes FOR SELECT
  USING (true);

-- Create public SELECT policies for community_comments
CREATE POLICY "Anyone can view community comments"
  ON public.community_comments FOR SELECT
  USING (true);

-- Create public SELECT policies for expert_advice
CREATE POLICY "Anyone can view expert advice"
  ON public.expert_advice FOR SELECT
  USING (true);

-- Create public SELECT policies for expert_profiles
CREATE POLICY "Anyone can view expert profiles"
  ON public.expert_profiles FOR SELECT
  USING (true);