import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Shield, 
  Eye, 
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  action: {
    label: string;
    path: string;
  };
  badge?: string;
}

const steps: Step[] = [
  {
    icon: Upload,
    title: 'Upload Your First Artwork',
    description: 'Start protecting your creative work in seconds with our AI-powered system',
    action: {
      label: 'Upload Now',
      path: '/upload'
    },
    badge: '2 min'
  },
  {
    icon: Shield,
    title: 'Apply AI Protection',
    description: 'Add invisible protection layers to prevent unauthorized AI training',
    action: {
      label: 'Protect',
      path: '/protection-hub'
    },
    badge: 'Automatic'
  },
  {
    icon: Eye,
    title: 'Start Monitoring',
    description: 'Monitor where your art appears online with real-time scanning',
    action: {
      label: 'Start Monitoring',
      path: '/monitoring-hub'
    },
    badge: '24/7'
  }
];

const benefits = [
  'Blockchain ownership certificates',
  'Automated DMCA takedown filing',
  'Real-time threat detection',
  'Legal document generation',
  'Deepfake protection'
];

export const DashboardEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <Badge className="mb-3 bg-gradient-to-r from-primary to-accent">
              Welcome to TSMO
            </Badge>
            <CardTitle className="text-3xl mb-2">Protect Your Creative Work</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Get started in 3 simple steps. Your artwork deserves enterprise-level protection.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      {step.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {step.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate(step.action.path)}
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                      variant="outline"
                    >
                      {step.action.label}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              What You Get
            </CardTitle>
            <CardDescription>
              Enterprise-level protection for creators of all sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>See your protection in action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Protected Assets</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-blue-500">0</div>
                <div className="text-sm text-muted-foreground">Active Scans</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-green-500">Ready</div>
                <div className="text-sm text-muted-foreground">System Status</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-purple-500">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
            <Button
              onClick={() => navigate('/upload')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
