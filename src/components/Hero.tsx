import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Bot, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20 md:pt-24">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5" />
      
      {/* Floating elements - hide on very small screens */}
      <div className="absolute top-20 left-4 sm:left-10 opacity-20 hidden sm:block">
        <Shield className="w-8 h-8 sm:w-16 sm:h-16 text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-32 right-4 sm:right-16 opacity-20 hidden sm:block">
        <Bot className="w-10 h-10 sm:w-20 sm:h-20 text-accent animate-pulse delay-1000" />
      </div>
      <div className="absolute top-40 right-4 sm:right-20 opacity-20 hidden sm:block">
        <Palette className="w-6 h-6 sm:w-12 sm:h-12 text-secondary animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
            {t('hero.title')}
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              onClick={() => window.location.href = '/monitoring'}
            >
              {t('hero.getStarted')}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button 
              onClick={() => window.open('/upload', '_blank')} 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
            >
              {t('hero.learnMore')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16 px-2 sm:px-0">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-primary mb-3 sm:mb-4 mx-auto" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">24/7 Monitoring</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Continuous AI surveillance across platforms</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
              <Bot className="w-8 h-8 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4 mx-auto" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Smart Detection</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Advanced algorithms spot infringement instantly</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300 sm:col-span-2 md:col-span-1">
              <Palette className="w-8 h-8 sm:w-12 sm:h-12 text-secondary mb-3 sm:mb-4 mx-auto" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Artist-First</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Built specifically for creative professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;