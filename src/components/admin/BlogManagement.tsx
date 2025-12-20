import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Send, Twitter, Eye, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  social_media_posted: boolean;
  twitter_post_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const BlogManagement = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft",
    tags: ""
  });

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          content: data.content,
          excerpt: data.excerpt || null,
          status: data.status,
          author_id: user.user.id,
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          published_at: data.status === 'published' ? new Date().toISOString() : null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Blog post created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || null,
          status: data.status,
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          published_at: data.status === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setEditingPost(null);
      resetForm();
      toast.success("Blog post updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update post: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success("Blog post deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    }
  });

  const postToTwitterMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      const blogUrl = `${window.location.origin}/blog/${post.slug}`;
      
      const { data, error } = await supabase.functions.invoke('post-to-twitter', {
        body: {
          title: post.title,
          excerpt: post.excerpt,
          url: blogUrl,
          blogPostId: post.id
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success("Posted to Twitter successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to post to Twitter: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
      tags: ""
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      status: post.status,
      tags: post.tags?.join(', ') || ""
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Create and manage blog posts with social media integration</p>
        </div>
        <Dialog open={isCreateOpen || !!editingPost} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingPost(null);
            resetForm();
          } else {
            setIsCreateOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update your blog post' : 'Create a new blog post and optionally share it on social media'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary for social media"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog post content..."
                  rows={10}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="art, copyright, protection"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4 text-sm">No blog posts yet</p>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          blogPosts?.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-sm font-medium line-clamp-1 flex items-center gap-1">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 flex-wrap">
                      {getStatusBadge(post.status)}
                      {post.social_media_posted && (
                        <Badge variant="outline" className="text-blue-500 border-blue-500 text-xs px-1 py-0">
                          <Twitter className="h-2.5 w-2.5 mr-0.5" />
                          Posted
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex-1">
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="p-3 pt-0 flex gap-1 flex-wrap border-t mt-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEdit(post)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                      deleteMutation.mutate(post.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                {post.status === 'published' && !post.social_media_posted && (
                  <Button
                    size="sm"
                    className="h-7 text-xs ml-auto"
                    onClick={() => postToTwitterMutation.mutate(post)}
                    disabled={postToTwitterMutation.isPending}
                  >
                    {postToTwitterMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Post to X
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
