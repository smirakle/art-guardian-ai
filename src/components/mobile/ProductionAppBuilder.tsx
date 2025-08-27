import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Package,
  Store
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuildStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description: string;
  action?: () => void;
}

export const ProductionAppBuilder = () => {
  const { toast } = useToast();
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    {
      id: 'capacitor-sync',
      title: 'Sync Capacitor Project',
      status: 'completed',
      description: 'Project configuration synchronized with native platforms'
    },
    {
      id: 'ios-build',
      title: 'Build iOS App',
      status: 'pending',
      description: 'Generate production-ready iOS application',
      action: () => handleBuild('ios')
    },
    {
      id: 'android-build',
      title: 'Build Android App',
      status: 'pending',
      description: 'Generate production-ready Android APK/AAB',
      action: () => handleBuild('android')
    },
    {
      id: 'app-store-submit',
      title: 'Submit to App Store',
      status: 'pending',
      description: 'Upload and submit iOS app for review'
    },
    {
      id: 'play-store-submit',
      title: 'Submit to Play Store',
      status: 'pending',
      description: 'Upload and submit Android app for review'
    }
  ]);

  const handleBuild = (platform: 'ios' | 'android') => {
    toast({
      title: `Building ${platform} App`,
      description: "This requires a local development environment with Xcode/Android Studio",
    });
    
    // Simulate build process
    setBuildSteps(prev => prev.map(step => 
      step.id === `${platform}-build` 
        ? { ...step, status: 'in-progress' }
        : step
    ));

    setTimeout(() => {
      setBuildSteps(prev => prev.map(step => 
        step.id === `${platform}-build` 
          ? { ...step, status: 'completed' }
          : step
      ));
    }, 3000);
  };

  const getStatusIcon = (status: BuildStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const completedSteps = buildSteps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / buildSteps.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Production App Builder</CardTitle>
              <p className="text-sm text-muted-foreground">
                Build and deploy TSMO mobile apps to app stores
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Build Progress</span>
                <span>{completedSteps}/{buildSteps.length} completed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              {buildSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.action && step.status === 'pending' && (
                    <Button size="sm" onClick={step.action}>
                      Start
                    </Button>
                  )}
                  {step.status === 'completed' && (
                    <Badge variant="secondary">Done</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              App Store Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Deploy to Apple App Store for iOS users
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  App bundle created
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Awaiting submission
                </div>
              </div>
              <Button className="w-full" disabled>
                <ExternalLink className="w-4 h-4 mr-2" />
                Submit to App Store
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Play Store Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Deploy to Google Play Store for Android users
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  APK/AAB generated
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Awaiting submission
                </div>
              </div>
              <Button className="w-full" disabled>
                <ExternalLink className="w-4 h-4 mr-2" />
                Submit to Play Store
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Next Steps for Production</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
              <div>
                <p className="font-medium">Set up developer accounts</p>
                <p className="text-muted-foreground">Register for Apple Developer Program ($99/year) and Google Play Console ($25 one-time)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</div>
              <div>
                <p className="font-medium">Build native apps locally</p>
                <p className="text-muted-foreground">Run `npx cap build ios` and `npx cap build android` with proper development environment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</div>
              <div>
                <p className="font-medium">Upload and submit for review</p>
                <p className="text-muted-foreground">Use Xcode for App Store and Google Play Console for Play Store submissions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};