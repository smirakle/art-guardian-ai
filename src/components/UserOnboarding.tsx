import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Shield, Eye, ArrowRight, X, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  route?: string;
}

interface UserOnboardingProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, onDismiss }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'upload',
      title: 'Upload Your First Artwork',
      description: 'Start protecting your creative work with AI-powered monitoring',
      action: 'Upload Now',
      icon: Upload,
      completed: false,
      route: '/upload'
    },
    {
      id: 'monitoring',
      title: 'Set Up Monitoring',
      description: 'Configure real-time monitoring for comprehensive protection',
      action: 'View Dashboard',
      icon: Eye,
      completed: false,
      route: '/dashboard'
    },
    {
      id: 'protection',
      title: 'Review Protection Status',
      description: 'Check your protection score and active monitoring',
      action: 'View Protection',
      icon: Shield,
      completed: false,
      route: '/dashboard'
    }
  ]);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('tsmo-onboarding-completed');
    if (hasSeenOnboarding) {
      setShowOnboarding(false);
    }
  }, []);

  const handleStepAction = (step: OnboardingStep) => {
    if (step.route) {
      navigate(step.route);
    }
    
    // Mark step as completed
    setSteps(prev => prev.map(s => 
      s.id === step.id ? { ...s, completed: true } : s
    ));
    
    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('tsmo-onboarding-completed', 'true');
    setShowOnboarding(false);
    onComplete?.();
  };

  const dismissOnboarding = () => {
    localStorage.setItem('tsmo-onboarding-dismissed', 'true');
    setShowOnboarding(false);
    onDismiss?.();
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (!showOnboarding || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissOnboarding}
            className="absolute right-2 top-2"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2">
              Welcome to TSMO
            </Badge>
            <CardTitle className="text-2xl">Get Started in 3 Easy Steps</CardTitle>
            <p className="text-muted-foreground mt-2">
              Let's set up your art protection in just a few minutes
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedSteps}/{steps.length} completed</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrentStep = index === currentStep;
            const isCompleted = step.completed;
            const isPending = index > currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                  isCurrentStep
                    ? 'border-primary bg-primary/5'
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isCurrentStep ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {isCurrentStep && (
                    <Button
                      onClick={() => handleStepAction(step)}
                      className="mt-3"
                      size="sm"
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Step {index + 1}
                </div>
              </div>
            );
          })}
          
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={dismissOnboarding}
            >
              Skip for now
            </Button>
            
            {completedSteps === steps.length && (
              <Button
                onClick={completeOnboarding}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOnboarding;