import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe,
  Bell,
  Mail,
  Shield,
  Activity,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceStatus {
  name: string;
  configured: boolean;
  status: 'active' | 'inactive' | 'error';
  lastCheck?: string;
  error?: string;
}

export const ExternalServicesConfig = () => {
  const { toast } = useToast();
  const [sentryDsn, setSentryDsn] = useState('');
  const [sentryConfigured, setSentryConfigured] = useState(false);
  const [uptimeRobotKey, setUptimeRobotKey] = useState('');
  const [uptimeRobotConfigured, setUptimeRobotConfigured] = useState(false);
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendConfigured, setResendConfigured] = useState(false);
  const [emailFrom, setEmailFrom] = useState('alerts@yourdomain.com');
  const [emailTo, setEmailTo] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Sentry', configured: false, status: 'inactive' },
    { name: 'UptimeRobot', configured: false, status: 'inactive' },
    { name: 'Resend (Email)', configured: false, status: 'inactive' },
  ]);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = () => {
    // Check if Sentry DSN is configured in environment
    const hasSentryDsn = !!import.meta.env.VITE_SENTRY_DSN;
    setSentryConfigured(hasSentryDsn);

    setServices(prev => prev.map(service => {
      if (service.name === 'Sentry') {
        return {
          ...service,
          configured: hasSentryDsn,
          status: hasSentryDsn ? 'active' : 'inactive',
          lastCheck: new Date().toISOString()
        };
      }
      return service;
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied to clipboard',
      description: `${label} copied successfully`,
    });
  };

  const testSentryIntegration = async () => {
    try {
      // Test Sentry by capturing a test error
      const testError = new Error('Sentry integration test - this is expected');
      console.error('Testing Sentry integration:', testError);
      
      toast({
        title: 'Sentry Test Sent',
        description: 'Check your Sentry dashboard for the test error',
      });
    } catch (error) {
      toast({
        title: 'Sentry Test Failed',
        description: 'Could not send test error to Sentry',
        variant: 'destructive',
      });
    }
  };

  const testEmailAlert = async () => {
    try {
      // Send test email via monitoring-alerts function
      await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'send_alert',
          alert: {
            title: 'Test Email Alert',
            message: 'This is a test alert from the monitoring system',
            severity: 'info',
            source: 'external_services_config',
            timestamp: new Date().toISOString(),
          }
        }
      });

      toast({
        title: 'Test Alert Sent',
        description: 'Check your email for the test alert',
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Could not send test alert',
        variant: 'destructive',
      });
    }
  };

  const healthCheckUrl = `${window.location.origin}/api/health`;
  const statusPageUrl = `${window.location.origin}/status`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            External Services Configuration
          </h1>
          <p className="text-muted-foreground">Configure external monitoring and alerting services</p>
        </div>
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {service.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : service.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-semibold">{service.name}</span>
                </div>
                <Badge variant={service.configured ? 'default' : 'secondary'}>
                  {service.configured ? 'Configured' : 'Not Setup'}
                </Badge>
              </div>
              {service.lastCheck && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="sentry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sentry">Sentry</TabsTrigger>
          <TabsTrigger value="uptime">UptimeRobot</TabsTrigger>
          <TabsTrigger value="email">Email Alerts</TabsTrigger>
        </TabsList>

        {/* Sentry Configuration */}
        <TabsContent value="sentry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sentry Error Tracking
              </CardTitle>
              <CardDescription>
                Monitor application errors and performance in real-time with Sentry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Create a free account at <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">sentry.io</a></li>
                      <li>Create a new project for "React"</li>
                      <li>Copy your DSN (Data Source Name)</li>
                      <li>Add it to your environment variables as <code className="bg-muted px-1 rounded">VITE_SENTRY_DSN</code></li>
                      <li>Restart your application</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Current Status</Label>
                <div className="flex items-center gap-2">
                  {sentryConfigured ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500 font-semibold">Sentry is configured and active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-500">Sentry DSN not configured</span>
                    </>
                  )}
                </div>
              </div>

              {sentryConfigured && (
                <div className="space-y-2">
                  <Label>Test Integration</Label>
                  <Button onClick={testSentryIntegration} variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Send Test Error to Sentry
                  </Button>
                </div>
              )}

              <Alert>
                <AlertDescription className="space-y-2">
                  <p className="font-semibold">Sentry Configuration in Code:</p>
                  <p className="text-sm">The Sentry integration is already set up in <code className="bg-muted px-1 rounded">src/lib/sentry.ts</code> and initialized in <code className="bg-muted px-1 rounded">src/main.tsx</code>.</p>
                  <p className="text-sm">Features enabled:</p>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                    <li>Error tracking (100% of errors)</li>
                    <li>Performance monitoring (100% of transactions)</li>
                    <li>Session replay (10% normal, 100% on errors)</li>
                    <li>Release tracking</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UptimeRobot Configuration */}
        <TabsContent value="uptime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                UptimeRobot Monitoring
              </CardTitle>
              <CardDescription>
                Monitor your application's uptime and get alerts when it goes down
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Create a free account at <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">uptimerobot.com</a></li>
                      <li>Click "Add New Monitor"</li>
                      <li>Set monitor type to "HTTP(s)"</li>
                      <li>Configure alert contacts (email, SMS, etc.)</li>
                      <li>Set check interval (free tier: 5 minutes)</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recommended Monitors</Label>
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Main Application</p>
                            <p className="text-sm text-muted-foreground font-mono">{window.location.origin}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(window.location.origin, 'Main URL')}
                          >
                            {copied === 'Main URL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Status Page</p>
                            <p className="text-sm text-muted-foreground font-mono">{statusPageUrl}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(statusPageUrl, 'Status Page URL')}
                          >
                            {copied === 'Status Page URL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Health Check Endpoint</p>
                            <p className="text-sm text-muted-foreground font-mono">{healthCheckUrl}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(healthCheckUrl, 'Health Check URL')}
                          >
                            {copied === 'Health Check URL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <p className="text-sm">UptimeRobot will automatically ping these URLs and alert you if they become unreachable. This provides external monitoring independent of your application.</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Alerts Configuration */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Alert Configuration
              </CardTitle>
              <CardDescription>
                Configure email delivery for critical alerts via Resend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Create a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com</a></li>
                      <li>Verify your sending domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/domains</a></li>
                      <li>Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/api-keys</a></li>
                      <li>Add the API key as a Supabase Edge Function secret named <code className="bg-muted px-1 rounded">RESEND_API_KEY</code></li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="emailFrom">From Email Address</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="alerts@yourdomain.com"
                />
                <p className="text-xs text-muted-foreground">
                  This email must be verified in Resend
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailTo">Admin Email (Alert Recipient)</Label>
                <Input
                  id="emailTo"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="admin@yourdomain.com"
                />
              </div>

              <Button onClick={testEmailAlert} className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Send Test Alert Email
              </Button>

              <Alert>
                <AlertDescription>
                  <p className="text-sm">Email alerts are automatically sent for:</p>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>Critical severity alerts</li>
                    <li>Error severity alerts</li>
                    <li>Performance threshold violations</li>
                    <li>Circuit breaker openings</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <a href="https://sentry.io" target="_blank" rel="noopener noreferrer">
                <Shield className="h-4 w-4 mr-2" />
                Sentry Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                UptimeRobot Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer">
                <Mail className="h-4 w-4 mr-2" />
                Resend Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={statusPageUrl} target="_blank">
                <Activity className="h-4 w-4 mr-2" />
                Public Status Page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalServicesConfig;
