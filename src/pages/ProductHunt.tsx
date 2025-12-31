import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Eye, 
  Bell, 
  FileText, 
  Fingerprint, 
  Globe,
  Upload,
  Zap,
  Search,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Twitter,
  Linkedin,
  Heart,
  Star,
  Sparkles,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { InstantProtectModal } from "@/components/InstantProtectModal";
import { toast } from "sonner";
import tsmoLogo from "@/assets/tsmo-logo.png";

const ProductHunt = () => {
  const navigate = useNavigate();
  const [showInstantProtect, setShowInstantProtect] = useState(false);
  const [email, setEmail] = useState("");
  const [copiedTweet, setCopiedTweet] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);

  const tweetText = `🎨 Just discovered @TSMOWatch - finally a way to protect my art from AI scraping!

✅ Browser-based (no downloads)
✅ 24/7 web monitoring
✅ One-click DMCA assistance

If you're a creator, check it out: https://tsmowatch.com

#AIArt #ArtTheft #ProductHunt`;

  const linkedInText = `Excited to share TSMO Watch - a game-changer for digital artists and creators!

In a world where AI companies scrape billions of images daily without consent, TSMO provides:

🛡️ AI Training Resistance - Style cloaking technology that makes your art untrainable
🔍 24/7 Web Monitoring - Continuous scanning for copies of your work  
⚡ Instant Alerts - Know the moment your art appears somewhere new
📝 DMCA Assistance - One-click takedown request generation

All browser-based, no downloads required.

Check it out: https://tsmowatch.com

#DigitalArt #Copyright #CreatorEconomy #AI`;

  const copyToClipboard = async (text: string, type: 'tweet' | 'linkedin') => {
    await navigator.clipboard.writeText(text);
    if (type === 'tweet') {
      setCopiedTweet(true);
      setTimeout(() => setCopiedTweet(false), 2000);
    } else {
      setCopiedLinkedIn(true);
      setTimeout(() => setCopiedLinkedIn(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks! We'll notify you on launch day.");
      setEmail("");
    }
  };

  const features = [
    {
      icon: Shield,
      title: "AI Training Resistance",
      description: "Style cloaking technology that makes your art untrainable by AI models"
    },
    {
      icon: Eye,
      title: "24/7 Web Monitoring",
      description: "We scan the internet continuously for copies of your work"
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Get notified the moment your art appears somewhere new"
    },
    {
      icon: FileText,
      title: "DMCA Assistance",
      description: "One-click takedown request generation to protect your rights"
    },
    {
      icon: Fingerprint,
      title: "Invisible Watermarking",
      description: "Hidden fingerprints that prove ownership without affecting visuals"
    },
    {
      icon: Globe,
      title: "No Download Required",
      description: "Works entirely in your browser - start protecting in seconds"
    }
  ];

  const steps = [
    {
      number: "1",
      icon: Upload,
      title: "Upload",
      description: "Drop your artwork into TSMO"
    },
    {
      number: "2",
      icon: Shield,
      title: "Protect",
      description: "We apply AI-resistant style cloaking"
    },
    {
      number: "3",
      icon: Search,
      title: "Monitor",
      description: "Get alerts when copies are found"
    }
  ];

  const stats = [
    { value: "2.5B+", label: "Images scraped daily for AI training" },
    { value: "85%", label: "Of artists have found work stolen" },
    { value: "$0", label: "Compensation most artists receive" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Product Hunt Badge Placeholder */}
            <div className="mb-6 flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-secondary/50 text-secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                Launching on Product Hunt
              </Badge>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={tsmoLogo} alt="TSMO Watch" className="h-16 md:h-20" />
            </div>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-secondary font-medium mb-4">
              Your Art. Your Rules. AI Can't Touch It.
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Online Art Theft
              <br />
              <span className="text-primary">Before It Happens</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The first browser-based platform that protects your artwork from AI scraping, 
              detects copies across the web, and helps you take action — no downloads required.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-8 text-lg"
                onClick={() => setShowInstantProtect(true)}
              >
                Try Free — No Signup Required
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-12 px-8"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>

            {/* Microcopy */}
            <p className="text-sm text-muted-foreground">
              Upload → Scan → See matches in seconds. Works instantly in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Created something beautiful lately?
            </h2>
            <p className="text-lg text-muted-foreground">
              Chances are, AI companies are already using it without your permission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-destructive/5 border-destructive/20 text-center">
                <CardHeader className="pb-2">
                  <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <CardTitle className="text-3xl md:text-4xl text-destructive">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {stat.label}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Protect Your Art
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive protection powered by advanced technology, designed for working artists.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Protect your art in three simple steps
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="text-center flex-1">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {step.number}
                  </div>
                  <step.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-8 w-8 text-muted-foreground hidden md:block shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by Artists
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* BizWeekly Feature */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Featured in BizWeekly</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        "Suddenly Fighting Shadows: One Artist's Mission to Protect Creators in the AI Age"
                      </p>
                      <a 
                        href="https://bizweekly.com/suddenly-fighting-shadows-one-artists-mission-to-protect-creators-in-the-ai-age/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm font-medium hover:underline inline-flex items-center"
                      >
                        Read the feature <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Harvard i-lab */}
              <Card className="border-2 border-secondary/20 bg-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Harvard Innovation Labs Member</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Founder Shirleena Cunningham is a member of Harvard Innovation Labs.
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        *Harvard does not endorse or sponsor TSMO Watch
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Maker Story */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">The Story Behind TSMO</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Hi Product Hunt! I'm Shirleena, founder of TSMO Watch.
                    </p>
                    <p>
                      As an artist myself, I watched AI companies scrape billions of artworks without consent. 
                      Artists were losing control of their creative identities overnight — and most didn't even 
                      know it was happening.
                    </p>
                    <p>
                      TSMO is my answer: a browser-based platform that makes your art resistant to AI training, 
                      monitors the web 24/7 for copies, and helps you take action with one-click DMCA assistance.
                    </p>
                    <p className="font-medium text-foreground">
                      No downloads. No complex setup. Just upload and protect.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Snapshot */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Free, Upgrade When Ready
            </h2>
            <p className="text-lg text-muted-foreground">
              Protect up to 50 artworks free — forever
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Free
                  <Badge variant="secondary">Popular</Badge>
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$0</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Up to 50 artworks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> AI training resistance
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Basic web monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Email alerts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pro
                  <Badge>Best Value</Badge>
                </CardTitle>
                <CardDescription>For professional artists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$9.99<span className="text-lg font-normal">/mo</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Unlimited artworks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Priority 24/7 monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Instant alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> DMCA assistance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Share Templates */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Help Spread the Word
            </h2>
            <p className="text-lg text-muted-foreground">
              Copy and share — help fellow artists discover TSMO
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Twitter Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-5 w-5" />
                  Twitter/X Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm whitespace-pre-wrap">
                  {tweetText}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => copyToClipboard(tweetText, 'tweet')}
                >
                  {copiedTweet ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* LinkedIn Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  LinkedIn Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {linkedInText}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => copyToClipboard(linkedInText, 'linkedin')}
                >
                  {copiedLinkedIn ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Promotional Resources
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <Button variant="outline" onClick={() => navigate("/press-kit")}>
              <FileText className="h-4 w-4 mr-2" />
              Press Kit
            </Button>
            <Button variant="outline" onClick={() => navigate("/promo-materials")}>
              <Zap className="h-4 w-4 mr-2" />
              Promo Materials
            </Button>
            <Button variant="outline" onClick={() => navigate("/about-tsmo")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              About TSMO
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Protect Your Art?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of artists taking back control of their creative work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-8 text-lg"
                onClick={() => setShowInstantProtect(true)}
              >
                Try It Now — Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Email Capture */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-3">
                Get notified on launch day
              </p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline">
                  Notify Me
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Protect Modal */}
      <InstantProtectModal 
        open={showInstantProtect} 
        onOpenChange={setShowInstantProtect}
      />
    </div>
  );
};

export default ProductHunt;
