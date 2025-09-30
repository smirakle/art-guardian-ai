import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobilePushManager } from '@/components/mobile/MobilePushManager';
import MobileAppCTA from '@/components/MobileAppCTA';
import { Smartphone, Bell, Download, QrCode } from 'lucide-react';

export default function MobileIntegration() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Mobile Integration</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Protect your artwork on the go with our mobile app and push notifications
        </p>
      </div>

      <Tabs defaultValue="app" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="app">Mobile App</TabsTrigger>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="features">Mobile Features</TabsTrigger>
        </TabsList>

        <TabsContent value="app" className="space-y-6">
          <MobileAppCTA variant="hero" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download the App
                </CardTitle>
                <CardDescription>
                  Available on iOS and Android devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <QrCode className="h-32 w-32 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Scan QR code to download
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Features</CardTitle>
                <CardDescription>
                  Everything you need in your pocket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Upload and protect artwork instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Real-time threat notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Quick DMCA filing on the go</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Biometric authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Offline mode for viewing protected content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <MobilePushManager />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Native Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fully native iOS and Android apps built with Capacitor for optimal performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Instant Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately when threats are detected, even when the app is closed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Download className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Offline Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View your protected artwork and scan history even without an internet connection
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
