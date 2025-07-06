import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  Share, 
  BookOpen,
  Shield,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { toast } = useToast();
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "strategy" });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Post Shared Successfully!",
      description: "Your protection strategy has been shared with the community.",
    });
    setNewPost({ title: "", content: "", category: "strategy" });
  };

  const expertAdvice = [
    {
      expert: "Sarah Chen",
      role: "IP Attorney",
      advice: "Always register your copyrights before sharing work online. It strengthens your legal position significantly.",
      likes: 124,
      category: "Legal"
    },
    {
      expert: "Marcus Rodriguez",
      role: "Digital Artist",
      advice: "Use watermarks strategically - visible enough to deter theft but subtle enough not to ruin the aesthetic.",
      likes: 89,
      category: "Technical"
    },
    {
      expert: "Dr. Emily Watson",
      role: "Art Technology Expert",
      advice: "Blockchain-based certificates are becoming the gold standard for proving authenticity and ownership.",
      likes: 156,
      category: "Innovation"
    }
  ];

  const communityPosts = [
    {
      author: "Alex Kim",
      title: "How I Caught Someone Selling My Art on Etsy",
      content: "Used reverse image search and found my artwork being sold without permission. Here's the step-by-step process I used to get it taken down...",
      category: "Success Story",
      likes: 67,
      comments: 23,
      timeAgo: "2 hours ago"
    },
    {
      author: "Maria Santos",
      title: "Creating Effective Watermarks That Don't Ruin Your Art",
      content: "After losing several commissions to theft, I developed a watermarking system that's both protective and aesthetically pleasing...",
      category: "Strategy",
      likes: 91,
      comments: 34,
      timeAgo: "5 hours ago"
    },
    {
      author: "David Chen",
      title: "Legal Resources for Artists - Free Consultation Services",
      content: "Compiled a list of organizations offering free legal advice to artists dealing with IP theft. Updated for 2024...",
      category: "Resources",
      likes: 145,
      comments: 56,
      timeAgo: "1 day ago"
    }
  ];

  const stats = [
    { label: "Active Members", value: "12,450", icon: Users },
    { label: "Protection Strategies", value: "3,240", icon: Shield },
    { label: "Cases Resolved", value: "1,890", icon: TrendingUp },
    { label: "Expert Advisors", value: "89", icon: Star }
  ];

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
          {stats.map((stat, index) => {
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
            <Tabs defaultValue="share" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="share">Share Strategy</TabsTrigger>
                <TabsTrigger value="community">Community Posts</TabsTrigger>
                <TabsTrigger value="experts">Expert Advice</TabsTrigger>
              </TabsList>

              <TabsContent value="share" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Share Your Protection Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitPost} className="space-y-4">
                      <Input
                        placeholder="Title of your strategy or experience"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        required
                      />
                      <Textarea
                        placeholder="Share your protection strategy, success story, or ask for advice..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        rows={6}
                        required
                      />
                      <div className="flex gap-2">
                        <select
                          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        >
                          <option value="strategy">Protection Strategy</option>
                          <option value="success">Success Story</option>
                          <option value="question">Ask for Help</option>
                          <option value="resources">Resources</option>
                        </select>
                        <Button type="submit" className="ml-auto">
                          Share with Community
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="community" className="space-y-6">
                {communityPosts.map((post, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              by {post.author} • {post.timeAgo}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary">
                          <ThumbsUp className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments} comments
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary">
                          <Share className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="experts" className="space-y-6">
                {expertAdvice.map((expert, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{expert.expert.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{expert.expert}</h3>
                          <p className="text-sm text-muted-foreground">{expert.role}</p>
                        </div>
                        <Badge className="ml-auto">{expert.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                        "{expert.advice}"
                      </blockquote>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        {expert.likes} found this helpful
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Legal Resources
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Find Mentor
                </Button>
              </CardContent>
            </Card>

            {/* Featured Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Featured Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">IP Protection Checklist</h4>
                  <p className="text-sm text-muted-foreground">
                    Essential steps every artist should take
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Copyright Registration Guide</h4>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step legal protection process
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Watermarking Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Protect without compromising aesthetics
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Sarah Chen", "Marcus Rodriguez", "Dr. Emily Watson"].map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{name}</span>
                    <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;