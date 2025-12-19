import React from "react";
import { Helmet } from "react-helmet";
import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Shield,
  Bot,
  Gavel,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  icon: React.ElementType;
}

const blogPostsData: Record<string, BlogPostData> = {
  "how-to-find-if-your-art-is-being-stolen-online": {
    slug: "how-to-find-if-your-art-is-being-stolen-online",
    title: "How to Find If Your Art Is Being Stolen Online",
    excerpt: "A step-by-step guide to discovering unauthorized use of your artwork across the internet.",
    category: "Protection",
    readTime: "8 min read",
    date: "2025-12-15",
    author: "TSMO Team",
    icon: Shield,
    content: `
## Why You Need to Monitor Your Art

As a digital artist, your work is constantly at risk. Studies show that **85% of stolen artwork goes undetected** by the original creator. This means thieves are profiting from your creativity without your knowledge.

## Step 1: Start with Google Reverse Image Search

The most basic (but limited) approach:

1. Go to [Google Images](https://images.google.com)
2. Click the camera icon
3. Upload your image or paste its URL
4. Review the results

**Limitation:** Google only indexes a fraction of the internet and misses many platforms where theft is common, like Instagram, TikTok, and print-on-demand sites.

## Step 2: Check Popular Print-on-Demand Sites

Art theft is rampant on POD platforms. Manually search:

- Redbubble
- Society6
- Teepublic
- Zazzle
- Amazon Merch

Search for keywords related to your art style or subject matter.

## Step 3: Use Specialized Tools Like TSMO

For comprehensive coverage, you need tools designed for artists:

- **Continuous monitoring** across 50+ platforms
- **AI-powered detection** that finds edited versions
- **Legal-ready documentation** for takedowns
- **One-click DMCA filing**

## Step 4: Set Up Google Alerts

Create alerts for:
- Your artist name
- Titles of popular works
- Unique phrases from your descriptions

## Step 5: Check AI Training Datasets

Your art may be in datasets like LAION-5B. Tools like [Have I Been Trained](https://haveibeentrained.com) can help, but TSMO provides more comprehensive monitoring.

## What to Do When You Find Theft

1. **Document everything** - screenshots with timestamps
2. **Gather evidence** of your original creation
3. **File a DMCA takedown** - TSMO can automate this
4. **Consider legal action** for repeat offenders

## Conclusion

Regular monitoring is essential for protecting your creative work. While manual methods help, automated tools like TSMO provide the comprehensive coverage artists need in today's digital landscape.
    `
  },
  "ai-training-what-artists-need-to-know-2025": {
    slug: "ai-training-what-artists-need-to-know-2025",
    title: "AI Training: What Artists Need to Know in 2025",
    excerpt: "Understanding how AI models use your art, your legal rights, and practical steps to protect your work.",
    category: "AI",
    readTime: "12 min read",
    date: "2025-12-10",
    author: "TSMO Team",
    icon: Bot,
    content: `
## The AI Training Problem

AI image generators like Midjourney, Stable Diffusion, and DALL-E are trained on billions of images scraped from the internet—often without artists' permission or compensation.

## How AI Companies Get Your Art

### Web Scraping
Automated bots crawl websites and download images. Major datasets include:

- **LAION-5B**: 5.8 billion image-text pairs
- **Common Crawl**: Petabytes of web data
- **Conceptual Captions**: 12M+ images

### What They Do With It
Your art teaches AI to:
- Replicate your unique style
- Generate "new" images that look like yours
- Allow users to create in "your style" with prompts

## Your Legal Rights

### Copyright Still Applies
Your art is protected by copyright the moment you create it. Using it for AI training without permission may constitute infringement.

### Ongoing Lawsuits
Artists like Sarah Andersen, Kelly McKernan, and Karla Ortiz are suing AI companies. The outcomes will shape the future of AI art.

### The Fair Use Debate
AI companies claim "fair use" but courts haven't definitively ruled. Your opt-out documentation strengthens potential claims.

## How to Protect Your Art

### 1. Glaze-Style Protection
Tools like Glaze and TSMO apply invisible perturbations that confuse AI models during training.

### 2. Opt-Out Tags
Embed C2PA and IPTC metadata telling AI crawlers to skip your work.

### 3. Robots.txt
Add directives blocking known AI scrapers (though compliance varies).

### 4. Monitor Datasets
Use TSMO to scan if your work appears in training datasets.

## What's Coming in 2025

- **New regulations** in the EU requiring training data disclosure
- **Opt-out registries** being developed
- **Watermarking standards** for AI-generated content
- **More lawsuits** with potential precedent-setting rulings

## Take Action Now

Don't wait for laws to catch up. Start protecting your art today with TSMO's AI protection features.
    `
  },
  "dmca-takedown-guide-for-digital-artists": {
    slug: "dmca-takedown-guide-for-digital-artists",
    title: "DMCA Takedown Guide for Digital Artists",
    excerpt: "Everything you need to know about filing effective DMCA takedown notices.",
    category: "Legal",
    readTime: "10 min read",
    date: "2025-12-05",
    author: "TSMO Team",
    icon: Gavel,
    content: `
## What is the DMCA?

The Digital Millennium Copyright Act (DMCA) is a US law that gives copyright holders a fast way to remove infringing content from websites. Even if you're not in the US, DMCA applies to any website with US users or servers.

## When to File a DMCA Takedown

File when someone:
- Posts your art without permission
- Sells products featuring your art
- Uses your art in their marketing
- Shares your art without credit (when required)

## The 6 Required Elements

A valid DMCA notice must include:

1. **Your physical or electronic signature**
2. **Identification of the copyrighted work** (link to your original)
3. **Identification of the infringing material** (exact URLs)
4. **Your contact information** (email, address, phone)
5. **Statement of good faith** that use is not authorized
6. **Statement of accuracy** under penalty of perjury

## Step-by-Step Process

### Step 1: Document the Infringement
- Screenshot the infringing page with timestamps
- Save the exact URLs
- Note any sales or commercial use

### Step 2: Find the Correct Recipient
Most platforms have dedicated DMCA contacts:
- Look for "DMCA," "Copyright," or "Legal" pages
- Check their Terms of Service
- TSMO has a database of 1000+ platform contacts

### Step 3: Send the Notice
Use email for fastest processing. Include all 6 elements.

### Step 4: Follow Up
- Platforms have 24-72 hours to respond
- Document all communications
- Escalate if ignored

## Platform-Specific Tips

### Instagram/Facebook
Use their built-in copyright reporting forms. Response time: 24-48 hours.

### Etsy/Amazon
Upload proof of original creation. May require registration documentation.

### Redbubble/Society6
Direct DMCA forms available. Usually removed within 72 hours.

## What Happens After You File

1. **Content removed** (usually within 24-72 hours)
2. **Counter-notice possible** - the infringer can dispute
3. **Repeat infringers** may have accounts terminated
4. **Legal escalation** if counter-noticed (rare)

## Automating with TSMO

Filing takedowns manually is tedious. TSMO provides:
- Pre-filled templates for major platforms
- One-click filing
- Status tracking
- Escalation support

## Conclusion

The DMCA is a powerful tool for artists. Understanding how to use it effectively protects your livelihood and creative rights.
    `
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPostsData[slug] : null;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "TSMO"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://tsmo.lovable.app/blog/${post.slug}`
    }
  };

  const relatedPosts = Object.values(blogPostsData)
    .filter(p => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{post.title} | TSMO Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://tsmo.lovable.app/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link 
                to="/blog" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              <p className="text-xl text-muted-foreground">{post.excerpt}</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <article className="prose prose-lg dark:prose-invert max-w-none">
                {post.content.split('\n').map((line, index) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
                  }
                  if (line.match(/^\d+\. /)) {
                    return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                  }
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  // Handle bold text
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={index} className="mb-4">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </article>

              {/* Share */}
              <div className="mt-12 pt-8 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  <span>Share this article</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://tsmo.lovable.app/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://tsmo.lovable.app/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Protect Your Art?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
              Stop worrying about theft. Start protecting your creative work today.
            </p>
            <Button size="lg" variant="secondary" asChild className="gap-2">
              <Link to="/upload">
                <CheckCircle2 className="h-5 w-5" />
                Start Free Scan
              </Link>
            </Button>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.slug} to={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                        <CardHeader>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                            <relatedPost.icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                          <div className="mt-3 flex items-center text-primary text-sm font-medium">
                            Read article <ArrowRight className="h-3 w-3 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default BlogPost;
