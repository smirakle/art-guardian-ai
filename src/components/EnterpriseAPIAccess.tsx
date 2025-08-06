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
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Code,
  BarChart3,
  Clock,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface APIKey {
  id: string;
  user_id: string;
  name: string;
  key_value: string;
  permissions: string[];
  rate_limit: number;
  usage_count: number;
  last_used?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

interface APIUsage {
  endpoint: string;
  requests: number;
  last_24h: number;
  status: 'healthy' | 'warning' | 'error';
}

export const EnterpriseAPIAccess: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    rate_limit: 1000,
    expires_at: ''
  });

  // Mock API usage data
  const apiUsage: APIUsage[] = [
    { endpoint: '/api/v1/scan', requests: 1247, last_24h: 89, status: 'healthy' },
    { endpoint: '/api/v1/monitor', requests: 856, last_24h: 45, status: 'healthy' },
    { endpoint: '/api/v1/results', requests: 2341, last_24h: 156, status: 'warning' },
    { endpoint: '/api/v1/upload', requests: 445, last_24h: 23, status: 'healthy' },
  ];

  const availablePermissions = [
    'scan:read',
    'scan:write',
    'monitor:read', 
    'monitor:write',
    'results:read',
    'upload:write',
    'analytics:read',
    'admin:all'
  ];

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      // This would normally fetch from a real database table
      // For demo purposes, we'll use mock data
      const mockAPIKeys: APIKey[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'Production API',
          key_value: 'tsmo_api_prod_' + Math.random().toString(36).substring(2, 32),
          permissions: ['scan:read', 'scan:write', 'monitor:read', 'results:read'],
          rate_limit: 5000,
          usage_count: 1247,
          last_used: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          is_active: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
        },
        {
          id: '2',
          user_id: 'user1',
          name: 'Development API',
          key_value: 'tsmo_api_dev_' + Math.random().toString(36).substring(2, 32),
          permissions: ['scan:read', 'results:read'],
          rate_limit: 1000,
          usage_count: 89,
          last_used: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          is_active: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
        }
      ];
      
      setApiKeys(mockAPIKeys);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    try {
      const newKey: APIKey = {
        id: Date.now().toString(),
        user_id: 'user1',
        name: formData.name,
        key_value: 'tsmo_api_' + Math.random().toString(36).substring(2, 32),
        permissions: formData.permissions,
        rate_limit: formData.rate_limit,
        usage_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        expires_at: formData.expires_at || undefined
      };

      setApiKeys([newKey, ...apiKeys]);
      setShowCreateForm(false);
      resetForm();
      
      toast({
        title: "API Key Created",
        description: "New API key has been generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      setApiKeys(apiKeys.filter(k => k.id !== id));
      
      toast({
        title: "API Key Deleted",
        description: "API key has been revoked and removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const toggleAPIKeyStatus = async (id: string) => {
    try {
      setApiKeys(apiKeys.map(k => 
        k.id === id ? { ...k, is_active: !k.is_active } : k
      ));
      
      const key = apiKeys.find(k => k.id === id);
      toast({
        title: "Status Updated",
        description: `API key ${key?.is_active ? 'deactivated' : 'activated'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValue(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      permissions: [],
      rate_limit: 1000,
      expires_at: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <FeatureGuard feature="enterprise_integrations" fallbackTitle="Enterprise API Access" fallbackDescription="Full API access and management for enterprise customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enterprise API Access</h2>
            <p className="text-muted-foreground">
              Manage API keys, monitor usage, and configure enterprise integrations
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
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
                    {apiKeys.reduce((sum, k) => sum + k.usage_count, 0).toLocaleString()}
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
                    {Math.max(...apiKeys.map(k => k.rate_limit), 0).toLocaleString()}/h
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your enterprise API keys and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{key.name}</h4>
                          <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Input
                            value={showKeyValue[key.id] ? key.key_value : '••••••••••••••••••••••••••••••••'}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKeyValue[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(key.key_value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Usage: {key.usage_count.toLocaleString()} requests</span>
                          <span>Rate limit: {key.rate_limit.toLocaleString()}/hour</span>
                          {key.last_used && (
                            <span>Last used: {formatDate(key.last_used)}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAPIKeyStatus(key.id)}
                        >
                          {key.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAPIKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {apiKeys.length === 0 && (
                    <div className="text-center py-12">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Analytics</CardTitle>
                <CardDescription>
                  Monitor your API usage across all endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiUsage.map((usage) => (
                    <div key={usage.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{usage.endpoint}</div>
                        <div className="text-sm text-muted-foreground">
                          Total requests: {usage.requests.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getStatusColor(usage.status)}`}>
                          {usage.last_24h} requests (24h)
                        </div>
                        <Badge variant={usage.status === 'healthy' ? 'default' : usage.status === 'warning' ? 'secondary' : 'destructive'}>
                          {usage.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Complete reference for our enterprise API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    Base URL: <code className="bg-muted px-2 py-1 rounded">https://api.tsmo.watch/v1</code>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Authentication</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Include your API key in the Authorization header:
                    </p>
                    <code className="block bg-muted p-3 rounded text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Common Endpoints</h4>
                    <div className="space-y-2 text-sm">
                      <div><code>POST /scan</code> - Submit content for scanning</div>
                      <div><code>GET /results/:id</code> - Retrieve scan results</div>
                      <div><code>POST /monitor</code> - Set up monitoring for content</div>
                      <div><code>GET /analytics</code> - Access usage analytics</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure webhooks to receive real-time notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Webhooks allow you to receive instant notifications when events occur.
                    Configure your endpoint URL to receive copyright matches, scan completions, and more.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create API Key Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New API Key</CardTitle>
                <CardDescription>
                  Generate a new API key for enterprise integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Production API Key"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={formData.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, permission]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter(p => p !== permission)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={formData.rate_limit}
                    onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) || 1000 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Expiration Date (optional)</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAPIKey}>
                    Create API Key
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