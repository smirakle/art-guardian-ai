import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Activity, 
  Shield, 
  Check, 
  Sparkles,
  X
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    path: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to TSMO Art Guardian",
    description: "Your personal AI-powered art protection system. Let's get you started with protecting your creative work.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Upload Your Artwork",
    description: "Start by uploading your digital art. Our AI will analyze and create a unique fingerprint for protection.",
    icon: Upload,
    action: {
      label: "Upload Now",
      path: "/upload"
    }
  },
  {
    id: 3,
    title: "Monitor Your Art",
    description: "Track how your artwork is performing online with real-time monitoring and threat detection.",
    icon: Activity,
    action: {
      label: "View Dashboard",
      path: "/monitoring"
    }
  },
  {
    id: 4,
    title: "Deep Security Scanning",
    description: "Run comprehensive scans across the web to detect unauthorized usage and protect your intellectual property.",
    icon: Shield,
    action: {
      label: "Run Deep Scan",
      path: "/deep-scan"
    }
  }
];

const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Show onboarding for new users
    if (user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (path: string) => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    navigate(path);
  };

  const skipTour = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
  };

  const completeTour = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
  };

  if (!isVisible || !user) return null;

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="absolute right-0 top-0 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <Badge variant="secondary" className="mx-auto mb-4">
            Step {currentStep + 1} of {onboardingSteps.length}
          </Badge>
          
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          
          <CardTitle className="text-xl">{step.title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {step.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep === onboardingSteps.length - 1 ? (
              <Button
                onClick={completeTour}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Get Started
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {step.action && (
            <div className="pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => handleAction(step.action!.path)}
                className="w-full"
              >
                {step.action.label}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;