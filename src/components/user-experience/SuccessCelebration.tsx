import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Sparkles, 
  Trophy,
  ArrowRight,
  X,
  Gift
} from 'lucide-react';

interface CelebrationProps {
  trigger: 'upload' | 'protection' | 'monitoring' | 'legal-action' | 'milestone';
  title?: string;
  description?: string;
  nextAction?: {
    label: string;
    path: string;
  };
  achievement?: {
    title: string;
    description: string;
    icon: React.ElementType;
  };
  onClose?: () => void;
  autoClose?: number;
}

const celebrationConfig = {
  upload: {
    title: '🎉 Artwork Protected!',
    description: 'Your artwork has been successfully uploaded and protection layers have been applied.',
    animation: 'bounce',
    color: 'green',
    nextAction: {
      label: 'Set Up Monitoring',
      path: '/monitoring'
    }
  },
  protection: {
    title: '🛡️ AI Protection Activated!',
    description: 'StyleCloak protection is now active. Your artistic style is protected from AI training.',
    animation: 'pulse',
    color: 'blue',
    nextAction: {
      label: 'View Protection Status',
      path: '/dashboard'
    }
  },
  monitoring: {
    title: '👁️ Monitoring Active!',
    description: 'Real-time monitoring is now scanning the web for unauthorized usage of your art.',
    animation: 'spin',
    color: 'purple',
    nextAction: {
      label: 'View Dashboard',
      path: '/dashboard'
    }
  },
  'legal-action': {
    title: '⚖️ Legal Action Initiated!',
    description: 'DMCA takedown notice has been filed. We\'ll keep you updated on the progress.',
    animation: 'bounce',
    color: 'orange',
    nextAction: {
      label: 'Track Progress',
      path: '/legal'
    }
  },
  milestone: {
    title: '🏆 Milestone Achieved!',
    description: 'Congratulations on reaching a new protection milestone!',
    animation: 'bounce',
    color: 'gold',
    nextAction: {
      label: 'See Achievements',
      path: '/achievements'
    }
  }
};

const SuccessCelebration: React.FC<CelebrationProps> = ({
  trigger,
  title,
  description,
  nextAction,
  achievement,
  onClose,
  autoClose = 8000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const config = celebrationConfig[trigger];

  useEffect(() => {
    // Create particle animation
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(particleArray);

    // Auto close if specified
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleNextAction = () => {
    const action = nextAction || config.nextAction;
    if (action) {
      window.location.href = action.path;
    }
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary rounded-full opacity-70"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float 3s ease-in-out infinite ${particle.id * 0.2}s`
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-primary/30 relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        
        <CardContent className="p-8 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Success Icon */}
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center animate-${config.animation}`}>
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title and Description */}
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title || config.title}
          </h2>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description || config.description}
          </p>

          {/* Achievement Badge */}
          {achievement && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <achievement.icon className="h-6 w-6 text-yellow-600" />
                <Badge className="bg-yellow-100 text-yellow-800">
                  New Achievement
                </Badge>
              </div>
              <h3 className="font-semibold text-yellow-800">{achievement.title}</h3>
              <p className="text-sm text-yellow-700">{achievement.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {(nextAction || config.nextAction) && (
              <Button
                onClick={handleNextAction}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                {(nextAction || config.nextAction)!.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Continue
            </Button>
          </div>

          {/* Sparkle animation */}
          <div className="absolute top-4 right-4">
            <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default SuccessCelebration;