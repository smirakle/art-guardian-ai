import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download, 
  FileText, 
  Calendar,
  Activity,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TemplateAnalytics {
  template_id: string;
  total_views: number;
  total_downloads: number;
  total_generations: number;
  conversion_rate: number;
  date: string;
}

interface OverallStats {
  totalTemplates: number;
  totalDownloads: number;
  totalGenerations: number;
  averageConversion: number;
  mostPopularTemplate: string;
}

const LegalTemplateAnalytics = () => {
  const [analytics, setAnalytics] = useState<TemplateAnalytics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch template usage stats
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
      
      const { data: statsData, error: statsError } = await supabase
        .from('template_usage_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (statsError) throw statsError;

      setAnalytics(statsData || []);

      // Calculate overall stats
      const totalDownloads = statsData?.reduce((sum, stat) => sum + stat.total_downloads, 0) || 0;
      const totalGenerations = statsData?.reduce((sum, stat) => sum + stat.total_generations, 0) || 0;
      const averageConversion = statsData?.length ? 
        statsData.reduce((sum, stat) => sum + stat.conversion_rate, 0) / statsData.length : 0;
      
      // Find most popular template
      const templateCounts = statsData?.reduce((acc, stat) => {
        acc[stat.template_id] = (acc[stat.template_id] || 0) + stat.total_downloads;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const mostPopular = Object.entries(templateCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      setOverallStats({
        totalTemplates: new Set(statsData?.map(s => s.template_id)).size,
        totalDownloads,
        totalGenerations,
        averageConversion,
        mostPopularTemplate: mostPopular
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  const pieData = analytics.reduce((acc, stat) => {
    const existing = acc.find(item => item.name === stat.template_id);
    if (existing) {
      existing.value += stat.total_downloads;
    } else {
      acc.push({ name: stat.template_id, value: stat.total_downloads });
    }
    return acc;
  }, [] as { name: string; value: number }[]).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === range 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Templates</span>
              </div>
              <div className="text-2xl font-bold mt-2">{overallStats.totalTemplates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Downloads</span>
              </div>
              <div className="text-2xl font-bold mt-2">{overallStats.totalDownloads.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Generations</span>
              </div>
              <div className="text-2xl font-bold mt-2">{overallStats.totalGenerations.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Avg. Conversion</span>
              </div>
              <div className="text-2xl font-bold mt-2">{overallStats.averageConversion.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Template Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total_downloads" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="total_generations" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Template Popularity Distribution</CardTitle>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-4">
            {analytics.map((stat, index) => (
              <Card key={`${stat.template_id}-${stat.date}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{stat.template_id}</span>
                    <Badge variant={stat.conversion_rate > 10 ? "default" : "secondary"}>
                      {stat.conversion_rate.toFixed(1)}% conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Views:</span>
                      <span className="font-medium ml-2">{stat.total_views}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Downloads:</span>
                      <span className="font-medium ml-2">{stat.total_downloads}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Generations:</span>
                      <span className="font-medium ml-2">{stat.total_generations}</span>
                    </div>
                  </div>
                  <Progress value={stat.conversion_rate} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalTemplateAnalytics;