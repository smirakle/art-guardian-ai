import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
  };
  user_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
  };
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  expert_name: string;
  role: string;
  bio?: string;
  specialties?: string[];
  is_verified: boolean;
  total_likes: number;
}

export interface ExpertAdvice {
  id: string;
  expert_id: string;
  advice: string;
  category: string;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
  expert_profiles?: ExpertProfile;
}

export const useCommunity = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [expertAdvice, setExpertAdvice] = useState<ExpertAdvice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for all posts
      const userIds = data?.map(post => post.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, username')
        .in('user_id', userIds);

      // No user likes in demo mode
      let userLikes: string[] = [];

      const postsWithData = data?.map(post => {
        const profile = profilesData?.find(p => p.user_id === post.user_id);
        return {
          ...post,
          profiles: profile ? {
            full_name: profile.full_name,
            username: profile.username
          } : undefined,
          user_liked: userLikes.includes(post.id)
        };
      }) || [];

      setPosts(postsWithData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    }
  };

  const fetchExpertAdvice = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_advice')
        .select(`
          *,
          expert_profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpertAdvice(data || []);
    } catch (error) {
      console.error('Error fetching expert advice:', error);
      toast({
        title: "Error",
        description: "Failed to load expert advice",
        variant: "destructive"
      });
    }
  };

  const createPost = async (title: string, content: string, category: string) => {
    // Demo mode - show message that this is a demo
    toast({
      title: "Demo Mode",
      description: "This is a demo. Authentication required for posting in production.",
      variant: "destructive"
    });
    return false;
  };

  const toggleLike = async (postId: string) => {
    // Demo mode - show message that this is a demo
    toast({
      title: "Demo Mode",
      description: "This is a demo. Authentication required for liking in production.",
    });
  };

  const getStats = () => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments_count, 0);
    const expertCount = expertAdvice.length;

    return {
      posts: totalPosts,
      likes: totalLikes,
      comments: totalComments,
      experts: expertCount
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPosts(), fetchExpertAdvice()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const postsSubscription = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_posts' }, 
        () => fetchPosts()
      )
      .subscribe();

    const votesSubscription = supabase
      .channel('community_votes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_votes' }, 
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(votesSubscription);
    };
  }, []);

  return {
    posts,
    expertAdvice,
    loading,
    createPost,
    toggleLike,
    getStats,
    refetch: () => Promise.all([fetchPosts(), fetchExpertAdvice()])
  };
};