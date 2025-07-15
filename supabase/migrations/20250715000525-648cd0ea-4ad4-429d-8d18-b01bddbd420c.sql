-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'strategy',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community votes table (for likes)
CREATE TABLE public.community_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NULL,
  comment_id UUID NULL,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Create expert profiles table
CREATE TABLE public.expert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  expert_name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  total_likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expert advice table
CREATE TABLE public.expert_advice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL,
  advice TEXT NOT NULL,
  category TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_advice ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
CREATE POLICY "Anyone can view posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for community_comments
CREATE POLICY "Anyone can view comments" 
ON public.community_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.community_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.community_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.community_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for community_votes
CREATE POLICY "Users can view all votes" 
ON public.community_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create votes" 
ON public.community_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.community_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.community_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for expert_profiles
CREATE POLICY "Anyone can view expert profiles" 
ON public.expert_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their expert profile" 
ON public.expert_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expert profile" 
ON public.expert_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all expert profiles" 
ON public.expert_profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for expert_advice
CREATE POLICY "Anyone can view expert advice" 
ON public.expert_advice 
FOR SELECT 
USING (true);

CREATE POLICY "Experts can create advice" 
ON public.expert_advice 
FOR INSERT 
WITH CHECK (
  expert_id IN (
    SELECT id FROM public.expert_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Experts can update their own advice" 
ON public.expert_advice 
FOR UPDATE 
USING (
  expert_id IN (
    SELECT id FROM public.expert_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all expert advice" 
ON public.expert_advice 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add foreign key constraints
ALTER TABLE public.community_comments 
ADD CONSTRAINT fk_comments_post_id 
FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

ALTER TABLE public.community_votes 
ADD CONSTRAINT fk_votes_post_id 
FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

ALTER TABLE public.community_votes 
ADD CONSTRAINT fk_votes_comment_id 
FOREIGN KEY (comment_id) REFERENCES public.community_comments(id) ON DELETE CASCADE;

ALTER TABLE public.expert_advice 
ADD CONSTRAINT fk_advice_expert_id 
FOREIGN KEY (expert_id) REFERENCES public.expert_profiles(id) ON DELETE CASCADE;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_profiles_updated_at
BEFORE UPDATE ON public.expert_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_advice_updated_at
BEFORE UPDATE ON public.expert_advice
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions to update counts
CREATE OR REPLACE FUNCTION update_post_counts()
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_vote_counts()
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
$$ LANGUAGE plpgsql;

-- Create triggers for automatic count updates
CREATE TRIGGER trigger_update_post_counts
AFTER INSERT OR DELETE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON public.community_votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_counts();