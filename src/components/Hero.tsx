import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Bot, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-12 sm:pt-16">
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto italic">
            {t('hero.audience')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 h-12"
              onClick={() => window.location.href = '/monitoring'}
            >
              {t('hero.getStarted')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              onClick={() => window.open('/upload', '_blank')} 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-8 h-12"
            >
              {t('hero.learnMore')}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="text-center p-4">
              <Shield className="w-10 h-10 text-primary mb-2 mx-auto" />
              <h3 className="font-semibold mb-1">AI Training Protection</h3>
              <p className="text-muted-foreground text-sm">Block unauthorized AI use</p>
            </div>
            
            <div className="text-center p-4">
              <Bot className="w-10 h-10 text-accent mb-2 mx-auto" />
              <h3 className="font-semibold mb-1">Smart Detection</h3>
              <p className="text-muted-foreground text-sm">Instant infringement alerts</p>
            </div>
            
            <div className="text-center p-4">
              <Palette className="w-10 h-10 text-secondary mb-2 mx-auto" />
              <h3 className="font-semibold mb-1">Forgery Detection</h3>
              <p className="text-muted-foreground text-sm">Verify authenticity</p>
            </div>

            <div className="text-center p-4">
              <div className="text-3xl font-bold text-primary mb-2">94.2%</div>
              <h3 className="font-semibold mb-1">Detection Accuracy</h3>
              <p className="text-muted-foreground text-sm">Real-world measured</p>
            </div>

            <div className="text-center p-4">
              <div className="text-3xl font-bold text-primary mb-2">47+</div>
              <h3 className="font-semibold mb-1">Platforms</h3>
              <p className="text-muted-foreground text-sm">Actively scanned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;