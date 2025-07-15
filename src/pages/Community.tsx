import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  Share, 
  BookOpen,
  Shield,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Scale,
  FileText,
  Gavel,
  Heart,
  Clock
} from "lucide-react";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Community = () => {
  const { user } = useAuth();
  const { posts, expertAdvice, loading, createPost, toggleLike, getStats } = useCommunity();
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "strategy" });
  const [activeTab, setActiveTab] = useState("community");

  const stats = getStats();

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createPost(newPost.title, newPost.content, newPost.category);
    if (success) {
      setNewPost({ title: "", content: "", category: "strategy" });
    }
  };

  const legalResources = [
    {
      category: "Copyright Registration",
      icon: FileText,
      resources: [
        {
          title: "U.S. Copyright Office",
          description: "Official copyright registration and information",
          url: "https://www.copyright.gov/"
        },
        {
          title: "Library of Congress Copyright Basics",
          description: "Comprehensive guide to copyright fundamentals",
          url: "https://www.copyright.gov/what-is-copyright/"
        },
        {
          title: "Creative Commons",
          description: "Flexible copyright licenses for creators",
          url: "https://creativecommons.org/"
        }
      ]
    },
    {
      category: "Legal Aid & Pro Bono",
      icon: Scale,
      resources: [
        {
          title: "Volunteer Lawyers for the Arts",
          description: "Free and low-cost legal services for artists",
          url: "https://www.vlany.org/"
        },
        {
          title: "Arts Law Centre",
          description: "Legal information and assistance for artists",
          url: "https://www.artslaw.com.au/"
        },
        {
          title: "California Lawyers for the Arts",
          description: "Legal assistance for creative professionals",
          url: "https://calawyersforthearts.org/"
        }
      ]
    },
    {
      category: "Templates & Forms",
      icon: BookOpen,
      resources: [
        {
          title: "Artist Commission Contract Template",
          description: "Comprehensive contract template for commissioned artwork",
          url: "https://www.lawdepot.com/contracts/commission-agreement/"
        },
        {
          title: "DMCA Takedown Notice Template",
          description: "Official DMCA takedown request template",
          url: "https://www.copyright.gov/legislation/dmca.pdf"
        },
        {
          title: "Cease and Desist Letter Generator",
          description: "Step-by-step tool to create professional letters",
          url: "https://www.lawdepot.com/contracts/cease-and-desist-letter/"
        }
      ]
    }
  ];

  const displayStats = [
    { label: "Community Posts", value: stats.posts.toString(), icon: MessageSquare },
    { label: "Total Likes", value: stats.likes.toString(), icon: Heart },
    { label: "Comments", value: stats.comments.toString(), icon: MessageSquare },
    { label: "Expert Advisors", value: stats.experts.toString(), icon: Star }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Artist Protection Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow artists, share protection strategies, and learn from IP experts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="community">Community Posts</TabsTrigger>
                <TabsTrigger value="share">Share Strategy</TabsTrigger>
                <TabsTrigger value="experts">Expert Advice</TabsTrigger>
                <TabsTrigger value="legal">Legal Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="space-y-6">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share your protection strategy with the community!
                      </p>
                      <Button onClick={() => setActiveTab("share")}>
                        Create First Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{post.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {post.profiles?.full_name || post.profiles?.username || 'Anonymous'} • {' '}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button 
                            className={`flex items-center gap-1 hover:text-primary transition-colors ${
                              post.user_liked ? 'text-red-500' : ''
                            }`}
                            onClick={() => toggleLike(post.id)}
                            disabled={!user}
                          >
                            <ThumbsUp className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                            {post.likes_count}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments_count} comments
                          </span>
                          <button className="flex items-center gap-1 hover:text-primary">
                            <Share className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="share" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Share Your Protection Strategy
                    </CardTitle>
                    {!user && (
                      <p className="text-sm text-muted-foreground">
                        You need to be logged in to share posts with the community.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitPost} className="space-y-4">
                      <Input
                        placeholder="Title of your strategy or experience"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        required
                        disabled={!user}
                      />
                      <Textarea
                        placeholder="Share your protection strategy, success story, or ask for advice..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        rows={6}
                        required
                        disabled={!user}
                      />
                      <div className="flex gap-2">
                        <select
                          className="px-3 py-2 border border-input rounded-md bg-background text-sm disabled:opacity-50"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          disabled={!user}
                        >
                          <option value="strategy">Protection Strategy</option>
                          <option value="success">Success Story</option>
                          <option value="question">Ask for Help</option>
                          <option value="resources">Resources</option>
                        </select>
                        <Button type="submit" className="ml-auto" disabled={!user}>
                          Share with Community
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experts" className="space-y-6">
                {expertAdvice.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No expert advice yet</h3>
                      <p className="text-muted-foreground">
                        Expert advice will appear here as our community grows.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  expertAdvice.map((advice) => (
                    <Card key={advice.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {advice.expert_profiles?.expert_name?.[0] || 'E'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {advice.expert_profiles?.expert_name || 'Expert'}
                              {advice.expert_profiles?.is_verified && (
                                <Star className="w-4 h-4 inline ml-1 text-yellow-500" />
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {advice.expert_profiles?.role || 'Expert'}
                            </p>
                          </div>
                          <Badge className="ml-auto">{advice.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                          "{advice.advice}"
                        </blockquote>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ThumbsUp className="w-4 h-4" />
                          {advice.likes_count} found this helpful
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="legal" className="space-y-6">
                {legalResources.map((category, categoryIndex) => {
                  const Icon = category.icon;
                  return (
                    <Card key={categoryIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          {category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {category.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{resource.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(resource.url, '_blank')}
                                className="text-xs"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Visit Resource
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report IP Theft
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("legal")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Legal Resources
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("share")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Share Strategy
                </Button>
              </CardContent>
            </Card>

            {/* Featured Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Featured Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                     onClick={() => window.open('https://www.copyright.gov/help/faq/faq-general.html', '_blank')}>
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    IP Protection Checklist
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Essential steps every artist should take
                  </p>
                </div>
                <div className="border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                     onClick={() => window.open('https://www.copyright.gov/registration/', '_blank')}>
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    Copyright Registration
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step legal protection process
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            {posts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {posts
                    .slice(0, 3)
                    .map((post, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                        </span>
                        <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;