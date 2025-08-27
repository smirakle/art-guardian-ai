import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, QrCode, Shield, Star, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MobileNotificationCenter from '@/components/mobile/MobileNotificationCenter';
import MobileUploadManager from '@/components/mobile/MobileUploadManager';

const CustomerGetApp = () => {
  const { toast } = useToast();
  const [userAgent, setUserAgent] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  
  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));
    
    // SEO setup
    document.title = 'Download TSMO Mobile App | AI Art Protection On-The-Go';
    
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta('description', 'Download the TSMO mobile app for iOS and Android. Protect your art, monitor violations, and manage your portfolio anywhere.');
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
    }
  };

  const handleQRDownload = () => {
    toast({
      title: "QR Code",
      description: "Scan with your phone's camera to download the app.",
    });
  };

  const handleNotifyMe = () => {
    toast({
      title: "Notification Set",
      description: "We'll notify you when the app is available for download!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile App
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Get TSMO Mobile
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take your art protection everywhere. Monitor violations, manage portfolios, and stay protected on-the-go.
          </p>
        </div>

        {/* Platform Detection & Downloads */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* iOS Card */}
          <Card className={`${isIOS ? 'ring-2 ring-primary' : ''} hover:shadow-lg transition-all duration-300`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>iOS App</CardTitle>
                  <CardDescription>iPhone & iPad</CardDescription>
                </div>
                {isIOS && (
                  <Badge variant="default" className="ml-auto">
                    Your Device
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Compatible with iOS 14.0+
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Optimized for iPhone & iPad
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Native iOS performance
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleDownload('ios')}
                    variant="default"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download from App Store
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleNotifyMe}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-400 text-center">
                    ✓ Available on App Store
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Android Card */}
          <Card className={`${isAndroid ? 'ring-2 ring-primary' : ''} hover:shadow-lg transition-all duration-300`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Android App</CardTitle>
                  <CardDescription>Phones & Tablets</CardDescription>
                </div>
                {isAndroid && (
                  <Badge variant="default" className="ml-auto">
                    Your Device
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Compatible with Android 8.0+
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Works on phones & tablets
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Optimized performance
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleDownload('android')}
                    variant="default"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download from Play Store
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleQRDownload}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-400 text-center">
                    ✓ Available on Google Play
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Real-Time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get instant notifications when your art is found online. Never miss a violation again.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <Download className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Portfolio Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload, organize, and protect your artwork directly from your mobile device.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Native Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Optimized mobile interface with native performance and offline capabilities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <Card className="text-center mb-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <QrCode className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle>Quick Download</CardTitle>
            <CardDescription>Scan to download on your mobile device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <div className="w-32 h-32 bg-black/10 rounded flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Open your camera app and point it at the QR code above
            </p>
            <Button onClick={handleNotifyMe} variant="outline">
              Notify Me When Available
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <MobileUploadManager />
          <MobileNotificationCenter />
        </div>

        {/* System Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">iOS Requirements</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• iOS 14.0 or later</li>
                  <li>• iPhone 6s or newer</li>
                  <li>• iPad (5th generation) or newer</li>
                  <li>• 100MB available storage</li>
                  <li>• Internet connection required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Android Requirements</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Android 8.0 (API level 26) or higher</li>
                  <li>• 2GB RAM minimum</li>
                  <li>• 100MB available storage</li>
                  <li>• Internet connection required</li>
                  <li>• Camera permissions (for uploads)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerGetApp;