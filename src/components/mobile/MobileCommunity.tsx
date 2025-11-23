import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Users, 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  Share, 
  BookOpen,
  Shield,
  TrendingUp,
  Heart,
  Clock,
  GraduationCap,
  Plus,
  Send,
  Smartphone,
  ChevronDown
} from "lucide-react";
import { useCommunity } from "@/hooks/useCommunity";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const MobileCommunity = () => {
  const { posts, expertAdvice, loading, createPost, toggleLike, getStats } = useCommunity();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "strategy" });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const stats = getStats();

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPost(true);
    const success = await createPost(newPost.title, newPost.content, newPost.category);
    if (success) {
      setNewPost({ title: "", content: "", category: "strategy" });
      setShowCreateForm(false);
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community",
      });
    }
    setIsCreatingPost(false);
  };

  const quickTips = [
    {
      title: "Register Your Copyright",
      description: "Official registration provides the strongest legal protection",
      icon: Shield
    },
    {
      title: "Watermark Your Work",
      description: "Add visible or invisible watermarks to deter theft",
      icon: BookOpen
    },
    {
      title: "Monitor Regularly",
      description: "Set up alerts to catch unauthorized use early",
      icon: TrendingUp
    },
    {
      title: "Document Everything",
      description: "Keep detailed records of your creative process",
      icon: Star
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5" />
            TSMO Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Community Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-primary">{stats.posts}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-primary">{stats.experts}</div>
              <div className="text-xs text-muted-foreground">Experts</div>
            </div>
          </div>

          {/* Create Post Button */}
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full mb-4"
            variant={showCreateForm ? "secondary" : "default"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? "Cancel" : "Create Post"}
          </Button>

          {/* Create Post Form */}
          {showCreateForm && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <form onSubmit={handleSubmitPost} className="space-y-3">
                  <Input
                    placeholder="Post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Share your thoughts, questions, or experiences..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isCreatingPost}
                      size="sm"
                      className="flex-1"
                    >
                      {isCreatingPost ? (
                        <>
                          <div className="w-3 h-3 mr-2 border border-current border-t-transparent rounded-full animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
          <TabsTrigger value="experts" className="text-xs">Experts</TabsTrigger>
          <TabsTrigger value="tips" className="text-xs">Quick Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-3 mt-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            posts.slice(0, 10).map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {post.user_id ? (post.profiles?.full_name || post.profiles?.username || 'User') : 'Anonymous'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium mb-1 line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-3">{post.content}</p>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className="h-6 px-2"
                          >
                            <Heart className={`w-3 h-3 mr-1 ${post.user_liked ? 'fill-current text-red-500' : ''}`} />
                            <span className="text-xs">{post.likes_count}</span>
                          </Button>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            {post.comments_count}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Liked By Section */}
                      {post.liked_by && post.liked_by.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
                            <ThumbsUp className="w-3 h-3" />
                            <span>Liked by {post.liked_by.length} {post.liked_by.length === 1 ? 'person' : 'people'}</span>
                            <ChevronDown className="w-3 h-3" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 mb-2">
                            {post.liked_by.slice(0, 5).map((like) => (
                              <div key={like.user_id} className="flex items-center gap-2 text-xs">
                                <Avatar className="w-4 h-4">
                                  <AvatarFallback className="text-[8px]">
                                    {like.full_name?.[0] || like.username?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-muted-foreground">
                                  {like.full_name || like.username || 'User'}
                                </span>
                              </div>
                            ))}
                            {post.liked_by.length > 5 && (
                              <div className="text-xs text-muted-foreground pl-6">
                                +{post.liked_by.length - 5} more
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Comments Section */}
                      {post.comments && post.comments.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                            <MessageSquare className="w-3 h-3" />
                            <span>View {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                            <ChevronDown className="w-3 h-3" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2 pt-2 border-t">
                            {post.comments.slice(0, 3).map((comment) => (
                              <div key={comment.id} className="flex items-start gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-[8px]">
                                    {comment.full_name?.[0] || comment.username?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">
                                      {comment.full_name || comment.username || 'User'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            {post.comments.length > 3 && (
                              <div className="text-xs text-muted-foreground pl-7">
                                +{post.comments.length - 3} more comments
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="experts" className="space-y-3 mt-4">
          {expertAdvice.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No expert advice available yet</p>
              </CardContent>
            </Card>
          ) : (
            expertAdvice.slice(0, 5).map((advice) => (
              <Card key={advice.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {advice.expert_profiles?.expert_name || 'Expert'}
                        </span>
                        {advice.expert_profiles?.is_verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {advice.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-4">
                        {advice.advice}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span className="text-xs">{advice.likes_count}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(advice.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tips" className="space-y-3 mt-4">
          {quickTips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">{tip.title}</h3>
                      <p className="text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};