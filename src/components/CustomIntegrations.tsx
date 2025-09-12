import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FeatureGuard from '@/components/FeatureGuard';
import { 
  Plus, 
  Trash2, 
  Settings, 
  ExternalLink, 
  Copy, 
  Key, 
  Webhook,
  Database,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomIntegration {
  id: string;
  user_id: string;
  name: string;
  type: string;
  status: string;
  endpoint_url?: string;
  api_key: string;
  config: any;
  created_at: string;
  updated_at: string;
  last_used?: string;
}

export const CustomIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<CustomIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<CustomIntegration | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const [connections, setConnections] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    type: 'webhook' as const,
    endpoint_url: '',
    config: {
      events: [] as string[],
      auth_method: 'bearer',
      custom_headers: {} as Record<string, string>,
      data_format: 'json',
      retry_attempts: 3
    }
  });

  useEffect(() => {
    loadIntegrations();
    
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const pendingProvider = localStorage.getItem('pendingOAuthProvider');
    
    if (connected && pendingProvider) {
      console.log(`OAuth callback detected for ${connected}`);
      localStorage.removeItem('pendingOAuthProvider');
      toast({
        title: "Integration Connected",
        description: `Successfully connected to ${connected}. Refreshing integrations...`,
      });
      // Refresh integrations list
      setTimeout(() => {
        loadIntegrations();
      }, 1000);
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('connected');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // SEO - title, meta description, canonical
  useEffect(() => {
    document.title = 'TSMO Integrations – Adobe & Buffer';
    const content = 'Connect Adobe Creative Cloud and Buffer to automate protection.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = content;
      document.head.appendChild(m);
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('user_integrations')
        .select('provider,status')
        .eq('user_id', user.id);
      if (!error && data) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { map[row.provider] = row.status; });
        setConnections(map);
      }
    } catch {}
  };

  useEffect(() => {
    loadConnections();
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    if (connected) {
      toast({ title: 'Connected', description: `${connected} connected successfully` });
      params.delete('connected');
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
      loadConnections();
    }
  }, []);

  const createIntegration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');
      
      const apiKey = generateApiKey();
      
      const { data, error } = await supabase
        .from('custom_integrations')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type,
          endpoint_url: formData.endpoint_url,
          api_key: apiKey,
          config: formData.config,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setIntegrations([data, ...integrations]);
      setShowCreateForm(false);
      resetForm();
      
      toast({
        title: "Integration Created",
        description: "Custom integration has been created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive"
      });
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIntegrations(integrations.filter(i => i.id !== id));
      setSelectedIntegration(null);
      
      toast({
        title: "Integration Deleted",
        description: "Custom integration has been removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive"
      });
    }
  };

  const toggleIntegrationStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('custom_integrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(integrations.map(i => 
        i.id === id ? { ...i, status: newStatus as any } : i
      ));
      
      toast({
        title: "Status Updated",
        description: `Integration ${newStatus === 'active' ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive"
      });
    }
  };

  const generateApiKey = () => {
    return 'tsmo_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'webhook',
      endpoint_url: '',
      config: {
        events: [],
        auth_method: 'bearer',
        custom_headers: {},
        data_format: 'json',
        retry_attempts: 3
      }
    });
  };

  const handleConnect = async (provider: 'adobe' | 'buffer') => {
    console.log('Starting connection for:', provider);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('You must be logged in to connect integrations');
      }

      const appRedirect = `${window.location.origin}/custom-integrations`;
      console.log('Redirect URL:', appRedirect);
      
      const { data, error } = await supabase.functions.invoke('oauth-handler', {
        body: { provider, appRedirect },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      console.log('OAuth response:', { data, error });
      
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to:', data.url);
        // Store current session before redirect to prevent auth issues
        localStorage.setItem('pendingOAuthProvider', provider);
        // Use window.location for proper redirect without losing session
        window.location.href = data.url as string;
      } else {
        console.error('No URL returned from OAuth handler');
        throw new Error('No authorization URL returned');
      }
    } catch (e: any) {
      console.error('Connection error:', e);
      toast({
        title: 'Connection failed', 
        description: e.message || 'Unable to start OAuth flow',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      case 'api':
        return <Key className="h-4 w-4" />;
      case 'export':
        return <Database className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <FeatureGuard feature="enterprise_integrations" fallbackTitle="Enterprise Integrations" fallbackDescription="Custom integrations and APIs for enterprise customers">
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        {/* Hero Section */}
        <div className="relative px-6 py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Integrations Hub
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                      Connect your favorite tools and automate your workflow
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary" className="gap-1.5">
                    <Activity className="h-3 w-3" />
                    {integrations.filter(i => i.status === 'active').length} Active
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Shield className="h-3 w-3" />
                    Enterprise Grade
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="self-start md:self-center bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Integration
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 bg-muted/50 p-1 rounded-lg backdrop-blur-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                Overview
              </TabsTrigger>
              <TabsTrigger value="creative" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                <span className="hidden sm:inline">Creative Tools</span>
                <span className="sm:hidden">Creative</span>
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                <span className="hidden sm:inline">API Access</span>
                <span className="sm:hidden">API</span>
              </TabsTrigger>
              <TabsTrigger value="exports" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                <span className="hidden sm:inline">Data Exports</span>
                <span className="sm:hidden">Exports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-green-500/10 via-background to-background border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {integrations.filter(i => i.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Working integrations
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/10 via-background to-background border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{integrations.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total configured
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/10 via-background to-background border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">Secure</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All connections encrypted
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Integration Cards Grid */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Your Integrations
                </CardTitle>
                <CardDescription>
                  Manage and monitor all your custom integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {integrations.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Settings className="h-10 w-10 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No integrations yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Get started by creating your first integration. Connect external services, set up webhooks, or configure API access.
                    </p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Integration
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {integrations.map((integration) => (
                      <Card
                        key={integration.id}
                        className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                                {getTypeIcon(integration.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">{integration.name}</h3>
                                  <Badge 
                                    variant={integration.status === 'active' ? 'default' : 'secondary'}
                                    className="capitalize"
                                  >
                                    {integration.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {integration.type}
                                    </Badge>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(integration.status)}
                                    <span>Last used: {integration.last_used ? new Date(integration.last_used).toLocaleDateString() : 'Never'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={integration.status === 'active' ? 'outline' : 'default'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleIntegrationStatus(integration.id, integration.status);
                                }}
                                className="transition-colors"
                              >
                                {integration.status === 'active' ? 'Disable' : 'Enable'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteIntegration(integration.id);
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creative" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 via-background to-background">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-orange-600" />
                  </div>
                  Creative Tools Integrations
                </CardTitle>
                <CardDescription>
                  Connect Adobe Creative Cloud and Buffer to streamline your creative workflow with automated protection and social sharing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Adobe Creative Cloud Card */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-orange-200/50 hover:border-orange-300/70">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.5 3H7.5C6.67 3 6 3.67 6 4.5V19.5C6 20.33 6.67 21 7.5 21H16.5C17.33 21 18 20.33 18 19.5V8L13.5 3ZM16.5 19.5H7.5V4.5H13V8.5H16.5V19.5Z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Adobe Creative Cloud</h3>
                            {connections['adobe'] === 'active' && (
                              <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Enable one-click protection directly from Photoshop and Illustrator with UXP plugin support.
                          </p>
                          <Button 
                            onClick={() => handleConnect('adobe')}
                            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                          >
                            {connections['adobe'] === 'active' ? 'Reconnect Adobe' : 'Connect Adobe'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Buffer Card */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200/50 hover:border-blue-300/70">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.5 4H5.5C4.12 4 3 5.12 3 6.5V17.5C3 18.88 4.12 20 5.5 20H18.5C19.88 20 21 18.88 21 17.5V6.5C21 5.12 19.88 4 18.5 4ZM19.5 17.5C19.5 18.05 19.05 18.5 18.5 18.5H5.5C4.95 18.5 4.5 18.05 4.5 17.5V6.5C4.5 5.95 4.95 5.5 5.5 5.5H18.5C19.05 5.5 19.5 5.95 19.5 6.5V17.5Z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Buffer</h3>
                            {connections['buffer'] === 'active' && (
                              <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Schedule and publish your protected content across all your social media platforms automatically.
                          </p>
                          <Button 
                            onClick={() => handleConnect('buffer')}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          >
                            {connections['buffer'] === 'active' ? 'Reconnect Buffer' : 'Connect Buffer'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Alert>
              <Webhook className="h-4 w-4" />
              <AlertDescription>
                Webhooks allow you to receive real-time notifications when events occur in your account.
                Configure endpoints to receive copyright matches, scan results, and more.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                API integrations provide programmatic access to your data and services.
                Generate API keys and configure access permissions for your applications.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="exports" className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Set up automated data exports to your preferred systems.
                Schedule regular exports of scan results, analytics, and reports.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        </div>

        {/* Create Integration Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Integration</CardTitle>
                <CardDescription>
                  Set up a new custom integration for your enterprise account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Integration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Custom Integration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Integration Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="api">API Access</SelectItem>
                      <SelectItem value="export">Data Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'webhook' && (
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Webhook Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      value={formData.endpoint_url}
                      onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createIntegration}>
                    Create Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integration Details Modal */}
        {selectedIntegration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getTypeIcon(selectedIntegration.type)}
                  <span>{selectedIntegration.name}</span>
                </CardTitle>
                <CardDescription>
                  Integration details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={selectedIntegration.api_key} readOnly />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedIntegration.api_key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedIntegration.endpoint_url && (
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={selectedIntegration.endpoint_url} readOnly />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedIntegration.endpoint_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedIntegration.status)}
                    <Badge variant={selectedIntegration.status === 'active' ? 'default' : 'secondary'}>
                      {selectedIntegration.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Created</Label>
                  <Input 
                    value={new Date(selectedIntegration.created_at).toLocaleString()} 
                    readOnly 
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                    Close
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      deleteIntegration(selectedIntegration.id);
                      setSelectedIntegration(null);
                    }}
                  >
                    Delete Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </FeatureGuard>
  );
};