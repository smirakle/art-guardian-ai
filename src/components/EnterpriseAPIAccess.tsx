import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import FeatureGuard from '@/components/FeatureGuard';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, 
  Activity, 
  BookOpen, 
  Webhook, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  BarChart3,
  Clock
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface APIKey {
  id: string;
  user_id: string;
  key_name: string;
  api_key: string;
  key_prefix: string;
  permissions: string[];
  rate_limit_requests: number;
  rate_limit_window_minutes: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface APIUsage {
  endpoint: string;
  requests: number;
  status: 'success' | 'error';
}

interface Webhook {
  id: string;
  webhook_url: string;
  event_types: string[];
  is_active: boolean;
  created_at: string;
}

export const EnterpriseAPIAccess: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usageData, setUsageData] = useState<APIUsage[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    rateLimit: 1000,
    expiresAt: ''
  });

  const [webhookFormData, setWebhookFormData] = useState({
    url: '',
    eventTypes: [] as string[],
    secret: ''
  });

  const availablePermissions = [
    'scan',
    'monitor', 
    'analytics',
    'results',
    'webhooks',
    'admin'
  ];

  const availableEventTypes = [
    'scan.completed',
    'monitor.alert',
    'violation.detected',
    'key.created',
    'key.revoked'
  ];

  // Load real API keys from database
  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enterprise_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApiKeys(data || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load usage analytics
  const loadUsageAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('enterprise_api_usage')
        .select('endpoint, status_code')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process usage data
      const usageMap = (data || []).reduce((acc: Record<string, any>, item) => {
        const endpoint = item.endpoint;
        if (!acc[endpoint]) {
          acc[endpoint] = { endpoint, requests: 0, status: 'success' };
        }
        acc[endpoint].requests++;
        if (item.status_code >= 400) {
          acc[endpoint].status = 'error';
        }
        return acc;
      }, {});

      setUsageData(Object.values(usageMap));
    } catch (error) {
      console.error('Failed to load usage analytics:', error);
    }
  }, []);

  // Load webhooks
  const loadWebhooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('enterprise_webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWebhooks(data || []);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  }, []);

  const createApiKey = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('API key name is required');
      return;
    }

    setLoading(true);
    try {
      // Generate API key
      const { data: apiKey, error: keyError } = await supabase.rpc('generate_enterprise_api_key');
      if (keyError) throw keyError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create API key record
      const { data, error } = await supabase
        .from('enterprise_api_keys')
        .insert({
          user_id: user.id,
          key_name: formData.name,
          api_key: apiKey,
          key_prefix: apiKey.substring(0, 8),
          permissions: formData.permissions,
          rate_limit_requests: formData.rateLimit,
          rate_limit_window_minutes: 60,
          expires_at: formData.expiresAt || null
        })
        .select()
        .single();

      if (error) throw error;

      await loadApiKeys();
      setShowCreateForm(false);
      resetForm();
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setLoading(false);
    }
  }, [formData, loadApiKeys]);

  const deleteApiKey = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('enterprise_api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadApiKeys();
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setLoading(false);
    }
  }, [loadApiKeys]);

  const toggleApiKeyStatus = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const apiKey = apiKeys.find(k => k.id === id);
      if (!apiKey) return;

      const { error } = await supabase
        .from('enterprise_api_keys')
        .update({ is_active: !apiKey.is_active })
        .eq('id', id);

      if (error) throw error;

      await loadApiKeys();
      toast.success('API key status updated');
    } catch (error) {
      console.error('Failed to update API key status:', error);
      toast.error('Failed to update API key status');
    } finally {
      setLoading(false);
    }
  }, [apiKeys, loadApiKeys]);

  const createWebhook = useCallback(async () => {
    if (!webhookFormData.url.trim() || webhookFormData.eventTypes.length === 0) {
      toast.error('Webhook URL and event types are required');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('enterprise_webhooks')
        .insert({
          user_id: user.id,
          webhook_url: webhookFormData.url,
          event_types: webhookFormData.eventTypes,
          webhook_secret: webhookFormData.secret || null
        });

      if (error) throw error;

      await loadWebhooks();
      setShowWebhookForm(false);
      setWebhookFormData({ url: '', eventTypes: [], secret: '' });
      toast.success('Webhook created successfully');
    } catch (error) {
      console.error('Failed to create webhook:', error);
      toast.error('Failed to create webhook');
    }
  }, [webhookFormData, loadWebhooks]);

  useEffect(() => {
    loadApiKeys();
    loadUsageAnalytics();
    loadWebhooks();
  }, [loadApiKeys, loadUsageAnalytics, loadWebhooks]);

  const getStatusIcon = (is_active: boolean) => {
    return is_active 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  const toggleKeyVisibility = useCallback((keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      permissions: [],
      rateLimit: 1000,
      expiresAt: ''
    });
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <FeatureGuard 
      feature="enterprise_integrations" 
      fallbackTitle="Enterprise API Access - Starting at $499/month" 
      fallbackDescription="Premium API access for enterprise customers. Multiple tiers available from Starter to Custom Enterprise."
    >
      <div className="space-y-6">
        {/* Pricing Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-primary">Enterprise API Access</h2>
          </div>
          
          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Starter API</h3>
              <div className="text-2xl font-bold text-primary mb-1">$499<span className="text-sm font-normal">/month</span></div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 10,000 API calls/month</li>
                <li>• 100 calls/hour rate limit</li>
                <li>• Basic support</li>
                <li>• Core endpoints</li>
              </ul>
            </div>
            
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Professional API</h3>
              <div className="text-2xl font-bold text-primary mb-1">$1,999<span className="text-sm font-normal">/month</span></div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 50,000 API calls/month</li>
                <li>• 500 calls/hour rate limit</li>
                <li>• Priority support</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
            
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Enterprise API</h3>
              <div className="text-2xl font-bold text-primary mb-1">$9,999<span className="text-sm font-normal">/month</span></div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 250,000 API calls/month</li>
                <li>• 2,500 calls/hour rate limit</li>
                <li>• Dedicated support</li>
                <li>• Custom integrations</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-card border rounded-lg p-4 flex-1">
              <h3 className="font-semibold text-lg mb-2">Enterprise Plus</h3>
              <div className="text-2xl font-bold text-primary mb-1">$24,999<span className="text-sm font-normal">/month</span></div>
              <p className="text-sm text-muted-foreground">1M+ calls/month • Unlimited rate limits • Fortune 500 ready</p>
            </div>
            
            <div className="bg-card border rounded-lg p-4 flex-1">
              <h3 className="font-semibold text-lg mb-2">Custom Enterprise</h3>
              <div className="text-2xl font-bold text-primary mb-1">$50,000+<span className="text-sm font-normal">/month</span></div>
              <p className="text-sm text-muted-foreground">Custom limits • White-label solutions • Partner integrations</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mt-4">
            Enterprise-grade AI training protection APIs with dedicated support and priority processing.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">API Management</h3>
            <p className="text-muted-foreground">
              Manage API keys, monitor usage, and configure enterprise integrations
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            New API Key
          </Button>
        </div>

        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apiKeys.filter(k => k.is_active).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.reduce((sum, u) => sum + u.requests, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(...apiKeys.map(k => k.rate_limit_requests), 0).toLocaleString()}/h
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Keys List */}
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your enterprise API keys and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <Card key={apiKey.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{apiKey.key_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getStatusIcon(apiKey.is_active)}
                              <span>Status: {apiKey.is_active ? 'active' : 'inactive'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleApiKeyStatus(apiKey.id)}
                              disabled={loading}
                            >
                              {apiKey.is_active ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteApiKey(apiKey.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">API Key:</span>
                            <div className="flex items-center gap-2">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {visibleKeys.has(apiKey.id) 
                                  ? apiKey.api_key 
                                  : `${apiKey.key_prefix}${'*'.repeat(32)}`
                                }
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                              >
                                {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(apiKey.api_key, 'API key')}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Permissions:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {apiKey.permissions.map(permission => (
                                  <Badge key={permission} variant="secondary" className="text-xs">
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Rate Limit:</span>
                              <p className="text-muted-foreground">{apiKey.rate_limit_requests}/{apiKey.rate_limit_window_minutes}min</p>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <p className="text-muted-foreground">{formatDate(apiKey.created_at)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Last Used:</span>
                              <p className="text-muted-foreground">
                                {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {apiKeys.length === 0 && (
                      <div className="text-center py-8">
                        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No API keys yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first API key to start using our enterprise API
                        </p>
                        <Button onClick={() => setShowCreateForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create API Key
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Analytics</CardTitle>
                <CardDescription>
                  Monitor your API usage across all endpoints (last 30 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageData.map((usage) => (
                    <div key={usage.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{usage.endpoint}</div>
                        <div className="text-sm text-muted-foreground">
                          Total requests: {usage.requests.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={usage.status === 'success' ? 'default' : 'destructive'}>
                          {usage.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {usageData.length === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No usage data yet</h3>
                      <p className="text-muted-foreground">
                        Start making API calls to see usage analytics here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Base URL: https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/enterprise-api-v1
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Include your API key in the request headers:
                  </p>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`curl -X POST \\
  https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/enterprise-api-v1/v1/scan \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content_url": "https://example.com/image.jpg",
    "content_type": "image"
  }'`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Available Endpoints</h4>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium">POST /v1/scan</h5>
                      <p className="text-sm text-muted-foreground mb-2">Scan content for copyright infringement</p>
                      <pre className="bg-muted p-3 rounded text-sm">
{`{
  "content_url": "string",
  "content_type": "image|text"
}`}
                      </pre>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium">POST /v1/monitor</h5>
                      <p className="text-sm text-muted-foreground mb-2">Set up monitoring for URLs</p>
                      <pre className="bg-muted p-3 rounded text-sm">
{`{
  "target_urls": ["string"],
  "scan_frequency": "daily|weekly|monthly"
}`}
                      </pre>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium">GET /v1/results</h5>
                      <p className="text-sm text-muted-foreground mb-2">Retrieve scan or monitoring results</p>
                      <p className="text-sm">Query parameters: scan_id, monitor_id, limit, offset</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium">GET /v1/analytics</h5>
                      <p className="text-sm text-muted-foreground mb-2">Get usage analytics and metrics</p>
                      <p className="text-sm">Query parameters: start_date, end_date</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>
                      Configure webhooks to receive real-time notifications
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowWebhookForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{webhook.webhook_url}</div>
                        <div className="flex gap-1 mt-1">
                          {webhook.event_types.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {webhooks.length === 0 && (
                    <div className="text-center py-8">
                      <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No webhooks configured</h3>
                      <p className="text-muted-foreground mb-4">
                        Add a webhook to receive real-time notifications
                      </p>
                      <Button onClick={() => setShowWebhookForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create API Key Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for enterprise access
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Production API Key"
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            permissions: checked
                              ? [...prev.permissions, permission]
                              : prev.permissions.filter(p => p !== permission)
                          }));
                        }}
                      />
                      <Label htmlFor={permission} className="text-sm">{permission}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="rateLimit">Rate Limit (requests per hour)</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 1000 }))}
                />
              </div>

              <div>
                <Label htmlFor="expiresAt">Expires At (optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createApiKey} disabled={loading}>
                Create API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Webhook Dialog */}
        <Dialog open={showWebhookForm} onOpenChange={setShowWebhookForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook to receive real-time notifications
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookFormData.url}
                  onChange={(e) => setWebhookFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-app.com/webhook"
                />
              </div>

              <div>
                <Label>Event Types</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {availableEventTypes.map(eventType => (
                    <div key={eventType} className="flex items-center space-x-2">
                      <Checkbox
                        id={eventType}
                        checked={webhookFormData.eventTypes.includes(eventType)}
                        onCheckedChange={(checked) => {
                          setWebhookFormData(prev => ({
                            ...prev,
                            eventTypes: checked
                              ? [...prev.eventTypes, eventType]
                              : prev.eventTypes.filter(e => e !== eventType)
                          }));
                        }}
                      />
                      <Label htmlFor={eventType} className="text-sm">{eventType}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="webhookSecret">Secret (optional)</Label>
                <Input
                  id="webhookSecret"
                  value={webhookFormData.secret}
                  onChange={(e) => setWebhookFormData(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="webhook_secret_key"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookForm(false)}>
                Cancel
              </Button>
              <Button onClick={createWebhook}>
                Add Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGuard>
  );
};