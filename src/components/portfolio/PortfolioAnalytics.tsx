import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Shield, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  threats_by_date: Array<{
    date: string;
    high: number;
    medium: number;
    low: number;
  }>;
  platforms_distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  portfolio_performance: Array<{
    portfolio: string;
    total_scanned: number;
    threats_found: number;
    protection_score: number;
  }>;
  summary_stats: {
    total_scans: number;
    total_threats: number;
    avg_threats_per_scan: number;
    most_vulnerable_portfolio: string;
  };
}

export function PortfolioAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');
  const [portfolios, setPortfolios] = useState<Array<{id: string, name: string}>>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
    fetchAnalytics();
  }, [timeRange, selectedPortfolio]);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Mock analytics data - in a real app, this would come from your analytics service
      const mockAnalytics: AnalyticsData = {
        threats_by_date: [
          { date: '2024-01-20', high: 2, medium: 5, low: 3 },
          { date: '2024-01-21', high: 1, medium: 8, low: 6 },
          { date: '2024-01-22', high: 3, medium: 4, low: 2 },
          { date: '2024-01-23', high: 0, medium: 6, low: 4 },
          { date: '2024-01-24', high: 4, medium: 7, low: 5 },
          { date: '2024-01-25', high: 1, medium: 3, low: 8 },
          { date: '2024-01-26', high: 2, medium: 9, low: 1 },
        ],
        platforms_distribution: [
          { name: 'Instagram', value: 35, color: '#8884d8' },
          { name: 'Pinterest', value: 28, color: '#82ca9d' },
          { name: 'Facebook', value: 20, color: '#ffc658' },
          { name: 'Twitter', value: 12, color: '#ff7c7c' },
          { name: 'Others', value: 5, color: '#8dd1e1' },
        ],
        portfolio_performance: [
          { portfolio: 'Digital Art Collection', total_scanned: 45, threats_found: 8, protection_score: 82 },
          { portfolio: 'Photography Portfolio', total_scanned: 32, threats_found: 12, protection_score: 62 },
          { portfolio: 'Graphic Design Works', total_scanned: 28, threats_found: 3, protection_score: 89 },
          { portfolio: 'Illustrations', total_scanned: 15, threats_found: 7, protection_score: 53 },
        ],
        summary_stats: {
          total_scans: 120,
          total_threats: 30,
          avg_threats_per_scan: 0.25,
          most_vulnerable_portfolio: 'Photography Portfolio'
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Portfolios</SelectItem>
              {portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary_stats.total_scans}</div>
            <p className="text-xs text-muted-foreground">
              Across all portfolios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary_stats.total_threats}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary_stats.avg_threats_per_scan.toFixed(2)} per scan avg.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.portfolio_performance.reduce((acc, p) => acc + p.protection_score, 0) / analytics.portfolio_performance.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across portfolios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">
              Improvement this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threats Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Threats Over Time</CardTitle>
            <CardDescription>Daily threat detection trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.threats_by_date}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line type="monotone" dataKey="high" stroke="#ef4444" name="High Risk" />
                <Line type="monotone" dataKey="medium" stroke="#f59e0b" name="Medium Risk" />
                <Line type="monotone" dataKey="low" stroke="#10b981" name="Low Risk" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Threats by Platform</CardTitle>
            <CardDescription>Distribution of threats across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.platforms_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.platforms_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Protection effectiveness by portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.portfolio_performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="portfolio" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="protection_score" fill="#8884d8" name="Protection Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Portfolio Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>Detailed performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.portfolio_performance.map((portfolio, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{portfolio.portfolio}</h4>
                  <p className="text-sm text-muted-foreground">
                    {portfolio.total_scanned} artworks scanned • {portfolio.threats_found} threats found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={portfolio.protection_score >= 80 ? "default" : portfolio.protection_score >= 60 ? "secondary" : "destructive"}>
                    {portfolio.protection_score}% Protected
                  </Badge>
                  {portfolio.portfolio === analytics.summary_stats.most_vulnerable_portfolio && (
                    <Badge variant="outline">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Needs Attention
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}