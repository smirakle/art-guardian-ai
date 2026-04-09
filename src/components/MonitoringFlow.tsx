import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Scan, 
  Database, 
  Zap,
  ArrowRight,
  Search,
  Brain,
  Lock
} from 'lucide-react';

const MonitoringFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const steps = [
    {
      id: 1,
      title: "Continuous Web Scanning",
      description: "24/7 monitoring across 47+ platforms, social networks, and marketplaces",
      icon: Globe,
      color: "bg-blue-500",
      details: "Real-time crawling of e-commerce sites, social media, forums, and dark web sources"
    },
    {
      id: 2,
      title: "AI Visual Recognition",
      description: "Advanced computer vision detects unauthorized use of your visual assets",
      icon: Eye,
      color: "bg-purple-500",
      details: "Machine learning algorithms analyze images, logos, and brand elements with 99.7% accuracy"
    },
    {
      id: 3,
      title: "Deep Intelligence Analysis",
      description: "Context-aware AI determines threat severity and authenticity",
      icon: Brain,
      color: "bg-orange-500",
      details: "Natural language processing and behavioral analysis to reduce false positives"
    },
    {
      id: 4,
      title: "Blockchain Verification",
      description: "Immutable proof of infringement with cryptographic evidence",
      icon: Lock,
      color: "bg-green-500",
      details: "Timestamped, tamper-proof documentation for legal proceedings"
    },
    {
      id: 5,
      title: "Instant Alert System",
      description: "Real-time notifications when threats are detected",
      icon: Zap,
      color: "bg-red-500",
      details: "Multi-channel alerts via email, SMS, Slack, and API webhooks"
    },
    {
      id: 6,
      title: "Automated Response",
      description: "AI-powered takedown requests and protection measures",
      icon: Shield,
      color: "bg-cyan-500",
      details: "Automated DMCA notices, platform reporting, and legal documentation"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How TSMO Monitoring Works
        </h2>
        <p className="text-muted-foreground text-lg">
          Advanced AI-powered brand protection in 6 automated steps
        </p>
        <button
          onClick={togglePlayback}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? 'Pause Animation' : 'Play Animation'}
        </button>
      </div>

      {/* Main Flow Visualization */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-8">
            {steps.slice(0, -1).map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 h-16" /> {/* Spacer for step circle */}
                <ArrowRight 
                  className={`w-6 h-6 transition-all duration-500 ${
                    activeStep > index ? 'text-primary animate-pulse' : 'text-muted-foreground/30'
                  }`} 
                />
              </div>
            ))}
            <div className="w-16 h-16" /> {/* Final spacer */}
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = activeStep === index;
            const isPast = activeStep > index;
            
            return (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                  isActive 
                    ? 'ring-2 ring-primary shadow-xl scale-105' 
                    : isPast 
                    ? 'opacity-75 scale-95' 
                    : 'opacity-60 scale-90'
                }`}
                onClick={() => handleStepClick(index)}
              >
                <CardContent className="p-6">
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">
                      Step {step.id}
                    </Badge>
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive ? step.color : 'bg-muted'
                      }`}
                    >
                      <StepIcon 
                        className={`w-6 h-6 transition-all duration-500 ${
                          isActive 
                            ? 'text-white animate-pulse' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`font-semibold mb-2 transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </p>

                  {/* Expandable Details */}
                  <div className={`overflow-hidden transition-all duration-500 ${
                    isActive ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-4">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-500 ${
                          isActive ? step.color : isPast ? 'bg-primary' : 'bg-transparent'
                        }`}
                        style={{
                          width: isActive ? '100%' : isPast ? '100%' : '0%'
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary">47+</div>
          <div className="text-sm text-muted-foreground">Platforms Monitored</div>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary">94.2%</div>
          <div className="text-sm text-muted-foreground">Detection Accuracy</div>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary">&lt;30s</div>
          <div className="text-sm text-muted-foreground">Alert Speed</div>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary">24/7</div>
          <div className="text-sm text-muted-foreground">Continuous Monitoring</div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringFlow;