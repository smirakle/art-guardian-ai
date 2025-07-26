import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Palette, Brush, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20 md:pt-24 bg-white">
      {/* Artistic floating elements */}
      <div className="absolute top-20 left-4 sm:left-10 opacity-30 hidden sm:block">
        <Palette className="w-12 h-12 sm:w-20 sm:h-20" style={{ color: 'hsl(var(--tsmo-pink))' }} />
      </div>
      <div className="absolute bottom-32 right-4 sm:right-16 opacity-30 hidden sm:block">
        <Brush className="w-10 h-10 sm:w-16 sm:h-16" style={{ color: 'hsl(var(--tsmo-blue))' }} />
      </div>
      <div className="absolute top-40 right-4 sm:right-20 opacity-30 hidden sm:block">
        <Eye className="w-8 h-8 sm:w-14 sm:h-14" style={{ color: 'hsl(var(--tsmo-orange))' }} />
      </div>
      
      {/* Colorful paint splash effects */}
      <div className="absolute top-10 left-1/4 w-20 h-20 rounded-full opacity-20" 
           style={{ background: 'hsl(var(--tsmo-pink))' }}></div>
      <div className="absolute bottom-20 right-1/3 w-16 h-16 rounded-full opacity-15" 
           style={{ background: 'hsl(var(--tsmo-teal))' }}></div>
      <div className="absolute top-1/3 right-10 w-12 h-12 rounded-full opacity-25" 
           style={{ background: 'hsl(var(--tsmo-yellow))' }}></div>
      
      <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* TSMO Logo section */}
          <div className="mb-8 sm:mb-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-lg" 
                   style={{ background: 'var(--gradient-rainbow)', padding: '4px' }}>
                <div className="bg-white rounded-lg p-4 sm:p-6">
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-foreground mb-2"
                      style={{ textShadow: 'var(--text-shadow-bold)' }}>
                    TSMO
                  </h1>
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(var(--tsmo-purple))' }} />
                    <Palette className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(var(--tsmo-pink))' }} />
                    <Brush className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(var(--tsmo-teal))' }} />
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(var(--tsmo-orange))' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main messaging */}
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 text-foreground leading-tight"
              style={{ textShadow: 'var(--text-shadow-bold)' }}>
            PROTECT YOUR ART.
          </h2>
          <h3 className="text-2xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 text-foreground leading-tight"
              style={{ textShadow: 'var(--text-shadow-bold)' }}>
            OWN YOUR FUTURE.
          </h3>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2 font-semibold">
            Revolutionary AI protection for artists. Stop theft, detect copies, claim your rights.
          </p>
          
          <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-white font-bold px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl rounded-xl transform hover:scale-105 transition-all duration-300"
              style={{ 
                background: 'var(--gradient-artistic)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
              onClick={() => window.location.href = '/monitoring'}
            >
              START PROTECTING NOW
              <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button 
              onClick={() => window.open('/upload', '_blank')} 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-bold border-2 rounded-xl hover:bg-gray-50 transition-all duration-300"
              style={{ borderColor: 'hsl(var(--tsmo-purple))' }}
            >
              TEST YOUR ART
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-muted-foreground">
              www.tsmowatch.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;