import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Smartphone, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const MobilePushManager: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    threatAlerts: true,
    scanComplete: true,
    legalUpdates: true,
    marketingMessages: false,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('mobile_app_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setIsSubscribed(data.push_notifications_enabled || false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubscribe = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to enable push notifications",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setIsSubscribed(true);
          
          // Save settings to database
          await supabase
            .from('mobile_app_settings')
            .upsert({
              user_id: user.id,
              push_notifications_enabled: true,
              updated_at: new Date().toISOString()
            });

          toast({
            title: "Push notifications enabled",
            description: "You'll receive alerts about threats and scan results",
          });
        }
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      toast({
        title: "Failed to enable notifications",
        description: "Please try again or check browser permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = () => {
    if (isSubscribed && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('TSMO Alert', {
        body: 'This is a test notification from Art Guardian AI',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      toast({
        title: "Test notification sent",
        description: "Check your device for the notification",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Push Notifications
        </CardTitle>
        <CardDescription>
          Get instant alerts about threats, scans, and important updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Push Notification Status</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'Enabled - You will receive alerts' : 'Disabled - Enable to receive alerts'}
              </p>
            </div>
          </div>
          {!isSubscribed ? (
            <Button onClick={handleSubscribe} disabled={loading}>
              Enable Notifications
            </Button>
          ) : (
            <Check className="h-5 w-5 text-primary" />
          )}
        </div>

        {isSubscribed && (
          <>
            <div className="space-y-4">
              <h4 className="font-medium">Notification Preferences</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="threat-alerts" className="flex flex-col gap-1">
                  <span>Threat Alerts</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    High-priority copyright violations and AI training detections
                  </span>
                </Label>
                <Switch
                  id="threat-alerts"
                  checked={settings.threatAlerts}
                  onCheckedChange={() => toggleSetting('threatAlerts')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="scan-complete" className="flex flex-col gap-1">
                  <span>Scan Complete</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Notify when artwork scans are completed
                  </span>
                </Label>
                <Switch
                  id="scan-complete"
                  checked={settings.scanComplete}
                  onCheckedChange={() => toggleSetting('scanComplete')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="legal-updates" className="flex flex-col gap-1">
                  <span>Legal Updates</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    DMCA filing status and legal case progress
                  </span>
                </Label>
                <Switch
                  id="legal-updates"
                  checked={settings.legalUpdates}
                  onCheckedChange={() => toggleSetting('legalUpdates')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="marketing" className="flex flex-col gap-1">
                  <span>Product Updates</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    New features, tips, and platform improvements
                  </span>
                </Label>
                <Switch
                  id="marketing"
                  checked={settings.marketingMessages}
                  onCheckedChange={() => toggleSetting('marketingMessages')}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={testNotification}
              className="w-full"
            >
              Send Test Notification
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
