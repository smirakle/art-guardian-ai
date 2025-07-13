import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  MapPin,
  FileImage,
  Upload,
  Scan,
  Bot,
  Play,
  ChevronRight
} from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import MonitoringFlow from "@/components/MonitoringFlow";

const Index = () => {
  const { toast } = useToast();
  const [demoStep, setDemoStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startDemo = () => {
    setIsAnalyzing(true);
    setDemoStep(1);
    
    // Simulate analysis steps
    setTimeout(() => setDemoStep(2), 2000);
    setTimeout(() => setDemoStep(3), 4000);
    setTimeout(() => setDemoStep(4), 6000);
    setTimeout(() => {
      setDemoStep(5);
      setIsAnalyzing(false);
    }, 8000);
  };

  const resetDemo = () => {
    setDemoStep(0);
    setIsAnalyzing(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent Successfully!",
        description: `Thank you ${data.firstName}! We'll get back to you within 24 hours.`,
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  const handlePricingPlan = (plan: string) => {
    toast({
      title: `${plan} Plan Selected`,
      description: "Redirecting to checkout...",
    });
    // In a real app, this would redirect to a payment processor
    setTimeout(() => {
      window.location.href = `/checkout?plan=${plan.toLowerCase()}`;
    }, 1500);
  };

  const handleFreeTrial = (plan: string) => {
    toast({
      title: "Free Trial Started!",
      description: `Your 14-day ${plan} trial is now active. Check your email for setup instructions.`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge variant="secondary" className="mb-6 px-3 sm:px-4 py-2 text-xs sm:text-sm">
            🔒 Trusted by 10,000+ Artists Worldwide
          </Badge>
          
          {/* TSMO Logo */}
          <div className="mb-6 sm:mb-8">
            <img 
              src={tsmoLogo} 
              alt="TSMO Multimedia Creative Protection Logo" 
              className="h-48 sm:h-64 md:h-96 lg:h-112 mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Protect Your Art.<br />
            <span className="text-foreground">Own Your Future.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Advanced AI-powered protection for digital artists. Monitor, verify, and secure your creative work 
            with blockchain technology and real-time threat detection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => window.location.href = "/upload"}
            >
              Start Protecting Your Art
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg"
              onClick={() => window.location.href = "/demo"}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
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

      {/* Monitoring Flow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <MonitoringFlow />
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Live Demo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Try TSMO Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your artwork and see our AI protection system in action
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Demo Interface */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-primary" />
                  Art Protection Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sample Artwork */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    {demoStep === 0 ? (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sample Artwork: "Digital Sunrise"</p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <h3 className="text-lg font-bold">"Digital Sunrise"</h3>
                          <p className="text-sm opacity-80">Artist: Demo User</p>
                        </div>
                      </div>
                    )}
                  
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <Scan className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Analyzing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Progress */}
                {demoStep > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Analysis Progress</span>
                      <span>{Math.min(demoStep * 20, 100)}%</span>
                    </div>
                    <Progress value={Math.min(demoStep * 20, 100)} className="w-full" />
                  </div>
                )}

                {/* Demo Controls */}
                <div className="flex gap-2">
                  <Button 
                    onClick={startDemo} 
                    disabled={isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-primary to-accent"
                  >
                    {isAnalyzing ? (
                      <>
                        <Bot className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : demoStep > 0 ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Again
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                  {demoStep > 0 && (
                    <Button variant="outline" onClick={resetDemo}>
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* Step 1: AI Analysis */}
              {demoStep >= 1 && (
                <Card className={`bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 ${demoStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${demoStep >= 2 ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                      AI Visual Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Image Hash:</span>
                      <span className="font-mono text-xs">a7b9c2f8...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color Palette:</span>
                      <span>Detected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style Features:</span>
                      <span>Mapped</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Web Monitoring */}
              {demoStep >= 2 && (
                <Card className={`bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 ${demoStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${demoStep >= 3 ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                      Web Monitoring Scan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sites Scanned:</span>
                      <span>2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Social Platforms:</span>
                      <span>15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marketplaces:</span>
                      <span>23</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Deep Web Scan */}
              {demoStep >= 3 && (
                <Card className={`bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 ${demoStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${demoStep >= 4 ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                      Deep Web Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hidden Networks:</span>
                      <span>Checked</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Piracy Sites:</span>
                      <span>Monitored</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Sharing:</span>
                      <span>Scanned</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Blockchain Verification */}
              {demoStep >= 4 && (
                <Card className={`bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 ${demoStep >= 5 ? 'opacity-100' : 'opacity-50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${demoStep >= 5 ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                      Blockchain Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hash Recorded:</span>
                      <span className="font-mono text-xs">0x4a7b...9c2f</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Block Height:</span>
                      <span>18,934,521</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default" className="h-5 text-xs">Verified</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Results */}
              {demoStep === 5 && (
                <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      Analysis Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Protection Status:</span>
                      <Badge className="bg-green-500">Fully Protected</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Your artwork is now monitored across 15,000+ websites and protected by blockchain verification.
                    </div>
                    <Link to="/demo">
                      <Button size="sm" variant="outline" className="w-full">
                        <ChevronRight className="w-3 h-3 mr-1" />
                        Try Full Demo
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
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
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Student Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Badge className="mx-auto mb-4 bg-blue-600">Student</Badge>
                <CardTitle className="text-center">Student</CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold">$19</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 25 artworks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic visual recognition</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Monthly monitoring reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Email support</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleFreeTrial("Student")}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

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
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleFreeTrial("Starter")}
                >
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
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  onClick={() => handleFreeTrial("Professional")}
                >
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
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Contact Sales",
                      description: "Redirecting to enterprise consultation form...",
                    });
                    setTimeout(() => {
                      window.location.href = "/contact?type=enterprise";
                    }, 1500);
                  }}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
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

      {/* Submit Testimonial Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-muted/20 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Share Your TSMO Experience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help other artists learn about TSMO by sharing your success story
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Write Your Testimonial
              </CardTitle>
              <CardDescription>
                Tell us how TSMO has helped protect your creative work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: "Thank you!",
                  description: "Your testimonial has been submitted for review.",
                });
              }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name</label>
                    <Input placeholder="Sarah Chen" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Profession</label>
                    <Input placeholder="Digital Artist" required />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        className="hover:scale-110 transition-transform"
                        onClick={(e) => {
                          const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                          stars?.forEach((star, index) => {
                            const starIcon = star.querySelector('svg');
                            if (starIcon) {
                              if (index < rating) {
                                starIcon.classList.add('fill-yellow-400', 'text-yellow-400');
                                starIcon.classList.remove('text-muted-foreground');
                              } else {
                                starIcon.classList.remove('fill-yellow-400', 'text-yellow-400');
                                starIcon.classList.add('text-muted-foreground');
                              }
                            }
                          });
                        }}
                      >
                        <Star className="w-6 h-6 text-muted-foreground transition-colors cursor-pointer" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Experience</label>
                  <Textarea 
                    placeholder="Tell us how TSMO helped protect your artwork. What features did you find most valuable? How did it impact your business?"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Company/Studio (Optional)</label>
                  <Input placeholder="Your studio name or leave blank" />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="consent" className="rounded" required />
                  <label htmlFor="consent" className="text-sm text-muted-foreground">
                    I consent to TSMO using my testimonial in marketing materials
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  size="lg"
                >
                  Submit Testimonial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              All testimonials are reviewed before publication. Thank you for helping other artists discover TSMO!
            </p>
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
                      <Input name="firstName" placeholder="John" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input name="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input name="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input name="subject" placeholder="I'm interested in..." required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea name="message" placeholder="Tell us about your art protection needs..." rows={4} required />
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
            Protect Your Creative Work
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