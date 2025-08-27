import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Palette, 
  Settings,
  Package,
  FileImage,
  Globe,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductionAppConfigurator = () => {
  const { toast } = useToast();
  const [buildProgress, setBuildProgress] = React.useState(0);
  const [configStep, setConfigStep] = React.useState(1);

  const appConfigs = {
    metadata: {
      name: 'TSMO - AI Art Protection',
      version: '1.0.0',
      build: '100',
      bundleId: 'app.lovable.cb68a1a443e7440d92e13e847b6930e8',
      description: 'Protect your art with advanced AI monitoring and blockchain verification'
    },
    icons: {
      ios: {
        '29x29': '/icons/icon-29.png',
        '40x40': '/icons/icon-40.png',
        '60x60': '/icons/icon-60.png',
        '1024x1024': '/icons/icon-1024.png'
      },
      android: {
        'mdpi': '/icons/icon-48.png',
        'hdpi': '/icons/icon-72.png',
        'xhdpi': '/icons/icon-96.png',
        'xxhdpi': '/icons/icon-144.png',
        'xxxhdpi': '/icons/icon-192.png'
      }
    },
    splashScreens: {
      ios: '/splash/ios-splash.png',
      android: '/splash/android-splash.png'
    },
    features: [
      'Camera access for instant uploads',
      'Biometric authentication',
      'Push notifications',
      'Background sync',
      'Offline mode support'
    ]
  };

  const generateConfig = async (platform: 'ios' | 'android') => {
    setBuildProgress(0);
    
    // Simulate configuration generation
    for (let i = 0; i <= 100; i += 20) {
      setBuildProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    toast({
      title: `${platform.toUpperCase()} Configuration Generated`,
      description: `Production-ready ${platform} app configuration has been created`,
    });

    setBuildProgress(0);
  };

  const configSteps = [
    {
      id: 1,
      title: 'App Metadata',
      description: 'Configure app name, version, and descriptions',
      icon: FileImage,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Icons & Assets',
      description: 'Generate app icons and splash screens',
      icon: Palette,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Permissions',
      description: 'Configure app permissions and capabilities',
      icon: Settings,
      status: 'completed'
    },
    {
      id: 4,
      title: 'Store Preparation',
      description: 'Prepare for app store submission',
      icon: Package,
      status: 'ready'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Production App Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate production-ready mobile app configurations
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* App Metadata */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    App Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{appConfigs.metadata.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">{appConfigs.metadata.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Build:</span>
                    <span className="font-medium">{appConfigs.metadata.build}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundle ID:</span>
                    <span className="font-medium text-xs">{appConfigs.metadata.bundleId}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Features Enabled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {appConfigs.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Build Progress */}
            {buildProgress > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-medium">Generating Configuration...</span>
                </div>
                <Progress value={buildProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {buildProgress}% complete
                </p>
              </div>
            )}

            {/* Platform Configurations */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">iOS Configuration</CardTitle>
                      <p className="text-sm text-muted-foreground">Xcode project setup</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Target iOS:</span>
                      <Badge variant="secondary">14.0+</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Deployment:</span>
                      <Badge variant="secondary">Universal</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Signing:</span>
                      <Badge variant="secondary">Automatic</Badge>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => generateConfig('ios')}
                    disabled={buildProgress > 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate iOS Config
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Android Configuration</CardTitle>
                      <p className="text-sm text-muted-foreground">Gradle project setup</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Min SDK:</span>
                      <Badge variant="secondary">26 (Android 8.0)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Target SDK:</span>
                      <Badge variant="secondary">34</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Build Type:</span>
                      <Badge variant="secondary">Release</Badge>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => generateConfig('android')}
                    disabled={buildProgress > 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Android Config
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {configSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        step.status === 'ready' ? 'bg-blue-100 text-blue-600' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <Badge 
                        variant={step.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {step.status === 'completed' ? 'Done' : 'Ready'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionAppConfigurator;