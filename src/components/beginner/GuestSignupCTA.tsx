import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuestSignupCTAProps {
  variant?: 'inline' | 'banner' | 'compact';
  context?: 'findings' | 'dashboard' | 'empty';
}

export const GuestSignupCTA = ({ variant = 'inline', context = 'findings' }: GuestSignupCTAProps) => {
  const navigate = useNavigate();

  const messages = {
    findings: {
      title: "Save your findings & get alerts",
      description: "Create a free account to track all issues, get email alerts when new ones are found, and access tools to remove them."
    },
    dashboard: {
      title: "Your data expires in 7 days",
      description: "Create a free account to save your protected artwork permanently and monitor it 24/7."
    },
    empty: {
      title: "Monitor your art 24/7",
      description: "Create a free account to upload your artwork, protect it from AI training, and get alerts if anyone uses it."
    }
  };

  const message = messages[context];

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Clock className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Guest Mode</p>
          <p className="text-xs text-muted-foreground">Data expires in 7 days</p>
        </div>
        <Button size="sm" onClick={() => navigate('/auth')}>
          <UserPlus className="h-4 w-4 mr-1" />
          Sign Up
        </Button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{message.title}</p>
            <p className="text-xs text-muted-foreground">{message.description}</p>
          </div>
        </div>
        <Button onClick={() => navigate('/auth')} className="flex-shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Create Free Account
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">{message.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          {message.description}
        </p>
        <Button onClick={() => navigate('/auth')} size="lg">
          <UserPlus className="h-5 w-5 mr-2" />
          Create Free Account
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          No credit card required • Takes 30 seconds
        </p>
      </CardContent>
    </Card>
  );
};
