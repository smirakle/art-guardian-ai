import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Clock, Users, BarChart3, Settings, Plus, Trash2, Play, Pause } from 'lucide-react';
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
  created_at?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_conditions: any;
  campaign_id: string;
  delay_minutes: number;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  email_campaigns?: { name: string; subject: string };
}

export const EmailMarketingAutomation = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
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
    loadAutomationRules();
    loadSubscribers();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select(`
          id,
          name,
          subject,
          content,
          status,
          trigger_type,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get recipient counts for each campaign
      const campaignsWithStats = await Promise.all(
        (campaigns || []).map(async (campaign) => {
          const { data: recipients } = await supabase
            .from('email_campaign_recipients')
            .select('status, opened_at, clicked_at')
            .eq('campaign_id', campaign.id);

          const totalRecipients = recipients?.length || 0;
          const opened = recipients?.filter(r => r.opened_at).length || 0;
          const clicked = recipients?.filter(r => r.clicked_at).length || 0;

          return {
            ...campaign,
            status: campaign.status as 'draft' | 'scheduled' | 'sent' | 'paused',
            trigger_type: campaign.trigger_type as 'welcome' | 'abandonment' | 'renewal' | 'engagement' | 'manual',
            recipients: totalRecipients,
            open_rate: totalRecipients > 0 ? (opened / totalRecipients) * 100 : 0,
            click_rate: totalRecipients > 0 ? (clicked / totalRecipients) * 100 : 0
          };
        })
      );

      setCampaigns(campaignsWithStats);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load automation rules
  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive"
      });
    }
  };

  const addSubscriber = async (email: string, firstName?: string, lastName?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_subscribers')
        .insert({
          user_id: userData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'subscribed'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSubscribers(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Subscriber added successfully"
      });
      return data;
    } catch (error) {
      console.error('Error adding subscriber:', error);
      toast({
        title: "Error", 
        description: "Failed to add subscriber",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeSubscriber = async (subscriberId: string) => {
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('id', subscriberId);

      if (error) throw error;
      
      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === subscriberId 
            ? { ...sub, status: 'unsubscribed' } 
            : sub
        )
      );
      toast({
        title: "Success",
        description: "Subscriber removed successfully"
      });
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber", 
        variant: "destructive"
      });
    }
  };

  const loadAutomationRules = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('email-automation-rules');
      
      if (error) throw error;
      
      setAutomationRules(data?.rules || []);
    } catch (error) {
      console.error('Error loading automation rules:', error);
      setAutomationRules([]);
    }
  };

  // Create automation rule
  const createAutomationRule = async (ruleData: {
    name: string;
    description?: string;
    triggerEvent: string;
    triggerConditions: any;
    campaignId: string;
    delayMinutes: number;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('email-automation-rules', {
        body: ruleData
      });
      
      if (error) throw error;
      
      toast({
        title: "Automation Rule Created",
        description: "Email automation rule has been created successfully.",
      });

      loadAutomationRules(); // Refresh the rules list
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating automation rule:', error);
      toast({
        title: "Error",
        description: "Failed to create automation rule: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Toggle automation rule
  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('email-automation-rules', {
        body: { ruleId, isActive }
      });
      
      if (error) throw error;
      
      toast({
        title: isActive ? "Rule Activated" : "Rule Deactivated",
        description: `Automation rule has been ${isActive ? 'activated' : 'deactivated'}.`,
      });

      loadAutomationRules(); // Refresh the rules list
    } catch (error: any) {
      console.error('Error toggling automation rule:', error);
      toast({
        title: "Error",
        description: "Failed to update automation rule.",
        variant: "destructive",
      });
    }
  };

  // Automation Rule Form Component
  const AutomationRuleForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      triggerEvent: 'user_signup',
      campaignId: '',
      delayMinutes: 0,
      triggerConditions: {}
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.campaignId) {
        toast({
          title: "Error",
          description: "Please select a campaign for this automation rule.",
          variant: "destructive",
        });
        return;
      }
      
      createAutomationRule(formData);
      setFormData({
        name: '',
        description: '',
        triggerEvent: 'user_signup',
        campaignId: '',
        delayMinutes: 0,
        triggerConditions: {}
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter rule name"
              required
            />
          </div>
          <div>
            <Label htmlFor="trigger-event">Trigger Event</Label>
            <Select 
              value={formData.triggerEvent} 
              onValueChange={(value) => setFormData({ ...formData, triggerEvent: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_signup">User Signup</SelectItem>
                <SelectItem value="subscription_renewed">Subscription Renewed</SelectItem>
                <SelectItem value="cart_abandoned">Cart Abandoned</SelectItem>
                <SelectItem value="user_inactive">User Inactive</SelectItem>
                <SelectItem value="custom_event">Custom Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="campaign-select">Select Campaign</Label>
          <Select 
            value={formData.campaignId} 
            onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name} - {campaign.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe when this rule should trigger"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="delay">Delay (minutes)</Label>
          <Input
            id="delay"
            type="number"
            min="0"
            value={formData.delayMinutes}
            onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Create Automation Rule
        </Button>
      </form>
    );
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('email-analytics');
      
      if (error) throw error;
      
      setAnalytics({
        total_sent: data?.totalSent || 0,
        total_opens: data?.totalOpened || 0,
        total_clicks: data?.totalClicked || 0,
        avg_open_rate: data?.avgOpenRate || 0,
        avg_click_rate: data?.avgClickRate || 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        total_sent: 0,
        total_opens: 0,
        total_clicks: 0,
        avg_open_rate: 0,
        avg_click_rate: 0
      });
    }
  };

  const createCampaign = async (campaignData: Partial<EmailCampaign>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-email-campaign', {
        body: {
          name: campaignData.name,
          subject: campaignData.subject,
          content: campaignData.content,
          triggerType: campaignData.trigger_type,
          sendTime: campaignData.send_time
        }
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

  const SubscriberForm = ({ onAddSubscriber }: { onAddSubscriber: (email: string, firstName?: string, lastName?: string) => void }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      
      onAddSubscriber(email, firstName || undefined, lastName || undefined);
      setEmail('');
      setFirstName('');
      setLastName('');
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="subscriber@example.com"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Add Subscriber
        </Button>
      </form>
    );
  };

  const sendCampaign = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-campaign', {
        body: { campaignId }
      });

      if (error) throw error;

      toast({
        title: "Campaign Sent",
        description: `Campaign sent! Delivered to ${data?.sent || 0} recipients.`,
      });

      loadCampaigns();
      loadAnalytics();
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
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
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

        <TabsContent value="subscribers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Subscriber</CardTitle>
                <CardDescription>
                  Add email subscribers to your mailing list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriberForm onAddSubscriber={addSubscriber} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscribers ({subscribers.length})</CardTitle>
                <CardDescription>
                  Manage your email subscriber list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscribers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No subscribers yet. Add your first subscriber above.
                    </p>
                  ) : (
                    subscribers.map((subscriber) => (
                      <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{subscriber.email}</div>
                          {(subscriber.first_name || subscriber.last_name) && (
                            <div className="text-sm text-muted-foreground">
                              {subscriber.first_name} {subscriber.last_name}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Status: {subscriber.status} • Subscribed: {new Date(subscriber.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {subscriber.status === 'subscribed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubscriber(subscriber.id)}
                          >
                            Unsubscribe
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <div className="space-y-6">
            {/* Existing Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Active Automation Rules</CardTitle>
                <CardDescription>
                  Manage your automated email workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {automationRules.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Automation Rules</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first automation rule to start sending targeted emails automatically
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {automationRules.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{rule.name}</h4>
                            {rule.description && (
                              <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{rule.trigger_event.replace('_', ' ')}</Badge>
                              {rule.delay_minutes > 0 && (
                                <Badge variant="secondary">{rule.delay_minutes}min delay</Badge>
                              )}
                              <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            {rule.email_campaigns && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Campaign: {rule.email_campaigns.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {rule.execution_count} executions
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAutomationRule(rule.id, !rule.is_active)}
                            >
                              {rule.is_active ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create New Rule */}
            <Card>
              <CardHeader>
                <CardTitle>Create Automation Rule</CardTitle>
                <CardDescription>
                  Set up automated email triggers based on user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AutomationRuleForm />
              </CardContent>
            </Card>
          </div>
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