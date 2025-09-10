import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Key, Activity, Users, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface GovernmentAgency {
  id: string;
  agency_name: string;
  agency_code: string;
  department: string;
  contact_email: string;
  security_clearance_level: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface GovernmentApiKey {
  id: string;
  agency_id: string;
  api_key: string;
  key_name: string;
  permissions: any; // Json type from Supabase
  security_classification: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  government_agencies?: {
    agency_name: string;
    agency_code: string;
  };
}

const GovernmentApiPanel: React.FC = () => {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<GovernmentAgency[]>([]);
  const [apiKeys, setApiKeys] = useState<GovernmentApiKey[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showNewAgencyForm, setShowNewAgencyForm] = useState(false);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newAgency, setNewAgency] = useState({
    agency_name: '',
    agency_code: '',
    department: '',
    contact_email: '',
    security_clearance_level: 'public'
  });
  const [newApiKey, setNewApiKey] = useState({
    key_name: '',
    permissions: [] as string[],
    security_classification: 'unclassified',
    purpose: ''
  });

  const availablePermissions = [
    'threat_intel',
    'monitoring',
    'compliance',
    'deepfake_detection',
    'ai_protection',
    'portfolio_monitoring',
    'real_time_scanning',
    'evidence_collection',
    'automated_dmca'
  ];

  const securityLevels = ['public', 'secret', 'top_secret'];
  const classificationLevels = ['unclassified', 'confidential', 'secret', 'top_secret'];

  useEffect(() => {
    fetchAgencies();
    fetchApiKeys();
  }, []);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('government_agencies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch government agencies",
        variant: "destructive"
      });
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('government_api_keys')
        .select(`
          *,
          government_agencies!inner(
            agency_name,
            agency_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive"
      });
    }
  };

  const createAgency = async () => {
    if (!newAgency.agency_name || !newAgency.agency_code || !newAgency.contact_email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('government_agencies')
        .insert(newAgency);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Government agency created successfully"
      });

      setNewAgency({
        agency_name: '',
        agency_code: '',
        department: '',
        contact_email: '',
        security_clearance_level: 'public'
      });
      setShowNewAgencyForm(false);
      fetchAgencies();
    } catch (error) {
      console.error('Error creating agency:', error);
      toast({
        title: "Error",
        description: "Failed to create government agency",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!selectedAgency || !newApiKey.key_name || newApiKey.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select permissions",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate API key
      const { data: keyData, error: keyError } = await supabase
        .rpc('generate_government_api_key');

      if (keyError) throw keyError;

      const { error } = await supabase
        .from('government_api_keys')
        .insert({
          agency_id: selectedAgency,
          api_key: keyData,
          key_name: newApiKey.key_name,
          permissions: newApiKey.permissions,
          security_classification: newApiKey.security_classification,
          purpose: newApiKey.purpose
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Government API key created successfully"
      });

      setNewApiKey({
        key_name: '',
        permissions: [],
        security_classification: 'unclassified',
        purpose: ''
      });
      setShowNewKeyForm(false);
      fetchApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAgency = async (agencyId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('government_agencies')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', agencyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agency verified successfully"
      });
      fetchAgencies();
    } catch (error) {
      console.error('Error verifying agency:', error);
      toast({
        title: "Error",
        description: "Failed to verify agency",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleApiKeyStatus = async (keyId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('government_api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `API key ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      fetchApiKeys();
    } catch (error) {
      console.error('Error updating API key status:', error);
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Government API Access</h1>
          <p className="text-muted-foreground">Manage government agency API access to TSMO services</p>
        </div>
      </div>

      <Tabs defaultValue="agencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Government Agencies</h2>
            <Button onClick={() => setShowNewAgencyForm(true)}>
              <Users className="w-4 h-4 mr-2" />
              Add Agency
            </Button>
          </div>

          {showNewAgencyForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Government Agency</CardTitle>
                <CardDescription>Register a new government agency for API access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agency_name">Agency Name</Label>
                    <Input
                      id="agency_name"
                      value={newAgency.agency_name}
                      onChange={(e) => setNewAgency({ ...newAgency, agency_name: e.target.value })}
                      placeholder="Federal Bureau of Investigation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agency_code">Agency Code</Label>
                    <Input
                      id="agency_code"
                      value={newAgency.agency_code}
                      onChange={(e) => setNewAgency({ ...newAgency, agency_code: e.target.value })}
                      placeholder="FBI"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newAgency.department}
                    onChange={(e) => setNewAgency({ ...newAgency, department: e.target.value })}
                    placeholder="Department of Justice"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newAgency.contact_email}
                    onChange={(e) => setNewAgency({ ...newAgency, contact_email: e.target.value })}
                    placeholder="api-contact@agency.gov"
                  />
                </div>
                <div>
                  <Label htmlFor="security_clearance">Security Clearance Level</Label>
                  <Select
                    value={newAgency.security_clearance_level}
                    onValueChange={(value) => setNewAgency({ ...newAgency, security_clearance_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {securityLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createAgency} disabled={loading}>
                    Create Agency
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewAgencyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {agencies.map((agency) => (
              <Card key={agency.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{agency.agency_name}</h3>
                      <p className="text-sm text-muted-foreground">{agency.department}</p>
                      <p className="text-sm text-muted-foreground">{agency.contact_email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={agency.is_active ? "default" : "secondary"}>
                          {agency.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={agency.is_verified ? "default" : "destructive"}>
                          {agency.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant="outline">
                          {agency.security_clearance_level.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!agency.is_verified && (
                        <Button
                          size="sm"
                          onClick={() => verifyAgency(agency.id)}
                          disabled={loading}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <Button onClick={() => setShowNewKeyForm(true)}>
              <Key className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
          </div>

          {showNewKeyForm && (
            <Card>
              <CardHeader>
                <CardTitle>Generate New API Key</CardTitle>
                <CardDescription>Create a new API key for government agency access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agency_select">Select Agency</Label>
                  <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agency" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.filter(a => a.is_verified && a.is_active).map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.agency_code} - {agency.agency_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="key_name">Key Name</Label>
                  <Input
                    id="key_name"
                    value={newApiKey.key_name}
                    onChange={(e) => setNewApiKey({ ...newApiKey, key_name: e.target.value })}
                    placeholder="Production API Key"
                  />
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={newApiKey.purpose}
                    onChange={(e) => setNewApiKey({ ...newApiKey, purpose: e.target.value })}
                    placeholder="Threat intelligence gathering for national security"
                  />
                </div>
                <div>
                  <Label htmlFor="classification">Security Classification</Label>
                  <Select
                    value={newApiKey.security_classification}
                    onValueChange={(value) => setNewApiKey({ ...newApiKey, security_classification: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classificationLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newApiKey.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewApiKey({
                                ...newApiKey,
                                permissions: [...newApiKey.permissions, permission]
                              });
                            } else {
                              setNewApiKey({
                                ...newApiKey,
                                permissions: newApiKey.permissions.filter(p => p !== permission)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {permission.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createApiKey} disabled={loading}>
                    Generate Key
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{key.key_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Agency: {key.government_agencies?.agency_name}
                      </p>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {key.api_key.substring(0, 20)}...
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {key.security_classification.toUpperCase()}
                        </Badge>
                        {Array.isArray(key.permissions) && key.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                      {key.last_used_at && (
                        <p className="text-xs text-muted-foreground">
                          Last used: {new Date(key.last_used_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={key.is_active ? "destructive" : "default"}
                      onClick={() => toggleApiKeyStatus(key.id, key.is_active)}
                      disabled={loading}
                    >
                      {key.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                API Usage Analytics
              </CardTitle>
              <CardDescription>
                Monitor government agency API usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p>Usage analytics will be displayed here once API calls are made</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernmentApiPanel;