import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";

const CallToAction = () => {
  const benefits = [
    "Free 5-day trial with full features",
    "No setup fees or hidden costs", 
    "Cancel anytime with one click",
    "24/7 priority support included"
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/10 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Start Protecting Your Art Today
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of artists who have secured their creative future. Get started in less than 2 minutes.
          </p>

          <Card className="max-w-md mx-auto mb-8 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter your email address" 
                    type="email"
                    className="flex-1"
                  />
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                    onClick={() => window.location.href = '/monitoring'}
                  >
                    Get Started
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10M+</div>
              <div className="text-muted-foreground">Images Protected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">50K+</div>
              <div className="text-muted-foreground">Active Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">99.9%</div>
              <div className="text-muted-foreground">Detection Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;