import React from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  FileText,
  Loader2
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

// Fallback hardcoded posts
const fallbackPosts: BlogPost[] = [
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

const getIconForCategory = (category: string): React.ElementType => {
  switch (category?.toLowerCase()) {
    case 'protection': return Shield;
    case 'ai': return Bot;
    case 'legal': return Gavel;
    default: return FileText;
  }
};

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  // Fetch blog posts from database
  const { data: dbPosts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Transform database posts to match BlogPost interface
  const blogPosts: BlogPost[] = dbPosts && dbPosts.length > 0 
    ? dbPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        category: post.tags?.[0] || 'General',
        readTime: '5 min read',
        date: post.published_at || post.created_at,
        icon: getIconForCategory(post.tags?.[0] || ''),
        featured: false
      }))
    : fallbackPosts;

  const categories = [
    { name: "All", count: blogPosts.length },
    { name: "Protection", count: blogPosts.filter(p => p.category === "Protection").length },
    { name: "AI", count: blogPosts.filter(p => p.category === "AI").length },
    { name: "Legal", count: blogPosts.filter(p => p.category === "Legal").length },
    { name: "Tutorials", count: blogPosts.filter(p => p.category === "Tutorials").length }
  ];

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured).slice(0, 2);

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

      <div className="min-h-screen bg-background">
        {/* ── Hero ── */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_60%,hsl(var(--accent)/0.05),transparent)]" />
          </div>
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Blog</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight leading-[1.1]">
                Insights for<br />
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">creative professionals</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Expert guides on art protection, AI training rights, DMCA enforcement, and the future of digital copyright.
              </p>
            </div>
          </div>
        </section>

        {/* ── Category Filter ── */}
        <section className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-md z-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide">
              {categories.filter(c => c.count > 0 || c.name === 'All').map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.name
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {category.name}
                  <span className={`ml-1.5 text-xs ${selectedCategory === category.name ? 'text-background/60' : 'text-muted-foreground/50'}`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Posts (Hero Cards) ── */}
        {selectedCategory === 'All' && featuredPosts.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPosts.map((post, i) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                    <div className={`relative rounded-2xl overflow-hidden h-full transition-all duration-500 hover:-translate-y-1 ${
                      i === 0
                        ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20'
                        : 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20'
                    }`}>
                      <div className="p-8 lg:p-10 flex flex-col h-full min-h-[280px]">
                        <div className="flex items-center gap-3 mb-6">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            i === 0 ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
                          }`}>
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight flex-1">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-primary">
                          Read article
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── All Posts Grid ── */}
        <section className={`${selectedCategory === 'All' && featuredPosts.length > 0 ? 'pb-20' : 'py-16'}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            {selectedCategory === 'All' && featuredPosts.length > 0 && (
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">All Articles</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No articles yet</h3>
                <p className="text-sm text-muted-foreground">Check back soon for new content in this category.</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border/30">
                {filteredPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="group block">
                    <article className="flex items-start gap-6 py-8 hover:bg-muted/20 -mx-4 px-4 rounded-xl transition-colors duration-300">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <post.icon className="h-5 w-5 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-2xl">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Read time + Arrow */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0 pt-2">
                        <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Newsletter CTA ── */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="relative rounded-3xl overflow-hidden bg-foreground text-background">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_-20%,hsl(var(--primary)/0.25),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,hsl(var(--accent)/0.1),transparent)]" />
              <div className="relative px-10 py-16 md:px-16 md:py-20 text-center">
                <Lightbulb className="h-8 w-8 mx-auto mb-6 text-secondary" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-background">
                  Stay ahead of art theft
                </h2>
                <p className="text-background/60 mb-8 max-w-lg mx-auto leading-relaxed">
                  Get the latest tips on protecting your art, legal updates, and industry news.
                </p>
                <Button size="lg" className="h-13 px-10 rounded-xl bg-background text-foreground hover:bg-background/90 font-bold shadow-xl" asChild>
                  <Link to="/upload">Start Protecting Your Art →</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
