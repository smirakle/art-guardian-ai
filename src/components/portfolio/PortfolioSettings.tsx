import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, Clock, Mail, Webhook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  name: string;
  alert_settings: Record<string, any>;
  monitoring_enabled: boolean;
}

interface GlobalSettings {
  email_notifications: boolean;
  webhook_notifications: boolean;
  webhook_url: string;
  default_scan_frequency: number;
  auto_resolve_low_risk: boolean;
  notification_threshold: string;
}

export function PortfolioSettings() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    email_notifications: true,
    webhook_notifications: false,
    webhook_url: '',
    default_scan_frequency: 60,
    auto_resolve_low_risk: false,
    notification_threshold: 'medium'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolios();
    loadGlobalSettings();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name, alert_settings, monitoring_enabled')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const portfoliosWithSettings = (data || []).map(portfolio => ({
        ...portfolio,
        alert_settings: (portfolio.alert_settings as Record<string, any>) || {}
      }));
      
      setPortfolios(portfoliosWithSettings);
      
      if (data && data.length > 0) {
        setSelectedPortfolio(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalSettings = () => {
    // Load global portfolio settings from storage
    const saved = localStorage.getItem('portfolio_global_settings');
    if (saved) {
      setGlobalSettings(JSON.parse(saved));
    }
  };

  const saveGlobalSettings = async () => {
    try {
      // Save to localStorage for now - in real app, save to database
      localStorage.setItem('portfolio_global_settings', JSON.stringify(globalSettings));
      
      toast({
        title: "Success",
        description: "Global settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving global settings:', error);
      toast({
        title: "Error",
        description: "Failed to save global settings",
        variant: "destructive",
      });
    }
  };

  const updatePortfolioSettings = async (portfolioId: string, settings: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({ alert_settings: settings })
        .eq('id', portfolioId);

      if (error) throw error;

      setPortfolios(portfolios.map(p => 
        p.id === portfolioId ? { ...p, alert_settings: settings } : p
      ));

      toast({
        title: "Success",
        description: "Portfolio settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating portfolio settings:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio settings",
        variant: "destructive",
      });
    }
  };

  const selectedPortfolioData = portfolios.find(p => p.id === selectedPortfolio);

  const defaultPortfolioSettings = {
    email: true,
    webhook: false,
    severity_threshold: 'medium',
    auto_resolve_low: false,
    scan_frequency: 60,
    platforms: ['all']
  };

  const portfolioSettings = selectedPortfolioData?.alert_settings || defaultPortfolioSettings;

  const updatePortfolioSetting = (key: string, value: any) => {
    if (!selectedPortfolio) return;
    
    const newSettings = { ...portfolioSettings, [key]: value };
    updatePortfolioSettings(selectedPortfolio, newSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Portfolio Settings
        </h2>
        <p className="text-muted-foreground">Configure monitoring and notification preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Global Settings
            </CardTitle>
            <CardDescription>Default settings for all portfolios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Settings */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch
                  checked={globalSettings.email_notifications}
                  onCheckedChange={(checked) => 
                    setGlobalSettings({ ...globalSettings, email_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Webhook Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send alerts to external service</p>
                </div>
                <Switch
                  checked={globalSettings.webhook_notifications}
                  onCheckedChange={(checked) => 
                    setGlobalSettings({ ...globalSettings, webhook_notifications: checked })
                  }
                />
              </div>

              {globalSettings.webhook_notifications && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={globalSettings.webhook_url}
                    onChange={(e) => 
                      setGlobalSettings({ ...globalSettings, webhook_url: e.target.value })
                    }
                    placeholder="https://your-webhook-endpoint.com"
                  />
                </div>
              )}
            </div>

            {/* Monitoring Settings */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Monitoring
              </h4>

              <div className="space-y-2">
                <Label htmlFor="scan-frequency">Default Scan Frequency (minutes)</Label>
                <Select
                  value={globalSettings.default_scan_frequency.toString()}
                  onValueChange={(value) => 
                    setGlobalSettings({ ...globalSettings, default_scan_frequency: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="360">6 hours</SelectItem>
                    <SelectItem value="720">12 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Notification Threshold</Label>
                <Select
                  value={globalSettings.notification_threshold}
                  onValueChange={(value) => 
                    setGlobalSettings({ ...globalSettings, notification_threshold: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low and above</SelectItem>
                    <SelectItem value="medium">Medium and above</SelectItem>
                    <SelectItem value="high">High only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-resolve Low Risk</Label>
                  <p className="text-sm text-muted-foreground">Automatically resolve low-risk alerts</p>
                </div>
                <Switch
                  checked={globalSettings.auto_resolve_low_risk}
                  onCheckedChange={(checked) => 
                    setGlobalSettings({ ...globalSettings, auto_resolve_low_risk: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={saveGlobalSettings} className="w-full">
              Save Global Settings
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio-Specific Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio-Specific Settings</CardTitle>
            <CardDescription>Override global settings for individual portfolios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="portfolio-select">Select Portfolio</Label>
              <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPortfolioData && (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{selectedPortfolioData.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selectedPortfolioData.monitoring_enabled ? "default" : "secondary"}>
                        {selectedPortfolioData.monitoring_enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications for this portfolio</p>
                    </div>
                    <Switch
                      checked={portfolioSettings.email}
                      onCheckedChange={(checked) => updatePortfolioSetting('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Webhook Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send webhook notifications for this portfolio</p>
                    </div>
                    <Switch
                      checked={portfolioSettings.webhook}
                      onCheckedChange={(checked) => updatePortfolioSetting('webhook', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Threshold</Label>
                    <Select
                      value={portfolioSettings.severity_threshold}
                      onValueChange={(value) => updatePortfolioSetting('severity_threshold', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low and above</SelectItem>
                        <SelectItem value="medium">Medium and above</SelectItem>
                        <SelectItem value="high">High only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Scan Frequency</Label>
                    <Select
                      value={portfolioSettings.scan_frequency?.toString() || '60'}
                      onValueChange={(value) => updatePortfolioSetting('scan_frequency', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-resolve Low Risk</Label>
                      <p className="text-sm text-muted-foreground">Automatically resolve low-risk alerts for this portfolio</p>
                    </div>
                    <Switch
                      checked={portfolioSettings.auto_resolve_low}
                      onCheckedChange={(checked) => updatePortfolioSetting('auto_resolve_low', checked)}
                    />
                  </div>
                </div>
              </>
            )}

            {portfolios.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No portfolios available. Create a portfolio first.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}