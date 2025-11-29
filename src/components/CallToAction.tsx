import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const CallToAction = () => {
  const { t } = useTranslation();
  const benefits = [
    t('cta.benefits.freeUploads'),
    t('cta.benefits.support'),
    t('cta.benefits.protection')
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <Card className="max-w-md mx-auto mb-6 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="Enter your email" 
                    type="email"
                    className="flex-1 h-11"
                  />
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground h-11 whitespace-nowrap"
                    onClick={() => window.location.href = '/monitoring'}
                  >
                    {t('cta.getStarted')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">10M+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Images Protected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">50K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Artists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Detection Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;