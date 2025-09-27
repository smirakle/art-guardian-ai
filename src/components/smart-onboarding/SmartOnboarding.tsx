import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Palette, 
  Building, 
  Camera, 
  Brush,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  Check
} from 'lucide-react';

interface UserType {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  quickActions: string[];
}

interface OnboardingPath {
  steps: OnboardingStep[];
  features: string[];
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: {
    label: string;
    path: string;
  };
  icon: React.ElementType;
}

const userTypes: UserType[] = [
  {
    id: 'digital-artist',
    label: 'Digital Artist',
    description: 'Create and sell digital artwork online',
    icon: Palette,
    quickActions: ['Upload artwork', 'Set up AI protection', 'Monitor usage']
  },
  {
    id: 'photographer',
    label: 'Photographer',
    description: 'Professional photography and image licensing',
    icon: Camera,
    quickActions: ['Upload photos', 'Set up watermarking', 'Track licensing']
  },
  {
    id: 'traditional-artist',
    label: 'Traditional Artist',
    description: 'Traditional art digitization and protection',
    icon: Brush,
    quickActions: ['Upload scans', 'Create certificates', 'Monitor prints']
  },
  {
    id: 'business',
    label: 'Business/Agency',
    description: 'Manage multiple artists or large portfolios',
    icon: Building,
    quickActions: ['Team setup', 'Bulk upload', 'Analytics dashboard']
  }
];

const onboardingPaths: Record<string, OnboardingPath> = {
  'digital-artist': {
    steps: [
      {
        id: 'upload',
        title: 'Upload Your First Digital Artwork',
        description: 'Start with your best piece to see our protection in action',
        action: { label: 'Upload Artwork', path: '/upload' },
        icon: Palette
      },
      {
        id: 'protect',
        title: 'Apply AI Protection',
        description: 'Add invisible protection layers to prevent AI training theft',
        action: { label: 'Protect Now', path: '/ai-protection-settings' },
        icon: Sparkles
      },
      {
        id: 'monitor',
        title: 'Set Up Monitoring',
        description: 'Monitor where your art appears online automatically',
        action: { label: 'Start Monitoring', path: '/monitoring' },
        icon: Camera
      }
    ],
    features: ['AI Style Protection', 'Real-time Monitoring', 'Takedown Automation']
  },
  'photographer': {
    steps: [
      {
        id: 'upload',
        title: 'Upload Your Photography Portfolio',
        description: 'Protect your images with advanced watermarking',
        action: { label: 'Upload Photos', path: '/upload' },
        icon: Camera
      },
      {
        id: 'watermark',
        title: 'Set Up Smart Watermarking',
        description: 'Apply invisible watermarks for licensing protection',
        action: { label: 'Configure Watermarks', path: '/watermarking' },
        icon: Sparkles
      },
      {
        id: 'licensing',
        title: 'Track License Usage',
        description: 'Monitor where your licensed images are being used',
        action: { label: 'View Licensing', path: '/licensing' },
        icon: Building
      }
    ],
    features: ['Image Watermarking', 'License Tracking', 'Usage Analytics']
  },
  'traditional-artist': {
    steps: [
      {
        id: 'scan',
        title: 'Upload Scanned Artwork',
        description: 'Digitize and protect your traditional art pieces',
        action: { label: 'Upload Scans', path: '/upload' },
        icon: Brush
      },
      {
        id: 'certificate',
        title: 'Create Authenticity Certificates',
        description: 'Generate blockchain certificates for provenance',
        action: { label: 'Create Certificates', path: '/blockchain' },
        icon: Sparkles
      },
      {
        id: 'prints',
        title: 'Monitor Print Usage',
        description: 'Track unauthorized printing and reproduction',
        action: { label: 'Monitor Prints', path: '/monitoring' },
        icon: Camera
      }
    ],
    features: ['Authenticity Certificates', 'Print Monitoring', 'Provenance Tracking']
  },
  'business': {
    steps: [
      {
        id: 'team',
        title: 'Set Up Team Management',
        description: 'Invite team members and set permissions',
        action: { label: 'Manage Team', path: '/team' },
        icon: Building
      },
      {
        id: 'bulk',
        title: 'Bulk Upload Portfolio',
        description: 'Upload multiple artworks efficiently',
        action: { label: 'Bulk Upload', path: '/bulk-upload' },
        icon: Palette
      },
      {
        id: 'analytics',
        title: 'View Analytics Dashboard',
        description: 'Monitor protection across all assets',
        action: { label: 'View Analytics', path: '/analytics' },
        icon: Camera
      }
    ],
    features: ['Team Management', 'Bulk Operations', 'Advanced Analytics']
  }
};

