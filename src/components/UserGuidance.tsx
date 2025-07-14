import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Upload, 
  Activity, 
  Shield, 
  ChevronRight,
  FileImage,
  Zap,
  X
} from 'lucide-react';

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: {
    label: string;
    path: string;
  };
  status: 'pending' | 'in-progress' | 'completed';
}

const UserGuidance = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock user progress - in real app, this would come from user data
  const [steps] = useState<GuidanceStep[]>([
    {
      id: 'upload',
      title: 'Upload Your First Artwork',
      description: 'Start protecting your art by uploading your first piece',
      icon: Upload,
      action: { label: 'Upload Now', path: '/upload' },
      status: 'pending'
    },
    {
      id: 'monitor',
      title: 'Set Up Monitoring',
      description: 'Configure real-time monitoring for your artwork',
      icon: Activity,
      action: { label: 'View Dashboard', path: '/monitoring' },
      status: 'pending'
    },
    {
      id: 'scan',
      title: 'Run Your First Deep Scan',
      description: 'Perform a comprehensive scan to detect any existing violations',
      icon: Shield,
      action: { label: 'Start Scan', path: '/deep-scan' },
      status: 'pending'
    }
  ]);

  const handleAction = (path: string) => {
    navigate(path);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '⏳';
      default: return '○';
    }
  };

  if (!isVisible || !user) return null;

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Quick Start Guide</CardTitle>
              <CardDescription>
                Get the most out of your art protection system
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(step.action.path)}
                  className="flex items-center gap-2"
                >
                  {step.action.label}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">Complete all steps to maximize protection</span>
          </div>
          <Badge variant="secondary">
            0 of {steps.length} completed
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGuidance;