import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Clock, Users, BarChart3, Settings, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  trigger_type: 'welcome' | 'abandonment' | 'renewal' | 'engagement' | 'manual';
  send_time?: string;
  recipients: number;
  open_rate?: number;
  click_rate?: number;
}

export const EmailMarketingAutomation = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    total_sent: 0,
    total_opens: 0,
    total_clicks: 0,
    avg_open_rate: 0,
    avg_click_rate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
    loadAnalytics();
  }, []);

  const loadCampaigns = async () => {
    try {
      // Mock data for now - production would use database
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Welcome Series',
          subject: 'Welcome to TSMO!',
          content: 'Thank you for joining us...',
          status: 'sent',
          trigger_type: 'welcome',
          recipients: 150,
          open_rate: 45.2,
          click_rate: 12.3
        }
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('email-analytics');
      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const createCampaign = async (campaignData: Partial<EmailCampaign>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-email-campaign', {
        body: campaignData
      });

      if (error) throw error;

      toast({
        title: "Campaign Created",
        description: "Email campaign has been created successfully.",
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create email campaign.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-campaign', {
        body: { campaign_id: campaignId }
      });

      if (error) throw error;

      toast({
        title: "Campaign Sent",
        description: "Email campaign has been sent successfully.",
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send email campaign.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CampaignForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      subject: '',
      content: '',
      trigger_type: 'manual' as const,
      send_time: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createCampaign(formData);
      setFormData({
        name: '',
        subject: '',
        content: '',
        trigger_type: 'manual',
        send_time: ''
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter campaign name"
              required
            />
          </div>
          <div>
            <Label htmlFor="trigger_type">Trigger Type</Label>
            <Select 
              value={formData.trigger_type} 
              onValueChange={(value) => setFormData({ ...formData, trigger_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome Series</SelectItem>
                <SelectItem value="abandonment">Cart Abandonment</SelectItem>
                <SelectItem value="renewal">Subscription Renewal</SelectItem>
                <SelectItem value="engagement">Re-engagement</SelectItem>
                <SelectItem value="manual">Manual Send</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter email subject"
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Email Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter email content (HTML supported)"
            rows={8}
            required
          />
        </div>

        {formData.trigger_type === 'manual' && (
          <div>
            <Label htmlFor="send_time">Send Time (optional)</Label>
            <Input
              id="send_time"
              type="datetime-local"
              value={formData.send_time}
              onChange={(e) => setFormData({ ...formData, send_time: e.target.value })}
            />
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Marketing Automation</h2>
          <p className="text-muted-foreground">
            Create and manage automated email campaigns
          </p>
        </div>
        <Badge variant="secondary">Beta Feature</Badge>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{analytics.total_sent.toLocaleString()}</p>
              </div>
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opens</p>
                <p className="text-2xl font-bold">{analytics.total_opens.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{analytics.total_clicks.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Open Rate</p>
                <p className="text-2xl font-bold">{analytics.avg_open_rate.toFixed(1)}%</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Click Rate</p>
                <p className="text-2xl font-bold">{analytics.avg_click_rate.toFixed(1)}%</p>
              </div>
              <Send className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge 
                          variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                        >
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.trigger_type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{campaign.recipients} recipients</p>
                      {campaign.open_rate && (
                        <p className="text-sm text-muted-foreground">
                          {campaign.open_rate}% open rate
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => sendCampaign(campaign.id)}
                          disabled={isLoading}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>
                Set up a new email marketing campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Configure automated email triggers and workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Automation Rules</h3>
                <p className="text-muted-foreground mb-4">
                  Configure advanced automation workflows
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics for your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed campaign performance coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};