const SmartOnboarding: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'selection' | 'steps'>('selection');
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const hasSeenSmartOnboarding = localStorage.getItem('smart-onboarding-completed');
    if (!hasSeenSmartOnboarding && user) {
      setIsVisible(true);
    }
  }, [user]);

  const handleUserTypeSelection = () => {
    if (selectedUserType) {
      setCurrentPhase('steps');
    }
  };

  const onboardingPath = selectedUserType ? onboardingPaths[selectedUserType] : null;
  const currentStepData = onboardingPath?.steps[currentStep];

  const nextStep = () => {
    if (onboardingPath && currentStep < onboardingPath.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentPhase('selection');
    }
  };

  const handleStepAction = (path: string) => {
    localStorage.setItem('smart-onboarding-completed', 'true');
    localStorage.setItem('user-type-preference', selectedUserType);
    setIsVisible(false);
    navigate(path);
  };

  const skipOnboarding = () => {
    localStorage.setItem('smart-onboarding-completed', 'true');
    setIsVisible(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem('smart-onboarding-completed', 'true');
    localStorage.setItem('user-type-preference', selectedUserType);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipOnboarding}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-6">
            <Badge variant="default" className="mb-4 bg-gradient-to-r from-primary to-accent">
              Welcome to TSMO
            </Badge>
            <CardTitle className="text-3xl mb-2">Let's Personalize Your Experience</CardTitle>
            <CardDescription className="text-lg">
              {currentPhase === 'selection' 
                ? 'Tell us about yourself to get the most relevant features'
                : 'Follow these steps to get started quickly'
              }
            </CardDescription>
          </div>

          {currentPhase === 'steps' && onboardingPath && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep + 1} of {onboardingPath.steps.length}</span>
                <span>{Math.round(((currentStep + 1) / onboardingPath.steps.length) * 100)}% Complete</span>
              </div>
              <Progress value={((currentStep + 1) / onboardingPath.steps.length) * 100} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {currentPhase === 'selection' ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center mb-6">What best describes you?</h3>
              
              <RadioGroup value={selectedUserType} onValueChange={setSelectedUserType}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.id} className="relative">
                        <RadioGroupItem
                          value={type.id}
                          id={type.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={type.id}
                          className="flex flex-col p-6 border-2 rounded-lg cursor-pointer hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{type.label}</h4>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Quick Actions:</p>
                            <div className="flex flex-wrap gap-1">
                              {type.quickActions.map((action, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>

              <div className="flex justify-center pt-6">
                <Button
                  onClick={handleUserTypeSelection}
                  disabled={!selectedUserType}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : currentStepData ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {React.createElement(currentStepData.icon, { className: "h-8 w-8 text-primary" })}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{currentStepData.title}</h3>
                <p className="text-muted-foreground text-lg">{currentStepData.description}</p>
              </div>

              {onboardingPath && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Features unlocked for you:</h4>
                  <div className="flex flex-wrap gap-2">
                    {onboardingPath.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-3">
                  {currentStep === (onboardingPath?.steps.length ?? 0) - 1 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={completeOnboarding}
                      >
                        Skip for now
                      </Button>
                      <Button
                        onClick={() => handleStepAction(currentStepData.action.path)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {currentStepData.action.label}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={nextStep}
                      >
                        Skip this step
                      </Button>
                      <Button
                        onClick={() => handleStepAction(currentStepData.action.path)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        {currentStepData.action.label}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartOnboarding;