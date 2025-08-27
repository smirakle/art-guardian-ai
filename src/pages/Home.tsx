import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight, Play, Eye, Lock, Zap } from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'TSMO | Your Art. Our Watch.';
    
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta('description', 'Protect your digital art with AI-powered monitoring and blockchain verification. TSMO - Your Art. Our Watch.');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Main Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-accent rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 border-2 border-primary rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Status Badge */}
            <Badge variant="secondary" className="mb-8 px-6 py-2 text-sm font-medium animate-pulse">
              <Shield className="w-4 h-4 mr-2" />
              AI-Powered Art Protection Platform
            </Badge>

            {/* TSMO Logo - Large and Prominent */}
            <div className="mb-12">
              <img 
                src={tsmoLogo} 
                alt="TSMO - Your Art. Our Watch." 
                className="h-64 sm:h-80 md:h-96 mx-auto object-contain filter drop-shadow-2xl"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Your Art.
              </span>
              <br />
              <span className="text-foreground">Our Watch.</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light">
              Protect your digital creations with advanced AI monitoring, 
              blockchain verification, and real-time threat detection.
            </p>

            {/* Value Proposition */}
            <div className="mb-12 p-6 bg-primary/10 border border-primary/20 rounded-2xl backdrop-blur-sm">
              <p className="text-lg sm:text-xl text-primary font-semibold">
                Join 15,000+ creators protecting their art 24/7
              </p>
              <p className="text-muted-foreground mt-2">
                $2.4M in stolen revenue recovered • 50K+ violations stopped
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-12 py-6 text-xl font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/upload")}
              >
                Start Protecting Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-12 py-6 text-xl font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => navigate("/demo")}
              >
                <Play className="mr-3 h-6 w-6" />
                Watch Demo
              </Button>
            </div>

            {/* Key Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/70 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">24/7 Monitoring</h3>
                <p className="text-sm text-muted-foreground text-center">
                  AI scans the internet continuously for unauthorized use of your art
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/70 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Blockchain Proof</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Immutable ownership certificates for legal protection
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/70 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Action</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Automated takedown notices and legal documentation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="hsl(var(--muted))"
              d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z"
            />
          </svg>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15K+</div>
              <div className="text-muted-foreground">Protected Artists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$2.4M</div>
              <div className="text-muted-foreground">Revenue Recovered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Violations Stopped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;