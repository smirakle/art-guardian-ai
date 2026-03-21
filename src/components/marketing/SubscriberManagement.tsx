import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, Users, Filter, Plus, Search, Mail, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
  tags?: string[];
  metadata?: any;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: any;
  subscriber_count: number;
  is_active: boolean;
}

export const SubscriberManagement = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const { toast } = useToast();

  // Segment creation form
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    conditions: [{ field: 'status', operator: 'equals', value: 'subscribed' }]
  });

  // Import form
  const [importData, setImportData] = useState({
    emails: '',
    tags: '',
    overwriteExisting: false
  });

  useEffect(() => {
    fetchSubscribers();
    fetchSegments();
  }, [selectedSegment, statusFilter]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('email_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscribers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscriber_segments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const handleImportSubscribers = async () => {
    if (!importData.emails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const emails = importData.emails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      const tags = importData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const subscribersToInsert = emails.map(email => ({
        user_id: userData.user.id,
        email,
        status: 'subscribed',
        metadata: { tags },
      }));

      const { error } = await supabase
        .from('email_subscribers')
        .upsert(subscribersToInsert, { 
          onConflict: 'user_id,email',
          ignoreDuplicates: !importData.overwriteExisting 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${emails.length} subscribers.`,
      });

      setShowImportDialog(false);
      setImportData({ emails: '', tags: '', overwriteExisting: false });
      fetchSubscribers();

    } catch (error) {
      console.error('Error importing subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to import subscribers.",
        variant: "destructive",
      });
    }
  };

  const handleExportSubscribers = async () => {
    try {
      const csvContent = [
        ['Email', 'Status', 'Subscribed At', 'Tags'],
        ...subscribers.map(sub => [
          sub.email,
          sub.status,
          new Date(sub.created_at).toLocaleDateString(),
          ((sub.metadata as any)?.tags || []).join('; ')
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Subscribers exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to export subscribers.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSegment = async () => {
    if (!newSegment.name.trim()) {
      toast({
        title: "Error",
        description: "Segment name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('email_subscriber_segments')
        .insert({
          user_id: userData.user.id,
          name: newSegment.name,
          description: newSegment.description,
          conditions: newSegment.conditions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Segment created successfully.",
      });

      setShowSegmentDialog(false);
      setNewSegment({
        name: '',
        description: '',
        conditions: [{ field: 'status', operator: 'equals', value: 'subscribed' }]
      });
      fetchSegments();

    } catch (error) {
      console.error('Error creating segment:', error);
      toast({
        title: "Error",
        description: "Failed to create segment.",
        variant: "destructive",
      });
    }
  };

  const updateSubscriberStatus = async (subscriberId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .update({ status: newStatus })
        .eq('id', subscriberId);

      if (error) throw error;

      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === subscriberId ? { ...sub, status: newStatus } : sub
        )
      );

      toast({
        title: "Success",
        description: `Subscriber status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber status.",
        variant: "destructive",
      });
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => 
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((subscriber.metadata as any)?.tags || []).some((tag: string) => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscriber Management</h2>
          <p className="text-muted-foreground">
            Manage your email subscribers, segments, and import/export data
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Subscribers</DialogTitle>
                <DialogDescription>
                  Add new subscribers to your list. Enter one email per line.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emails">Email Addresses</Label>
                  <Textarea
                    id="emails"
                    placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                    value={importData.emails}
                    onChange={(e) => setImportData(prev => ({ ...prev, emails: e.target.value }))}
                    rows={8}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="newsletter, customers, prospects"
                    value={importData.tags}
                    onChange={(e) => setImportData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={importData.overwriteExisting}
                    onChange={(e) => setImportData(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                  />
                  <Label htmlFor="overwrite">Overwrite existing subscribers</Label>
                </div>
                <Button onClick={handleImportSubscribers} className="w-full">
                  Import Subscribers
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportSubscribers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Segment</DialogTitle>
                <DialogDescription>
                  Create a targeted segment for your email campaigns.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="segmentName">Segment Name</Label>
                  <Input
                    id="segmentName"
                    placeholder="High-value customers"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="segmentDescription">Description</Label>
                  <Textarea
                    id="segmentDescription"
                    placeholder="Customers who have spent over $500"
                    value={newSegment.description}
                    onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateSegment} className="w-full">
                  Create Segment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {subscribers.filter(s => s.status === 'subscribed').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{segments.length}</p>
                <p className="text-sm text-muted-foreground">Segments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {subscribers.filter(s => s.status === 'unsubscribed').length}
                </p>
                <p className="text-sm text-muted-foreground">Unsubscribed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers by email or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSegment} onValueChange={setSelectedSegment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            {segments.map(segment => (
              <SelectItem key={segment.id} value={segment.id}>
                {segment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
          <CardDescription>
            Manage your subscriber list and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse border rounded p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No subscribers found</p>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Import your first subscribers to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowImportDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Subscribers
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscribers.map(subscriber => (
                <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{subscriber.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            subscriber.status === 'subscribed' ? 'bg-green-100 text-green-800' :
                            subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscriber.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(subscriber.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {subscriber.tags && subscriber.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {subscriber.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {subscriber.status !== 'subscribed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSubscriberStatus(subscriber.id, 'subscribed')}
                      >
                        Resubscribe
                      </Button>
                    )}
                    {subscriber.status === 'subscribed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                      >
                        Unsubscribe
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segments */}
      {segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Segments</CardTitle>
            <CardDescription>
              Targeted groups for personalized campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {segments.map(segment => (
                <Card key={segment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{segment.name}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {segment.subscriber_count} subscribers
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{segment.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};