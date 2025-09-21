import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Users, DollarSign, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  type: 'counter' | 'gauge' | 'histogram';
}

interface DashboardMetrics {
  userGrowth: Array<{ date: string; users: number; active: number }>;
  revenueMetrics: Array<{ month: string; revenue: number; subscriptions: number }>;
  systemPerformance: Array<{ service: string; uptime: number; responseTime: number }>;
  securityEvents: Array<{ type: string; count: number; severity: 'low' | 'medium' | 'high' | 'critical' }>;
  apiUsage: Array<{ endpoint: string; requests: number; errors: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ProductionMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, these would be separate API calls
      // For now, we'll generate sample data
      const sampleMetrics: DashboardMetrics = {
        userGrowth: generateUserGrowthData(),
        revenueMetrics: generateRevenueData(),
        systemPerformance: generatePerformanceData(),
        securityEvents: generateSecurityData(),
        apiUsage: generateApiUsageData()
      };

      setMetrics(sampleMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: "Error Loading Metrics",
        description: "Failed to load production metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowthData = () => {
    const data = [];
    const baseDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 500 + i * 10,
        active: Math.floor(Math.random() * 50) + 250 + i * 5
      });
    }
    return data;
  };

  const generateRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 30000 + index * 5000,
      subscriptions: Math.floor(Math.random() * 500) + 200 + index * 50
    }));
  };

  const generatePerformanceData = () => {
    const services = ['Web App', 'API Gateway', 'Database', 'Edge Functions', 'Storage'];
    return services.map(service => ({
      service,
      uptime: 99.5 + Math.random() * 0.5,
      responseTime: Math.floor(Math.random() * 200) + 50
    }));
  };

  const generateSecurityData = () => {
    return [
      { type: 'Authentication', count: 12, severity: 'low' as const },
      { type: 'Rate Limiting', count: 8, severity: 'medium' as const },
      { type: 'Unauthorized Access', count: 3, severity: 'high' as const },
      { type: 'Data Breach Attempt', count: 1, severity: 'critical' as const }
    ];
  };

  const generateApiUsageData = () => {
    const endpoints = ['/api/auth', '/api/artwork', '/api/scan', '/api/monitor', '/api/legal'];
    return endpoints.map(endpoint => ({
      endpoint,
      requests: Math.floor(Math.random() * 10000) + 1000,
      errors: Math.floor(Math.random() * 50) + 5
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load metrics</p>
          <Button onClick={loadMetrics} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Metrics</h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {metrics.userGrowth[metrics.userGrowth.length - 1]?.users.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.3%</span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  ${metrics.revenueMetrics[metrics.revenueMetrics.length - 1]?.revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+18.7%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">99.8%</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">A+</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs bg-green-500">
                Secure
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Total Users"
              />
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue and Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.revenueMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.systemPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="uptime" fill="#82ca9d" name="Uptime %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Security Events and API Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.securityEvents}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.securityEvents.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.apiUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#8884d8" name="Requests" />
                <Bar dataKey="errors" fill="#ff7300" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};