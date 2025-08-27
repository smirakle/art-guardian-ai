import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Shield, 
  Star, 
  CheckCircle, 
  Clock,
  Settings,
  Users,
  BarChart,
  Upload,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { ProductionAppBuilder } from '@/components/mobile/ProductionAppBuilder';

const AdminGetApp = () => {
  const { toast } = useToast();
  const [userAgent, setUserAgent] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  
  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));
    
    // SEO setup for admin
    document.title = 'Admin Mobile App Management | TSMO';
  }, []);

  const handleDownload = (platform: string) => {
    if (platform === 'ios') {
      window.open('https://apps.apple.com/app/tsmo-ai-art-protection/id123456789', '_blank');
      toast({
        title: "Redirecting to App Store",
        description: "Opening TSMO app in the App Store...",
      });
    } else if (platform === 'android') {
      window.open('https://play.google.com/store/apps/details?id=app.lovable.cb68a1a443e7440d92e13e847b6930e8', '_blank');
      toast({
        title: "Redirecting to Play Store",
        description: "Opening TSMO app in Google Play Store...",
      });
    } else if (platform === 'testflight') {
      window.open('https://testflight.apple.com/join/your-testflight-code', '_blank');
      toast({
        title: "TestFlight Beta",
        description: "Joining beta testing program...",
      });
    } else if (platform === 'internal') {
      window.open('/mobile-apps/tsmo-internal-build.apk', '_blank');
      toast({
        title: "Internal Build",
        description: "Downloading internal testing build...",
      });
    }
  };

  const handleTestAction = (action: string) => {
    toast({
      title: `${action} Initiated`,
      description: `${action} process has been started.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Admin Header */}
        <div className="text-center mb-12">
          <Badge variant="destructive" className="mb-4 px-4 py-2">
            <Settings className="w-4 h-4 mr-2" />
            Admin Access
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mobile App Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage app store submissions, monitor downloads, and control mobile app deployment.
          </p>
        </div>

        <Tabs defaultValue="store-management" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="store-management">App Stores</TabsTrigger>
            <TabsTrigger value="testing">Testing Builds</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="store-management" className="space-y-6">
            {/* Store Management */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* iOS Admin Card */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>iOS App Store</CardTitle>
                        <CardDescription>App Store Connect Management</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Submission Status: Under Review
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Binary Upload: Complete
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Metadata: Approved
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAction('Review Status Check')}
                      >
                        Check Status
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload('testflight')}
                      >
                        TestFlight
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Android Admin Card */}
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>Google Play Store</CardTitle>
                        <CardDescription>Play Console Management</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Ready for Release</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      APK Upload: Complete
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Store Listing: Approved
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Release: Scheduled
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAction('Release Management')}
                      >
                        Manage Release
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload('internal')}
                      >
                        Internal Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            {/* Testing Builds */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-primary" />
                    <CardTitle>Alpha Testing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Internal team testing builds
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleTestAction('Alpha Build Deploy')}
                  >
                    Deploy Alpha
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>Beta Testing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    External user beta testing
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleTestAction('Beta Build Deploy')}
                  >
                    Deploy Beta
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    <CardTitle>Production</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Production release builds
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleTestAction('Production Deploy')}
                  >
                    Deploy Production
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Download Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">iOS Downloads</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Android Downloads</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">TestFlight Installs</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>App Store Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">App Store Category</span>
                      <span className="text-sm text-muted-foreground">Not Ranked</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Play Store Category</span>
                      <span className="text-sm text-muted-foreground">Not Ranked</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deployment">
            {/* Production App Builder */}
            <ProductionAppBuilder />
          </TabsContent>
        </Tabs>

        {/* Mobile Experience Preview */}
        <MobileContainer />
      </div>
    </div>
  );
};

export default AdminGetApp;