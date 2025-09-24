-- CRITICAL SECURITY FIXES - Phase 1: Remaining Issues

-- 1. First, check and clean up existing policies, then create secure ones
-- Check if policies exist and drop them properly
DO $$
BEGIN
    -- Drop existing overly permissive policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Anyone can create community posts') THEN
        DROP POLICY "Anyone can create community posts" ON public.community_posts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Anyone can delete community posts') THEN
        DROP POLICY "Anyone can delete community posts" ON public.community_posts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Anyone can update community posts') THEN
        DROP POLICY "Anyone can update community posts" ON public.community_posts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Anyone can view community posts') THEN
        DROP POLICY "Anyone can view community posts" ON public.community_posts;
    END IF;
END $$;

-- Create secure policies for community_posts if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Users can create their own community posts') THEN
        CREATE POLICY "Users can create their own community posts" 
        ON public.community_posts FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Users can update their own community posts') THEN
        CREATE POLICY "Users can update their own community posts" 
        ON public.community_posts FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Users can delete their own community posts') THEN
        CREATE POLICY "Users can delete their own community posts" 
        ON public.community_posts FOR DELETE 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Secure community votes
DO $$
BEGIN
    -- Drop overly permissive policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Anyone can create community votes') THEN
        DROP POLICY "Anyone can create community votes" ON public.community_votes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Anyone can delete community votes') THEN
        DROP POLICY "Anyone can delete community votes" ON public.community_votes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Anyone can update community votes') THEN
        DROP POLICY "Anyone can update community votes" ON public.community_votes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Anyone can view community votes') THEN
        DROP POLICY "Anyone can view community votes" ON public.community_votes;
    END IF;

    -- Create secure policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Authenticated users can view community votes') THEN
        CREATE POLICY "Authenticated users can view community votes" 
        ON public.community_votes FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Users can create their own community votes') THEN
        CREATE POLICY "Users can create their own community votes" 
        ON public.community_votes FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Users can update their own community votes') THEN
        CREATE POLICY "Users can update their own community votes" 
        ON public.community_votes FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'Users can delete their own community votes') THEN
        CREATE POLICY "Users can delete their own community votes" 
        ON public.community_votes FOR DELETE 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Secure community comments
DO $$
BEGIN
    -- Drop overly permissive policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Anyone can create community comments') THEN
        DROP POLICY "Anyone can create community comments" ON public.community_comments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Anyone can delete community comments') THEN
        DROP POLICY "Anyone can delete community comments" ON public.community_comments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Anyone can update community comments') THEN
        DROP POLICY "Anyone can update community comments" ON public.community_comments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Anyone can view community comments') THEN
        DROP POLICY "Anyone can view community comments" ON public.community_comments;
    END IF;

    -- Create secure policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Authenticated users can view community comments') THEN
        CREATE POLICY "Authenticated users can view community comments" 
        ON public.community_comments FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Users can create their own community comments') THEN
        CREATE POLICY "Users can create their own community comments" 
        ON public.community_comments FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Users can update their own community comments') THEN
        CREATE POLICY "Users can update their own community comments" 
        ON public.community_comments FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_comments' AND policyname = 'Users can delete their own community comments') THEN
        CREATE POLICY "Users can delete their own community comments" 
        ON public.community_comments FOR DELETE 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;
END $$;