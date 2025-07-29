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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Custom Integrations</h2>
            <p className="text-muted-foreground">
              Manage your enterprise integrations and API connections
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Integration
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api">API Access</TabsTrigger>
            <TabsTrigger value="exports">Data Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {integrations.filter(i => i.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Secure</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integration List</CardTitle>
                <CardDescription>
                  Manage all your custom integrations from here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(integration.type)}
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Badge variant="outline">{integration.type}</Badge>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(integration.status)}
                              <span>{integration.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIntegrationStatus(integration.id, integration.status);
                          }}
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {integrations.length === 0 && (
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No integrations yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first custom integration to get started
                      </p>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Integration
                      </Button>
                    </div>
                  )}
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