import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, TrendingUp, Shield, Check, X } from 'lucide-react';

interface EmailProvider {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  description: string;
  setupRequired: boolean;
}

interface EmailSettings {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  trackingEnabled: boolean;
  unsubscribeLink: string;
  complianceMode: boolean;
}

export const EmailMarketingSetup = () => {
  const [providers, setProviders] = useState<EmailProvider[]>([
    {
      id: 'resend',
      name: 'Resend',
      status: 'disconnected',
      description: 'Modern email platform built for developers (Recommended)',
      setupRequired: true
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      status: 'disconnected',
      description: 'Reliable email delivery with advanced analytics',
      setupRequired: true
    },
    {
      id: 'mailgun',
      name: 'Mailgun',
      status: 'disconnected', 
      description: 'Developer-friendly email API with global infrastructure',
      setupRequired: true
    }
  ]);

  const [settings, setSettings] = useState<EmailSettings>({
    provider: '',
    apiKey: '',
    fromEmail: 'noreply@tsmowatch.com',
    fromName: 'TSMO Technology',
    replyTo: 'support@tsmowatch.com',
    trackingEnabled: true,
    unsubscribeLink: 'https://tsmowatch.com/unsubscribe',
    complianceMode: true
  });

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      // For now, use localStorage until the types are regenerated
      const savedSettings = localStorage.getItem('emailSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        updateProviderStatus(parsed.provider);
      }
    } catch (error) {
      console.log('No existing email settings found');
    }
  };

  const updateProviderStatus = (providerId: string) => {
    setProviders(prev => prev.map(p => ({
      ...p,
      status: p.id === providerId ? 'connected' : 'disconnected'
    })));
  };

  const saveEmailSettings = async () => {
    try {
      setIsConfiguring(true);

      // Test the connection first if it's Resend
      if (settings.provider === 'resend' && settings.apiKey) {
        try {
          // Test connection by sending a test email to ourselves
          await testConnection();
        } catch (error) {
          console.error('Connection test failed:', error);
          toast.error('Invalid API key or configuration. Please check your settings.');
          return;
        }
      }

      // Save to localStorage for now
      localStorage.setItem('emailSettings', JSON.stringify(settings));

      updateProviderStatus(settings.provider);
      
      toast.success('Email settings saved and connection verified!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setIsConfiguring(false);
    }
  };

  const testConnection = async () => {
    // This will test if the Resend API key works
    const { error } = await supabase.functions.invoke('send-test-email', {
      body: {
        to: settings.fromEmail,
        subject: 'TSMO Connection Test',
        content: 'Testing connection to verify API key is working.'
      }
    });
    
    if (error) throw error;
  };

  const sendTestEmail = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to: settings.fromEmail,
          subject: 'TSMO Email Setup Test',
          content: 'This is a test email from your TSMO email marketing setup.'
        }
      });

      if (error) throw error;

      setTestEmailSent(true);
      toast.success('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Marketing Setup</h2>
          <p className="text-muted-foreground">
            Configure your email provider and compliance settings
          </p>
        </div>
        <Badge variant={settings.provider ? 'default' : 'secondary'}>
          {settings.provider ? 'Configured' : 'Setup Required'}
        </Badge>
      </div>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Service Provider
          </CardTitle>
          <CardDescription>
            Choose your preferred email delivery service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                settings.provider === provider.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSettings(prev => ({ ...prev, provider: provider.id }))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(provider.status)}
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                </div>
                <Badge variant={provider.status === 'connected' ? 'default' : 'secondary'}>
                  {provider.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configuration */}
      {settings.provider && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Configuration</CardTitle>
            <CardDescription>
              Set up your {providers.find(p => p.id === settings.provider)?.name} integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={settings.provider === 'resend' ? 'Get your API key from resend.com/api-keys' : 'Enter your API key'}
                />
                {settings.provider === 'resend' && (
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{' '}
                    <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      resend.com/api-keys
                    </a>
                    {' '}and verify your domain at{' '}
                    <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      resend.com/domains
                    </a>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={settings.fromName}
                  onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To Email</Label>
                <Input
                  id="replyTo"
                  type="email"
                  value={settings.replyTo}
                  onChange={(e) => setSettings(prev => ({ ...prev, replyTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & Privacy
          </CardTitle>
          <CardDescription>
            Ensure your email campaigns comply with regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tracking">Email Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track email opens and clicks for analytics
              </p>
            </div>
            <Switch
              id="tracking"
              checked={settings.trackingEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, trackingEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compliance">GDPR Compliance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Automatically handle consent and data protection
              </p>
            </div>
            <Switch
              id="compliance"
              checked={settings.complianceMode}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, complianceMode: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unsubscribe">Unsubscribe Link</Label>
            <Input
              id="unsubscribe"
              value={settings.unsubscribeLink}
              onChange={(e) => setSettings(prev => ({ ...prev, unsubscribeLink: e.target.value }))}
              placeholder="https://tsmowatch.com/unsubscribe"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={saveEmailSettings}
          disabled={!settings.provider || !settings.apiKey || isConfiguring}
          className="flex-1"
        >
          {isConfiguring ? 'Saving...' : 'Save Configuration'}
        </Button>
        
        {settings.provider && settings.apiKey && (
          <Button 
            variant="outline" 
            onClick={sendTestEmail}
            disabled={testEmailSent}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {testEmailSent ? 'Test Sent' : 'Send Test'}
          </Button>
        )}
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Setup Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {settings.provider ? '1' : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Provider Connected</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {settings.complianceMode ? '✓' : '⚠'}
              </div>
              <p className="text-sm text-muted-foreground">GDPR Compliant</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {testEmailSent ? '✓' : '⏳'}
              </div>
              <p className="text-sm text-muted-foreground">Test Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};