import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Globe, 
  Users, 
  Settings, 
  Palette,
  Shield,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeatureGuard from '@/components/FeatureGuard';

interface WhiteLabelOrganization {
  id: string;
  name: string;
  slug: string;
  company_name: string;
  company_description?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  custom_domain?: string;
  domain_verified: boolean;
  is_active: boolean;
  max_users: number;
  max_artworks: number;
  features: any;
  created_at: string;
}

interface WhiteLabelDomain {
  id: string;
  domain: string;
  verified_at?: string;
  dns_configured: boolean;
  ssl_enabled: boolean;
  is_primary: boolean;
}

interface WhiteLabelUser {
  id: string;
  user_id: string;
  role: string;
  invited_at: string;
  joined_at?: string;
  is_active: boolean;
}

export const WhiteLabelManager: React.FC = () => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<WhiteLabelOrganization | null>(null);
  const [domains, setDomains] = useState<WhiteLabelDomain[]>([]);
  const [users, setUsers] = useState<WhiteLabelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    company_name: '',
    company_description: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    accent_color: '#06b6d4'
  });

  useEffect(() => {
    if (user && hasFeature('white_label')) {
      loadWhiteLabelData();
    }
  }, [user, hasFeature]);

  const loadWhiteLabelData = async () => {
    try {
      // Check if user has an organization
      const { data: orgData } = await supabase
        .rpc('get_user_white_label_org');

      if (orgData && orgData.length > 0) {
        const orgInfo = orgData[0];
        
        // Load full organization details
        const { data: fullOrgData } = await supabase
          .from('white_label_organizations')
          .select('*')
          .eq('id', orgInfo.org_id)
          .single();

        if (fullOrgData) {
          setOrganization(fullOrgData);
          setFormData({
            name: fullOrgData.name,
            slug: fullOrgData.slug,
            company_name: fullOrgData.company_name,
            company_description: fullOrgData.company_description || '',
            primary_color: fullOrgData.primary_color,
            secondary_color: fullOrgData.secondary_color,
            accent_color: fullOrgData.accent_color
          });

          // Load domains
          const { data: domainsData } = await supabase
            .from('white_label_domains')
            .select('*')
            .eq('organization_id', orgInfo.org_id);
          
          if (domainsData) {
            setDomains(domainsData);
          }

          // Load users
          const { data: usersData } = await supabase
            .from('white_label_users')
            .select('*')
            .eq('organization_id', orgInfo.org_id);
          
          if (usersData) {
            setUsers(usersData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading white label data:', error);
      toast({
        title: "Error",
        description: "Failed to load white label data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('white_label_organizations')
        .insert({
          owner_id: user.id,
          name: formData.name,
          slug: formData.slug,
          company_name: formData.company_name,
          company_description: formData.company_description,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "White label organization created successfully"
      });

      setOrganization(data);
      await loadWhiteLabelData();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateOrganization = async () => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('white_label_organizations')
        .update({
          name: formData.name,
          company_name: formData.company_name,
          company_description: formData.company_description,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Organization updated successfully"
      });

      await loadWhiteLabelData();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <FeatureGuard feature="white_label">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">White Label Management</h2>
            <p className="text-muted-foreground">
              Create and manage your branded instance of the platform
            </p>
          </div>
          {!organization && (
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          )}
        </div>

        {!organization && !isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Get Started with White Label</span>
              </CardTitle>
              <CardDescription>
                Create your own branded instance of the platform with custom domains, styling, and user management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Custom Branding</h3>
                  <p className="text-sm text-muted-foreground">Your logo, colors, and styling</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Custom Domain</h3>
                  <p className="text-sm text-muted-foreground">Use your own domain name</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">Invite and manage team members</p>
                </div>
              </div>
              <Button onClick={() => setIsCreating(true)} className="w-full mt-4" disabled={isCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings">Organization Settings</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="domains">Custom Domains</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Basic information about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Organization Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="My Organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="my-organization"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Company Inc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.company_description}
                      onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                      placeholder="Brief description of your organization..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={organization ? updateOrganization : createOrganization}
                    disabled={isCreating}
                  >
                    {organization ? 'Update Organization' : 'Create Organization'}
                  </Button>
                </CardContent>
              </Card>

              {organization && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${organization.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">
                          {organization.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{users.length} / {organization.max_users} users</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">0 / {organization.max_artworks} artworks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{domains.length} domains</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Customize the colors used throughout your branded instance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accent_color">Accent Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          placeholder="#06b6d4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Color Preview</h4>
                    <div className="flex space-x-2">
                      <div 
                        className="w-12 h-12 rounded"
                        style={{ backgroundColor: formData.primary_color }}
                        title="Primary"
                      />
                      <div 
                        className="w-12 h-12 rounded"
                        style={{ backgroundColor: formData.secondary_color }}
                        title="Secondary"
                      />
                      <div 
                        className="w-12 h-12 rounded"
                        style={{ backgroundColor: formData.accent_color }}
                        title="Accent"
                      />
                    </div>
                  </div>

                  {organization && (
                    <Button onClick={updateOrganization}>
                      Update Branding
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Domains</CardTitle>
                  <CardDescription>
                    Configure custom domains for your white label instance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {domains.length === 0 ? (
                    <div className="text-center py-8">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No domains configured</h3>
                      <p className="text-muted-foreground mb-4">
                        Add a custom domain to use your own branding
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {domains.map((domain) => (
                        <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${domain.verified_at ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                              <div className="font-medium">{domain.domain}</div>
                              <div className="text-sm text-muted-foreground">
                                {domain.verified_at ? 'Verified' : 'Pending verification'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {domain.is_primary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Invite and manage users in your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No users yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Invite team members to your organization
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Invite User
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <div>
                              <div className="font-medium">User {user.user_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.role} • {user.joined_at ? 'Joined' : 'Invited'} {new Date(user.invited_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </FeatureGuard>
  );
};