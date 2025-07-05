import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Bot, Palette } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Shield className="w-16 h-16 text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-20">
        <Bot className="w-20 h-20 text-accent animate-pulse delay-1000" />
      </div>
      <div className="absolute top-40 right-20 opacity-20">
        <Palette className="w-12 h-12 text-secondary animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
            Protect Your Art with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered protection for artists' intellectual property. Monitor, detect, and defend your creative work automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-6 text-lg">
              Start Protecting Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
              <Shield className="w-12 h-12 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">24/7 Monitoring</h3>
              <p className="text-muted-foreground text-sm">Continuous AI surveillance across platforms</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
              <Bot className="w-12 h-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Smart Detection</h3>
              <p className="text-muted-foreground text-sm">Advanced algorithms spot infringement instantly</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
              <Palette className="w-12 h-12 text-secondary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Artist-First</h3>
              <p className="text-muted-foreground text-sm">Built specifically for creative professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;