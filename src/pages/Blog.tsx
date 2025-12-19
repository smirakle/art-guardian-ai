import React from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight,
  Shield,
  Gavel,
  Bot,
  Lightbulb,
  TrendingUp,
  FileText
} from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  icon: React.ElementType;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    slug: "how-to-find-if-your-art-is-being-stolen-online",
    title: "How to Find If Your Art Is Being Stolen Online",
    excerpt: "A step-by-step guide to discovering unauthorized use of your artwork across the internet, including tools and techniques professional artists use.",
    category: "Protection",
    readTime: "8 min read",
    date: "2025-12-15",
    icon: Shield,
    featured: true
  },
  {
    slug: "ai-training-what-artists-need-to-know-2025",
    title: "AI Training: What Artists Need to Know in 2025",
    excerpt: "Understanding how AI models use your art, your legal rights, and practical steps to protect your work from unauthorized AI training.",
    category: "AI",
    readTime: "12 min read",
    date: "2025-12-10",
    icon: Bot,
    featured: true
  },
  {
    slug: "dmca-takedown-guide-for-digital-artists",
    title: "DMCA Takedown Guide for Digital Artists",
    excerpt: "Everything you need to know about filing effective DMCA takedown notices, from templates to follow-up strategies.",
    category: "Legal",
    readTime: "10 min read",
    date: "2025-12-05",
    icon: Gavel
  }
];

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Protection", count: blogPosts.filter(p => p.category === "Protection").length },
  { name: "AI", count: blogPosts.filter(p => p.category === "AI").length },
  { name: "Legal", count: blogPosts.filter(p => p.category === "Legal").length },
  { name: "Tutorials", count: 0 }
];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "TSMO Blog",
    "description": "Expert guides on protecting your art online, understanding AI training, and enforcing your copyright.",
    "url": "https://tsmo.lovable.app/blog",
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "url": `https://tsmo.lovable.app/blog/${post.slug}`
    }))
  };

  return (
    <>
      <Helmet>
        <title>TSMO Blog | Art Protection Guides, AI Training, and Copyright Tips</title>
        <meta name="description" content="Expert guides on protecting your art online, understanding AI training, DMCA takedowns, and enforcing your copyright as a digital artist." />
        <meta name="keywords" content="art protection blog, DMCA guide, AI training artists, copyright for artists, digital art theft" />
        <link rel="canonical" href="https://tsmo.lovable.app/blog" />
        <meta property="og:title" content="TSMO Blog | Art Protection Guides" />
        <meta property="og:description" content="Expert guides on protecting your art online and enforcing your copyright." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">TSMO Blog</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Protect Your Creative Work
              </h1>
              <p className="text-xl text-muted-foreground">
                Expert guides on art protection, AI training, DMCA takedowns, and copyright enforcement.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Featured Articles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                        <div className="mt-4 flex items-center text-primary font-medium">
                          Read article <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter & Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* All Posts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <post.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="px-2 py-1 rounded-full bg-muted text-xs">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                        <span className="text-primary font-medium flex items-center">
                          Read <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles yet</h3>
                <p className="text-muted-foreground">Check back soon for new content in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <Lightbulb className="h-10 w-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-4">Stay Informed</h2>
            <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
              Get the latest tips on protecting your art, legal updates, and industry news delivered to your inbox.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/upload">Start Protecting Your Art</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
