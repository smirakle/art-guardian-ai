import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Settings, 
  Bell, 
  Shield, 
  Camera, 
  Database, 
  RefreshCw,
  Palette,
  Globe,
  Fingerprint,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MobileSettingsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    push_notifications_enabled: true,
    biometric_auth_enabled: false,
    offline_mode_enabled: true,
    auto_sync_enabled: true,
    theme_preference: 'system',
    language_preference: 'en'
  });

  React.useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('mobile_app_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSettings({
        push_notifications_enabled: data.push_notifications_enabled,
        biometric_auth_enabled: data.biometric_auth_enabled,
        offline_mode_enabled: data.offline_mode_enabled,
        auto_sync_enabled: data.auto_sync_enabled,
        theme_preference: data.theme_preference,
        language_preference: data.language_preference
      });
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const { error } = await supabase
      .from('mobile_app_settings')
      .upsert({
        user_id: user.id,
        ...newSettings
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Settings Updated",
        description: "Your mobile app preferences have been saved",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Mobile App Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your mobile app experience
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="sync">Data & Sync</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for copyright violations and important updates
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings.push_notifications_enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('push_notifications_enabled', !settings.push_notifications_enabled)}
                  >
                    {settings.push_notifications_enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Biometric Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Use fingerprint or face recognition to secure app access
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings.biometric_auth_enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('biometric_auth_enabled', !settings.biometric_auth_enabled)}
                  >
                    {settings.biometric_auth_enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Offline Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow app to work without internet connection
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings.offline_mode_enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('offline_mode_enabled', !settings.offline_mode_enabled)}
                  >
                    {settings.offline_mode_enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Auto Sync</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync data when connected to WiFi
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings.auto_sync_enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('auto_sync_enabled', !settings.auto_sync_enabled)}
                  >
                    {settings.auto_sync_enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Theme Preference</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred app theme
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['light', 'dark', 'system'].map((theme) => (
                      <Button
                        key={theme}
                        variant={settings.theme_preference === theme ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('theme_preference', theme)}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred language
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { code: 'en', name: 'English' },
                      { code: 'es', name: 'Español' },
                      { code: 'fr', name: 'Français' },
                      { code: 'de', name: 'Deutsch' }
                    ].map((lang) => (
                      <Button
                        key={lang.code}
                        variant={settings.language_preference === lang.code ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('language_preference', lang.code)}
                      >
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSettingsManager;