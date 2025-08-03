import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, Filter, Download, Calendar, AlertTriangle, 
  Shield, Globe, Clock, Edit, Trash2, Eye, Bookmark,
  FileText, Bell, Settings, MoreVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Trademark {
  id: string;
  trademark_name: string;
  registration_number?: string;
  application_number?: string;
  jurisdiction: string;
  status: string;
  trademark_class: string[];
  description?: string;
  filing_date?: string;
  registration_date?: string;
  renewal_date?: string;
  monitoring_enabled: boolean;
  last_monitored_at?: string;
  created_at: string;
}

interface TrademarkFormData {
  trademark_name: string;
  registration_number: string;
  application_number: string;
  jurisdiction: string;
  trademark_class: string[];
  description: string;
  filing_date: string;
  registration_date: string;
  renewal_date: string;
}

const jurisdictions = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'EU', label: 'European Union', flag: '🇪🇺' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'AU', label: 'Australia', flag: '🇦🇺' }
];

const trademarkClasses = [
  'Class 1: Chemicals', 'Class 9: Scientific instruments', 'Class 25: Clothing',
  'Class 35: Advertising', 'Class 41: Education', 'Class 42: Technology'
];

export const TrademarkPortfolio: React.FC = () => {
  const [trademarks, setTrademarks] = useState<Trademark[]>([]);
  const [filteredTrademarks, setFilteredTrademarks] = useState<Trademark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<TrademarkFormData>({
    trademark_name: '',
    registration_number: '',
    application_number: '',
    jurisdiction: 'US',
    trademark_class: [],
    description: '',
    filing_date: '',
    registration_date: '',
    renewal_date: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTrademarks();
    }
  }, [user]);

  useEffect(() => {
    filterTrademarks();
  }, [trademarks, searchTerm, statusFilter, jurisdictionFilter]);

  const fetchTrademarks = async () => {
    try {
      const { data, error } = await supabase
        .from('trademarks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrademarks(data || []);
    } catch (error) {
      console.error('Error fetching trademarks:', error);
      toast({
        title: "Error",
        description: "Failed to load trademark portfolio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTrademarks = () => {
    let filtered = trademarks;

    if (searchTerm) {
      filtered = filtered.filter(tm => 
        tm.trademark_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tm.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tm.application_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tm => tm.status === statusFilter);
    }

    if (jurisdictionFilter !== 'all') {
      filtered = filtered.filter(tm => tm.jurisdiction === jurisdictionFilter);
    }

    setFilteredTrademarks(filtered);
  };

  const handleAddTrademark = async () => {
    if (!formData.trademark_name || !user) return;

    try {
      const { data, error } = await supabase
        .from('trademarks')
        .insert({
          user_id: user.id,
          ...formData,
          monitoring_enabled: true
        })
        .select()
        .single();

      if (error) throw error;

      setTrademarks(prev => [data, ...prev]);
      setIsAddDialogOpen(false);
      setFormData({
        trademark_name: '',
        registration_number: '',
        application_number: '',
        jurisdiction: 'US',
        trademark_class: [],
        description: '',
        filing_date: '',
        registration_date: '',
        renewal_date: ''
      });

      toast({
        title: "Success",
        description: "Trademark added to portfolio successfully"
      });
    } catch (error) {
      console.error('Error adding trademark:', error);
      toast({
        title: "Error",
        description: "Failed to add trademark to portfolio",
        variant: "destructive"
      });
    }
  };

  const toggleMonitoring = async (trademarkId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('trademarks')
        .update({ 
          monitoring_enabled: enabled,
          last_monitored_at: enabled ? new Date().toISOString() : null
        })
        .eq('id', trademarkId);

      if (error) throw error;

      setTrademarks(prev => prev.map(tm => 
        tm.id === trademarkId 
          ? { ...tm, monitoring_enabled: enabled, last_monitored_at: enabled ? new Date().toISOString() : tm.last_monitored_at }
          : tm
      ));

      toast({
        title: "Success",
        description: `Monitoring ${enabled ? 'enabled' : 'disabled'} for trademark`
      });
    } catch (error) {
      console.error('Error updating monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to update monitoring settings",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateRenewalStatus = (renewalDate?: string) => {
    if (!renewalDate) return null;
    
    const renewal = new Date(renewalDate);
    const now = new Date();
    const diffMonths = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 0) return { status: 'expired', color: 'text-red-600' };
    if (diffMonths < 6) return { status: 'urgent', color: 'text-orange-600' };
    if (diffMonths < 12) return { status: 'upcoming', color: 'text-yellow-600' };
    return { status: 'safe', color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trademarks</p>
                <p className="text-2xl font-bold text-primary">{trademarks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                <p className="text-2xl font-bold text-green-600">
                  {trademarks.filter(tm => tm.monitoring_enabled).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Renewals Due</p>
                <p className="text-2xl font-bold text-orange-600">
                  {trademarks.filter(tm => {
                    const renewal = calculateRenewalStatus(tm.renewal_date);
                    return renewal && (renewal.status === 'urgent' || renewal.status === 'upcoming');
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jurisdictions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(trademarks.map(tm => tm.jurisdiction)).size}
                </p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trademark Portfolio</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trademark
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Trademark</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trademark Name *</Label>
                      <Input
                        value={formData.trademark_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, trademark_name: e.target.value }))}
                        placeholder="Enter trademark name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jurisdiction</Label>
                      <Select
                        value={formData.jurisdiction}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, jurisdiction: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jurisdictions.map(j => (
                            <SelectItem key={j.value} value={j.value}>
                              {j.flag} {j.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input
                        value={formData.registration_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                        placeholder="e.g., 6,123,456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Application Number</Label>
                      <Input
                        value={formData.application_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, application_number: e.target.value }))}
                        placeholder="e.g., 88/123,456"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of goods/services"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Filing Date</Label>
                      <Input
                        type="date"
                        value={formData.filing_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, filing_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration Date</Label>
                      <Input
                        type="date"
                        value={formData.registration_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, registration_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renewal Date</Label>
                      <Input
                        type="date"
                        value={formData.renewal_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, renewal_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTrademark}>
                      Add Trademark
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trademarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                {jurisdictions.map(j => (
                  <SelectItem key={j.value} value={j.value}>
                    {j.flag} {j.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trademark List */}
          <div className="space-y-4">
            {filteredTrademarks.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No trademarks found</p>
                <p className="text-sm text-muted-foreground">
                  {trademarks.length === 0 
                    ? "Start building your trademark portfolio by adding your first trademark"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              filteredTrademarks.map((trademark) => {
                const renewalStatus = calculateRenewalStatus(trademark.renewal_date);
                return (
                  <Card key={trademark.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{trademark.trademark_name}</h3>
                            <Badge className={getStatusColor(trademark.status)}>
                              {trademark.status}
                            </Badge>
                            {jurisdictions.find(j => j.value === trademark.jurisdiction)?.flag}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            {trademark.registration_number && (
                              <div>
                                <span className="font-medium">Reg. #:</span> {trademark.registration_number}
                              </div>
                            )}
                            {trademark.application_number && (
                              <div>
                                <span className="font-medium">App. #:</span> {trademark.application_number}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Jurisdiction:</span> {trademark.jurisdiction}
                            </div>
                            {renewalStatus && (
                              <div className={renewalStatus.color}>
                                <span className="font-medium">Renewal:</span> {trademark.renewal_date}
                              </div>
                            )}
                          </div>

                          {trademark.description && (
                            <p className="text-sm text-muted-foreground mt-2">{trademark.description}</p>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={trademark.monitoring_enabled}
                                onCheckedChange={(checked) => toggleMonitoring(trademark.id, !!checked)}
                              />
                              <span className="text-sm">Active Monitoring</span>
                            </div>
                            
                            {trademark.last_monitored_at && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Last scan: {new Date(trademark.last_monitored_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrademarkPortfolio;