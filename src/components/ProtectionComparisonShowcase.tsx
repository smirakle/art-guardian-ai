import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  ShieldOff, 
  AlertTriangle, 
  Check, 
  X, 
  Lock, 
  ArrowRight,
  GripVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import exampleArtwork from "@/assets/example-artwork.gif";

const ProtectionComparisonShowcase = () => {
  const navigate = useNavigate();
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const unprotectedFeatures = [
    { icon: AlertTriangle, text: "AI Training Exposed" },
    { icon: X, text: "No Watermark" },
    { icon: X, text: "Easy to Steal" },
    { icon: X, text: "No Legal Protection" }
  ];

  const protectedFeatures = [
    { icon: Shield, text: "StyleCloak Active" },
    { icon: Check, text: "Invisible Watermark" },
    { icon: Lock, text: "AI Training Blocked" },
    { icon: Check, text: "Instant Alert System" }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See the Difference Protection Makes
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Drag the slider to compare unprotected vs. TSMO protected content
          </p>
        </div>

        {/* Slider Comparison */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-[16/10] max-w-3xl mx-auto rounded-2xl overflow-hidden cursor-ew-resize shadow-2xl border-2 border-border/50 mb-8"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onClick={handleClick}
        >
          {/* Unprotected Side (Background - Full Width) */}
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-destructive/5">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <img 
                src={exampleArtwork} 
                alt="Unprotected artwork" 
                className="max-w-full max-h-full object-contain opacity-90"
                draggable={false}
              />
            </div>
            {/* Unprotected Label */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
              <ShieldOff className="h-4 w-4" />
              Unprotected
            </div>
            {/* Warning Icon */}
            <div className="absolute top-4 right-4">
              <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
            </div>
            {/* Vulnerability indicators */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {unprotectedFeatures.slice(0, 2).map((feature, i) => (
                <span key={i} className="bg-destructive/80 text-destructive-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <feature.icon className="h-3 w-3" />
                  {feature.text}
                </span>
              ))}
            </div>
          </div>

          {/* Protected Side (Foreground - Clipped) */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* Protected Image with Effects */}
              <div className="relative">
                <img 
                  src={exampleArtwork} 
                  alt="TSMO protected artwork" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_40px_rgba(var(--primary),0.4)]"
                  draggable={false}
                />
                {/* Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  <div className="absolute inset-0 flex flex-col justify-around -rotate-30 origin-center scale-150">
                    <div className="text-primary/25 font-bold text-xs tracking-widest whitespace-nowrap">
                      TSMO PROTECTED • TSMO PROTECTED • TSMO PROTECTED
                    </div>
                    <div className="text-primary/20 font-bold text-xs tracking-widest whitespace-nowrap">
                      TSMO PROTECTED • TSMO PROTECTED • TSMO PROTECTED
                    </div>
                    <div className="text-primary/25 font-bold text-xs tracking-widest whitespace-nowrap">
                      TSMO PROTECTED • TSMO PROTECTED • TSMO PROTECTED
                    </div>
                  </div>
                </div>
                {/* Security Grid */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-15 rounded-lg"
                  style={{
                    backgroundImage: `
                      linear-gradient(0deg, transparent 24%, hsl(var(--primary)) 25%, hsl(var(--primary)) 26%, transparent 27%, transparent 74%, hsl(var(--primary)) 75%, hsl(var(--primary)) 76%, transparent 77%, transparent),
                      linear-gradient(90deg, transparent 24%, hsl(var(--primary)) 25%, hsl(var(--primary)) 26%, transparent 27%, transparent 74%, hsl(var(--primary)) 75%, hsl(var(--primary)) 76%, transparent 77%, transparent)
                    `,
                    backgroundSize: '25px 25px'
                  }}
                />
              </div>
            </div>
            {/* Protected Label */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
              <Shield className="h-4 w-4" />
              TSMO Protected
            </div>
            {/* Shield Icon */}
            <div className="absolute top-4 right-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            {/* Protection indicators */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {protectedFeatures.slice(0, 2).map((feature, i) => (
                <span key={i} className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <feature.icon className="h-3 w-3" />
                  {feature.text}
                </span>
              ))}
            </div>
            {/* Glow border effect */}
            <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl pointer-events-none" />
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 cursor-ew-resize"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            {/* Handle Grip */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary/30">
              <GripVertical className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Feature Comparison Below Slider */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Unprotected Features */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldOff className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-destructive">Without Protection</h4>
            </div>
            <div className="space-y-2">
              {unprotectedFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="h-4 w-4 text-destructive" />
                  {feature.text}
                </div>
              ))}
            </div>
          </div>

          {/* Protected Features */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-primary">With TSMO Protection</h4>
            </div>
            <div className="space-y-2">
              {protectedFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <feature.icon className="h-4 w-4 text-primary" />
                  {feature.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-8 border border-primary/20">
          <h4 className="text-xl md:text-2xl font-bold mb-3">
            Ready to Protect Your Content?
          </h4>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join 15,000+ creators who trust TSMO to protect their intellectual property with military-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate("/upload")}
            >
              <Shield className="mr-2 h-5 w-5" />
              Protect Your Content Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate("/protection-guide")}
            >
              Learn More About Protection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtectionComparisonShowcase;
