import React from "react";
import { Helmet } from "react-helmet";
import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Shield,
  Bot,
  Gavel,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileText
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
    excerpt: "A friendly guide to discovering if someone is using your artwork without permission.",
    category: "Protection",
    readTime: "8 min read",
    date: "2025-12-15",
    author: "TSMO Team",
    icon: Shield,
    content: `
## Let's be real: art theft sucks

You spent hours—maybe days—on a piece. You poured your heart into it. And then some random person on the internet decides it's theirs now. No credit. No payment. Just... stolen.

The frustrating part? Most artists never even find out. Studies suggest that **85% of stolen art goes completely unnoticed** by the original creator. That's a lot of thieves getting away with it.

But here's the good news: you can fight back. Let me show you how.

## Start with the basics: Google Reverse Image Search

This is the free, easy option. Here's how it works:

1. Head over to [Google Images](https://images.google.com)
2. Click the little camera icon in the search bar
3. Upload your artwork (or paste a link to it)
4. See what comes up

**Fair warning though:** Google only sees a small slice of the internet. It completely misses Instagram, TikTok, most print-on-demand sites, and tons of other places where theft actually happens. Think of it as checking one room in a very big house.

## Check where the thieves hang out

Art theft is especially bad on print-on-demand sites. These are places where anyone can upload a design and sell it on t-shirts, mugs, posters—you name it.

The usual suspects:
- Redbubble
- Society6
- Teepublic
- Zazzle
- Amazon Merch

Try searching for keywords related to your art. If you drew a purple dragon, search "purple dragon." You might be surprised (and angry) at what you find.

## Get help from tools built for artists

Look, manually searching every corner of the internet isn't realistic. That's why tools like TSMO exist.

Here's what we do differently:
- We scan **50+ platforms** continuously—not just once
- Our AI catches edited versions of your art (cropped, color-shifted, flipped)
- We save screenshots and timestamps as legal proof
- When you find theft, we help you send takedowns with one click

It's like having a guard dog for your portfolio.

## Set up free alerts

Google Alerts is your friend here. Create alerts for:
- Your artist name or username
- Titles of your most popular pieces
- Unique phrases from your art descriptions

Every time those words pop up online, Google will email you. It's not perfect, but it's free and catches some things.

## The AI problem (yes, this matters now)

Here's something scary: your art might already be inside AI systems. Datasets like LAION-5B contain billions of images scraped from the internet. If your work was online, there's a chance it was grabbed.

Sites like "Have I Been Trained" let you check, but TSMO goes further—we monitor these datasets and alert you if your art shows up.

## Okay, I found stolen art. Now what?

Don't panic. Here's your game plan:

1. **Screenshot everything** — get the URL, the date, the page
2. **Find your original files** — anything that proves you made it first
3. **File a DMCA takedown** — this is a legal notice that forces sites to remove stolen content
4. **For repeat offenders** — consider talking to a lawyer

TSMO can handle steps 1-3 automatically, which saves you a ton of time and frustration.

## The bottom line

You shouldn't have to play internet detective to protect your own work. But until the world gets better about respecting creators, a little monitoring goes a long way.

Start with free methods if you're on a budget. But if your art is part of your income—or just really important to you—investing in proper monitoring is worth every penny.

Your art is worth protecting. Don't let the thieves win.
    `
  },
  "ai-training-what-artists-need-to-know-2025": {
    slug: "ai-training-what-artists-need-to-know-2025",
    title: "AI Training: What Artists Need to Know in 2025",
    excerpt: "A no-jargon guide to how AI uses your art and what you can actually do about it.",
    category: "AI",
    readTime: "12 min read",
    date: "2025-12-10",
    author: "TSMO Team",
    icon: Bot,
    content: `
## So... AI learned from your art. Without asking.

Here's the uncomfortable truth: if you've ever posted art online, there's a good chance an AI has "studied" it. Midjourney, Stable Diffusion, DALL-E—they all learned to make images by looking at billions of pictures scraped from the internet.

Nobody asked permission. Nobody paid. They just... took it.

Let's break down what's happening and what you can do about it.

## How did they get my art?

### The short answer: bots

Tech companies built programs that automatically crawl the internet and download everything they find. Your DeviantArt portfolio? Downloaded. That piece you posted on Twitter? Grabbed. Your personal website? Yep, that too.

These downloads get bundled into massive datasets:

- **LAION-5B** has 5.8 billion images (yes, billion with a B)
- **Common Crawl** is basically a copy of huge chunks of the internet
- **Conceptual Captions** contains over 12 million images

### What they do with it

Once they have your art, they feed it into AI systems that learn patterns. The AI doesn't "remember" your specific image, but it learns from it. That means:

- It can copy your unique style
- People can type "in the style of [your name]" and get something that looks like your work
- Your years of practice become a prompt option for strangers

It feels gross because it is gross.

## Is this even legal?

This is the million-dollar question—literally, there are major lawsuits happening right now.

### Copyright still protects you

The moment you create art, you own the copyright. That hasn't changed. The question is whether using art for AI training counts as infringement.

### Artists are fighting back

Sarah Andersen, Kelly McKernan, Karla Ortiz, and others are suing AI companies. Getty Images sued Stability AI. These cases will probably shape the rules for years to come.

### The "fair use" argument

AI companies claim training on your art is "fair use"—the same rule that lets people use snippets for criticism or education. But using someone's entire portfolio to build a competing product? That's a stretch, and courts haven't agreed yet.

## What can you actually do?

You're not helpless here. Let's talk options.

### 1. Add protection to your images

Tools like Glaze (and TSMO) can add invisible changes to your images that confuse AI during training. The art looks normal to humans, but AI systems get scrambled data.

Think of it like putting a "Do Not Copy" code in your work that only machines can see.

### 2. Use opt-out tags

There are metadata standards (C2PA, IPTC) that tell AI crawlers "don't use this." Not all AI companies respect these, but having them helps if you ever need to take legal action.

### 3. Tell bots to stay away

You can add rules to your website (called robots.txt) that ask AI crawlers not to download your stuff. Again, not everyone follows the rules, but it's documented proof that you said no.

### 4. Monitor what's out there

TSMO scans AI training datasets to check if your work appears. If it does, you have evidence—which matters for legal cases.

## What's changing in 2025?

Things are moving fast:

- **New EU laws** will force AI companies to disclose what data they used for training
- **Opt-out registries** are being built—official lists of artists who don't consent
- **Watermarking standards** for AI-generated content are coming (so people know what's AI-made)
- **More lawsuits** will create legal precedents

This isn't over. The artists fighting these battles are making progress.

## My honest advice

Don't wait for laws to fix this. They're too slow. Start protecting your work now:

1. Use protection tools on new uploads
2. Add opt-out metadata to your files
3. Monitor your art in training datasets
4. Document everything in case you need it later

It's not fair that you have to do this extra work. But until the system catches up, it's the smartest move.

Your style is uniquely yours. Don't let machines steal it for free.
    `
  },
  "dmca-takedown-guide-for-digital-artists": {
    slug: "dmca-takedown-guide-for-digital-artists",
    title: "DMCA Takedown Guide for Digital Artists",
    excerpt: "How to get your stolen art removed from websites—explained in plain English.",
    category: "Legal",
    readTime: "10 min read",
    date: "2025-12-05",
    author: "TSMO Team",
    icon: Gavel,
    content: `
## Someone stole your art. Let's get it taken down.

Finding your art on someone else's shop or profile is infuriating. The good news? You have legal power here. It's called a DMCA takedown, and it works.

Let me walk you through it—no law degree required.

## What's a DMCA anyway?

DMCA stands for "Digital Millennium Copyright Act." It's a US law from 1998 that gives copyright holders (that's you!) a fast way to remove stolen content from websites.

The cool part: it works globally. If a website has US users or servers (which is almost everyone), they have to follow DMCA rules or risk huge legal trouble.

## When should you file one?

Use a DMCA takedown when someone:
- Posts your art on social media without permission
- Sells products with your designs (t-shirts, prints, stickers)
- Uses your art in their business marketing
- Reposts your work without credit (when your license requires it)

Basically: if it's your art and you didn't say they could use it, you can file.

## The 6 things every DMCA notice needs

For your takedown to be valid, you need to include these elements. Miss one, and they might ignore you.

1. **Your signature** — can be electronic, like typing your name
2. **Link to YOUR original** — show them the real thing
3. **Link to the STOLEN version** — the exact URL(s) of the theft
4. **Your contact info** — email at minimum, phone and address for serious cases
5. **A "good faith" statement** — that you believe the use is not authorized
6. **An "accuracy" statement** — that your info is correct, under penalty of perjury

That last part sounds scary, but it just means "don't lie." If it's really your art, you're fine.

## How to actually do it: step by step

### Step 1: Gather your evidence

Before you fire off emails, document everything:
- Screenshot the infringing page (including the URL and date)
- Find your original file with creation date if possible
- Note if they're making money from it

### Step 2: Find where to send it

Most platforms have a copyright or legal page. Look for:
- "DMCA" or "Copyright" links in the footer
- A "Report" button on the content itself
- Terms of Service page with contact info

TSMO has a database of 1000+ platform contacts—we can skip this step for you.

### Step 3: Send your notice

Email works best. Include all 6 required elements. Be clear, be professional, be firm.

Here's a simple template:

"I am the copyright owner of [describe your work]. It is being used without my permission at [infringing URL]. My original can be found at [your URL]. I request immediate removal. This is my electronic signature: [Your Name]."

### Step 4: Wait (but not too long)

Platforms typically respond within 24-72 hours. If you don't hear back in a week, follow up. If they ignore you, escalate—their hosting provider or payment processor often cares more.

## Platform-specific tips

### Instagram and Facebook
Use their built-in copyright forms. They're actually pretty good—usually removed within 24-48 hours.

### Etsy and Amazon
They want proof you made the original first. Having dated files helps a lot.

### Redbubble, Society6, Teepublic
Direct DMCA forms available. Usually removed within 72 hours. These sites deal with tons of theft, so they have the process down.

## What happens after you file?

1. **Content gets removed** — usually within 1-3 days
2. **The thief might counter-file** — they can dispute it, but then they have to give you their real info and you can sue them
3. **Repeat offenders get banned** — platforms track this stuff
4. **You might need a lawyer** — rare, but if someone counter-files, it could go to court

## The lazy way: let TSMO handle it

Manually filing takedowns is a pain. You have to find contact info, write the notice, track responses, follow up...

TSMO automates all of this:
- Pre-filled templates that meet all legal requirements
- One-click filing to major platforms
- Dashboard to track status of all your takedowns
- Automatic follow-ups when platforms are slow

It's like having a legal assistant who works 24/7.

## You've got this

The DMCA is one of the most artist-friendly laws out there. It puts the power in YOUR hands. Don't let thieves profit from your hard work.

And remember: every takedown you file is a message that artists fight back.

Now go reclaim what's yours.
    `
  }
};

const getIconForCategory = (category: string): React.ElementType => {
  switch (category?.toLowerCase()) {
    case 'protection': return Shield;
    case 'ai': return Bot;
    case 'legal': return Gavel;
    default: return FileText;
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch from database first
  const { data: dbPost, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!slug
  });

  // Try database post first, then fallback to hardcoded
  const hardcodedPost = slug ? blogPostsData[slug] : null;
  
  const post = dbPost ? {
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt || '',
    content: dbPost.content,
    category: dbPost.tags?.[0] || 'General',
    readTime: '5 min read',
    date: dbPost.published_at || dbPost.created_at,
    author: 'TSMO Team',
    icon: getIconForCategory(dbPost.tags?.[0] || '')
  } : hardcodedPost;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
