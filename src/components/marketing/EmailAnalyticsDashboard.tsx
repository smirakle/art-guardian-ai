import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Mail, MousePointer, Eye, Users, Clock, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalCampaigns: number;
  activeCampaigns: number;
  deliverabilityRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

interface ChartData {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface DeliverabilityData {
  domain: string;
  deliverability_rate: number;
  bounce_rate: number;
  complaint_rate: number;
  reputation_score: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export const EmailAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [deliverabilityData, setDeliverabilityData] = useState<DeliverabilityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch overall analytics
      const { data: analytics, error } = await supabase.functions.invoke('email-analytics', {
        body: { timeRange }
      });

      if (error) throw error;
      setAnalyticsData(analytics);

      // Fetch chart data for trends
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select(`
          created_at,
          email_campaign_recipients(status, opened_at, clicked_at)
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (campaigns) {
        const chartData = campaigns.map(campaign => {
          const recipients = campaign.email_campaign_recipients || [];
          const sent = recipients.filter(r => r.status !== 'pending').length;
          const opened = recipients.filter(r => r.opened_at).length;
          const clicked = recipients.filter(r => r.clicked_at).length;

          return {
            date: new Date(campaign.created_at).toLocaleDateString(),
            sent,
            opened,
            clicked,
            openRate: sent > 0 ? (opened / sent) * 100 : 0,
            clickRate: sent > 0 ? (clicked / sent) * 100 : 0
          };
        }).reverse();

        setChartData(chartData);
      }

      // Fetch deliverability stats
      const { data: deliverability } = await supabase
        .from('email_deliverability_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (deliverability) {
        setDeliverabilityData(deliverability);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = () => {
    fetchAnalytics();
    toast({
      title: "Analytics Refreshed",
      description: "Analytics data has been updated.",
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "primary" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {trendValue}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Email Analytics</h2>
          <Button disabled>Refreshing...</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const pieData = [
    { name: 'Opened', value: analyticsData.totalOpened, color: COLORS[0] },
    { name: 'Clicked', value: analyticsData.totalClicked, color: COLORS[1] },
    { name: 'Unopened', value: analyticsData.totalSent - analyticsData.totalOpened, color: COLORS[3] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your email campaign performance
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded border border-input bg-background px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={refreshAnalytics}>Refresh</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Campaigns"
          value={analyticsData.totalCampaigns}
          icon={Mail}
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="Email Sent"
          value={analyticsData.totalSent.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue={8}
        />
        <StatCard
          title="Open Rate"
          value={`${analyticsData.avgOpenRate.toFixed(1)}%`}
          icon={Eye}
          trend={analyticsData.avgOpenRate > 20 ? 'up' : 'down'}
          trendValue={2.5}
          color={analyticsData.avgOpenRate > 20 ? 'green' : 'red'}
        />
        <StatCard
          title="Click Rate"
          value={`${analyticsData.avgClickRate.toFixed(1)}%`}
          icon={MousePointer}
          trend={analyticsData.avgClickRate > 3 ? 'up' : 'down'}
          trendValue={1.2}
          color={analyticsData.avgClickRate > 3 ? 'green' : 'red'}
        />
      </div>

      {/* Performance Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Performance Trends</CardTitle>
            <CardDescription>
              Track your campaign performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="openRate" stroke={COLORS[0]} name="Open Rate %" />
                <Line type="monotone" dataKey="clickRate" stroke={COLORS[1]} name="Click Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
            <CardDescription>
              Distribution of subscriber engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Email Volume Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Email Volume Trends</CardTitle>
          <CardDescription>
            Track the volume of emails sent, opened, and clicked over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sent" fill={COLORS[0]} name="Sent" />
              <Bar dataKey="opened" fill={COLORS[1]} name="Opened" />
              <Bar dataKey="clicked" fill={COLORS[2]} name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deliverability Stats */}
      {deliverabilityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deliverability Performance</CardTitle>
            <CardDescription>
              Monitor your sender reputation and deliverability by domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliverabilityData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.reputation_score > 80 ? 'bg-green-500' : 
                      item.reputation_score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{item.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        Reputation: {item.reputation_score}/100
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-green-600">{item.deliverability_rate.toFixed(1)}%</span> delivered
                    </p>
                    <p className="text-sm">
                      <span className="text-red-600">{item.bounce_rate.toFixed(1)}%</span> bounced
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Recommendations */}
      {(analyticsData.avgOpenRate < 15 || analyticsData.avgClickRate < 2) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <ul className="space-y-2">
              {analyticsData.avgOpenRate < 15 && (
                <li>• Your open rate is below industry average (20%). Consider A/B testing subject lines or reviewing your send times.</li>
              )}
              {analyticsData.avgClickRate < 2 && (
                <li>• Your click rate could be improved. Try more compelling call-to-action buttons and relevant content.</li>
              )}
              <li>• Consider segmenting your audience for more targeted campaigns.</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};