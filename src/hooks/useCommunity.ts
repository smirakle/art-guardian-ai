import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
export interface CommunityPost {
  id: string;
  user_id: string | null;
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
  liked_by?: Array<{
    user_id: string;
    full_name?: string;
    username?: string;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    full_name?: string;
    username?: string;
  }>;
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
  const { user } = useAuth();
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

      // Get profiles for all posts (excluding null user_ids)
      const userIds = data?.map(post => post.user_id).filter(id => id !== null) || [];
      const { data: profilesData } = userIds.length > 0 ? await supabase
        .from('profiles')
        .select('user_id, full_name, username')
        .in('user_id', userIds) : { data: [] };

      // Get user likes if authenticated
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('community_votes')
          .select('post_id')
          .eq('user_id', user.id)
          .eq('vote_type', 'like');
        
        userLikes = likesData?.map(like => like.post_id) || [];
      }

      // Get all likes for posts with user profiles
      const postIds = data?.map(post => post.id) || [];
      const { data: allLikesData } = postIds.length > 0 ? await supabase
        .from('community_votes')
        .select('post_id, user_id')
        .in('post_id', postIds)
        .eq('vote_type', 'like') : { data: [] };

      const likeUserIds = allLikesData?.map(like => like.user_id).filter(id => id !== null) || [];
      const { data: likeProfilesData } = likeUserIds.length > 0 ? await supabase
        .from('profiles')
        .select('user_id, full_name, username')
        .in('user_id', likeUserIds) : { data: [] };

      // Get all comments for posts with user profiles
      const { data: commentsData } = postIds.length > 0 ? await supabase
        .from('community_comments')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: false }) : { data: [] };

      const commentUserIds = commentsData?.map(comment => comment.user_id).filter(id => id !== null) || [];
      const { data: commentProfilesData } = commentUserIds.length > 0 ? await supabase
        .from('profiles')
        .select('user_id, full_name, username')
        .in('user_id', commentUserIds) : { data: [] };

      const postsWithData = data?.map(post => {
        const profile = profilesData?.find(p => p.user_id === post.user_id);
        
        // Get likes for this post
        const postLikes = allLikesData?.filter(like => like.post_id === post.id) || [];
        const liked_by = postLikes.map(like => {
          const likeProfile = likeProfilesData?.find(p => p.user_id === like.user_id);
          return {
            user_id: like.user_id,
            full_name: likeProfile?.full_name,
            username: likeProfile?.username
          };
        });

        // Get comments for this post
        const postComments = commentsData?.filter(comment => comment.post_id === post.id) || [];
        const comments = postComments.map(comment => {
          const commentProfile = commentProfilesData?.find(p => p.user_id === comment.user_id);
          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user_id: comment.user_id,
            full_name: commentProfile?.full_name,
            username: commentProfile?.username
          };
        });

        return {
          ...post,
          profiles: profile ? {
            full_name: profile.full_name,
            username: profile.username
          } : undefined,
          user_liked: userLikes.includes(post.id),
          liked_by,
          comments
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
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({ title, content, category, user_id: user?.id || null })
        .select()
        .single();

      if (error) throw error;
      
      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in to Like",
        description: "Create an account to like posts and track your activity",
        variant: "default"
      });
      return;
    }

    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('community_votes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('vote_type', 'like')
        .single();

      if (existingLike) {
        // Unlike - delete the vote
        const { error } = await supabase
          .from('community_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('vote_type', 'like');

        if (error) throw error;
      } else {
        // Like - insert new vote
        const { error } = await supabase
          .from('community_votes')
          .insert({ post_id: postId, vote_type: 'like', user_id: user.id });

        if (error) throw error;
      }
      
      await fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to toggle like",
        variant: "destructive"
      });
    }
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