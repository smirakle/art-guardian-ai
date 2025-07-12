import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  Activity, 
  Link2, 
  Search, 
  Check, 
  Star, 
  ArrowRight,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Index = () => {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            🔒 Trusted by 10,000+ Artists Worldwide
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Protect Your Art.<br />
            <span className="text-foreground">Own Your Future.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered protection for digital artists. Monitor, verify, and secure your creative work 
            with blockchain technology and real-time threat detection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              Start Protecting Your Art
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Detection Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Protected Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">$50M+</div>
              <div className="text-sm text-muted-foreground">Art Value Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Art Protection Suite
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From AI-powered visual recognition to blockchain verification, 
              we provide end-to-end protection for your digital artwork.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visual Recognition</CardTitle>
                <CardDescription>
                  Advanced AI analyzes your artwork and detects unauthorized usage across the web
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  24/7 surveillance across platforms, marketplaces, and social media networks
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Blockchain Verification</CardTitle>
                <CardDescription>
                  Immutable proof of creation and ownership through blockchain technology
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Deep Web Scanning</CardTitle>
                <CardDescription>
                  Advanced dark web monitoring and threat detection for comprehensive protection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instant Alerts</h3>
                <p className="text-sm text-muted-foreground">Get notified immediately when your art is detected online</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Global Coverage</h3>
                <p className="text-sm text-muted-foreground">Monitor across all major platforms and marketplaces worldwide</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal Support</h3>
                <p className="text-sm text-muted-foreground">Automated DMCA filing and legal assistance when needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Protection Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From individual artists to large studios, we have a plan that fits your needs and budget.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-center">Starter</CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold">$29</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 50 artworks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic visual recognition</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Weekly monitoring reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Email support</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-lg transform scale-105">
              <CardHeader>
                <Badge className="mx-auto mb-4 bg-primary">Most Popular</Badge>
                <CardTitle className="text-center">Professional</CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold">$79</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 500 artworks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced AI recognition</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Blockchain verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Automated DMCA filing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-accent">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
            
            {/* Enterprise Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-center">Enterprise</CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold">Custom</div>
                  <div className="text-muted-foreground">pricing</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited artworks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom AI models</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Deep web scanning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Legal assistance</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Leading Artists
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what creative professionals are saying about TSMO's art protection platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "TSMO caught someone selling my artwork on three different platforms. 
                  The automated DMCA filing saved me weeks of manual work."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">Digital Artist</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The blockchain verification gives me peace of mind. 
                  I now have immutable proof of when I created each piece."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-full"></div>
                  <div>
                    <div className="font-semibold">Marcus Rodriguez</div>
                    <div className="text-sm text-muted-foreground">NFT Creator</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "As a studio managing hundreds of artworks, TSMO's enterprise solution 
                  is exactly what we needed. The ROI is incredible."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                  <div>
                    <div className="font-semibold">Alex Thompson</div>
                    <div className="text-sm text-muted-foreground">Studio Director</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>500% increase in art recovery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>10,000+ protected artists</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>99.9% threat detection rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Protect Your Art?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with a free consultation or reach out to our team for any questions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input placeholder="I'm interested in..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea placeholder="Tell us about your art protection needs..." rows={4} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Get in touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">hello@tsmo.ai</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-muted-foreground">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Office</div>
                      <div className="text-muted-foreground">San Francisco, CA</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-4">Quick Start</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Try Visual Recognition Demo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Link2 className="h-4 w-4 mr-2" />
                    Get Blockchain Certificate
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Start Monitoring Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Art. Our Watch.
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of artists who trust TSMO to protect their creative work. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-primary">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;