import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Clock, 
  Eye, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DailyMetrics {
  date: string;
  total_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  total_sessions: number;
  total_page_views: number;
  avg_session_duration_seconds: number;
  avg_pages_per_session: number;
  bounce_rate: number;
}

interface SessionData {
  device_type: string;
  browser: string;
  is_returning_visitor: boolean;
  duration_seconds: number;
  page_views: number;
}

interface TopPage {
  page_path: string;
  views: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const RetentionDashboard = () => {
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [todayStats, setTodayStats] = useState<{
    visitors: number;
    sessions: number;
    pageViews: number;
    avgDuration: number;
    bounceRate: number;
    returningRate: number;
  } | null>(null);
  const [deviceStats, setDeviceStats] = useState<{ name: string; value: number }[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [realtimeVisitors, setRealtimeVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch historical metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: metricsData } = await supabase
        .from('visitor_retention_metrics')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (metricsData) {
        setMetrics(metricsData);
      }

      // Fetch today's live stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySessions } = await supabase
        .from('visitor_sessions')
        .select('*')
        .gte('started_at', `${today}T00:00:00Z`);

      if (todaySessions && todaySessions.length > 0) {
        const uniqueVisitors = new Set(todaySessions.map(s => s.visitor_id)).size;
        const totalPageViews = todaySessions.reduce((sum, s) => sum + (s.page_views || 0), 0);
        const avgDuration = todaySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / todaySessions.length;
        const bounces = todaySessions.filter(s => s.is_bounce).length;
        const returning = todaySessions.filter(s => s.is_returning_visitor).length;

        setTodayStats({
          visitors: uniqueVisitors,
          sessions: todaySessions.length,
          pageViews: totalPageViews,
          avgDuration: Math.round(avgDuration),
          bounceRate: Math.round((bounces / todaySessions.length) * 100),
          returningRate: Math.round((returning / todaySessions.length) * 100),
        });

        // Device stats
        const deviceCounts: Record<string, number> = {};
        todaySessions.forEach(s => {
          const device = s.device_type || 'unknown';
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });
        setDeviceStats(Object.entries(deviceCounts).map(([name, value]) => ({ name, value })));
      } else {
        setTodayStats({
          visitors: 0,
          sessions: 0,
          pageViews: 0,
          avgDuration: 0,
          bounceRate: 0,
          returningRate: 0,
        });
      }

      // Fetch top pages
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (pageViews) {
        const pageCounts: Record<string, number> = {};
        pageViews.forEach(pv => {
          pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1;
        });
        const sorted = Object.entries(pageCounts)
          .map(([page_path, views]) => ({ page_path, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
        setTopPages(sorted);
      }

      // Realtime visitors (active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('visitor_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', fiveMinutesAgo)
        .is('ended_at', null);
      
      setRealtimeVisitors(count || 0);

    } catch (error) {
      console.error('Error fetching retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Visitor Retention</h2>
          <p className="text-muted-foreground">Real-time analytics and visitor behavior tracking</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Realtime Badge */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Real-time visitors</span>
            </div>
            <span className="text-3xl font-bold text-primary">{realtimeVisitors}</span>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.visitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats?.returningRate || 0}% returning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats?.sessions ? (todayStats.pageViews / todayStats.sessions).toFixed(1) : 0} per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(todayStats?.avgDuration || 0)}</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.bounceRate || 0}%</div>
            <Progress value={100 - (todayStats?.bounceRate || 0)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Trends (30 Days)</CardTitle>
              <CardDescription>Daily visitors and sessions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_visitors" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Visitors"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="returning_visitors" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Returning"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Duration</CardTitle>
                <CardDescription>Average time spent per session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatDuration(value)}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="avg_session_duration_seconds" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate Trend</CardTitle>
                <CardDescription>Percentage of single-page sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Line type="monotone" dataKey="bounce_rate" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most viewed pages in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No page view data yet</p>
                ) : (
                  topPages.map((page, index) => (
                    <div key={page.page_path} className="flex items-center gap-4">
                      <span className="text-muted-foreground w-6">{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium truncate">{page.page_path}</p>
                        <Progress value={(page.views / (topPages[0]?.views || 1)) * 100} className="h-2 mt-1" />
                      </div>
                      <Badge variant="secondary">{page.views} views</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Today's visitors by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Sessions by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No device data yet</p>
                  ) : (
                    deviceStats.map((device) => (
                      <div key={device.name} className="flex items-center gap-3">
                        {getDeviceIcon(device.name)}
                        <div className="flex-1">
                          <p className="font-medium capitalize">{device.name}</p>
                          <Progress 
                            value={(device.value / deviceStats.reduce((a, b) => a + b.value, 0)) * 100} 
                            className="h-2 mt-1" 
                          />
                        </div>
                        <span className="text-muted-foreground">{device.value}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
