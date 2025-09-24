-- CRITICAL SECURITY FIXES - Phase 1: Data Exposure and Authentication

-- 1. Fix overly permissive community table policies
-- Drop existing overly permissive policies for community_posts
DROP POLICY IF EXISTS "Anyone can create community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can delete community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can update community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;

-- Create secure policies for community_posts
CREATE POLICY "Authenticated users can view community posts" 
ON public.community_posts FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create their own community posts" 
ON public.community_posts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community posts" 
ON public.community_posts FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts" 
ON public.community_posts FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Fix overly permissive community votes policies
DROP POLICY IF EXISTS "Anyone can create community votes" ON public.community_votes;
DROP POLICY IF EXISTS "Anyone can delete community votes" ON public.community_votes;
DROP POLICY IF EXISTS "Anyone can update community votes" ON public.community_votes;
DROP POLICY IF EXISTS "Anyone can view community votes" ON public.community_votes;

-- Create secure policies for community_votes
CREATE POLICY "Authenticated users can view community votes" 
ON public.community_votes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create their own community votes" 
ON public.community_votes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community votes" 
ON public.community_votes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community votes" 
ON public.community_votes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Fix overly permissive community comments policies
DROP POLICY IF EXISTS "Anyone can create community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Anyone can delete community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Anyone can update community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Anyone can view community comments" ON public.community_comments;

-- Create secure policies for community_comments
CREATE POLICY "Authenticated users can view community comments" 
ON public.community_comments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create their own community comments" 
ON public.community_comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community comments" 
ON public.community_comments FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community comments" 
ON public.community_comments FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Secure partner pricing tiers table - restrict to authenticated users only
CREATE POLICY "Authenticated users can view partner pricing tiers" 
ON public.partner_pricing_tiers FOR SELECT 
TO authenticated 
USING (true);

-- 5. Secure industry verticals table - restrict to authenticated users
CREATE POLICY "Authenticated users can view industry verticals" 
ON public.industry_verticals FOR SELECT 
TO authenticated 
USING (true);

-- 6. Make user_id columns NOT NULL where they should be (data integrity)
ALTER TABLE public.community_posts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.community_votes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.community_comments ALTER COLUMN user_id SET NOT NULL;

-- 7. Fix database functions missing search_path security
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update comments count
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes count for posts
  IF NEW.post_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.vote_type = 'like' AND NEW.vote_type != 'like' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count - 1 
        WHERE id = NEW.post_id;
      ELSIF OLD.vote_type != 'like' AND NEW.vote_type = 'like' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
      END IF;
    END IF;
  END IF;
  
  -- Update likes count for expert advice
  IF TG_OP = 'INSERT' AND NEW.vote_type = 'like' THEN
    UPDATE public.expert_advice 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.vote_type = 'like' THEN
    UPDATE public.expert_advice 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;