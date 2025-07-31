import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Shield, AlertTriangle, TrendingUp, Eye, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  monitoring_enabled: boolean;
  created_at: string;
  artwork_count?: number;
  last_scan?: string;
  threat_level?: string;
}

interface MonitoringStats {
  total_portfolios: number;
  active_monitoring: number;
  total_artworks: number;
  recent_threats: number;
  monitoring_coverage: number;
}

export function PortfolioDashboard() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    total_portfolios: 0,
    active_monitoring: 0,
    total_artworks: 0,
    recent_threats: 0,
    monitoring_coverage: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('portfolio-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios'
        },
        (payload) => {
          console.log('Portfolio change detected:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_monitoring_results'
        },
        (payload) => {
          console.log('Portfolio monitoring result change:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_alerts'
        },
        (payload) => {
          console.log('Portfolio alert change:', payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (portfoliosError) throw portfoliosError;

      // Get artwork counts for each portfolio
      const portfoliosWithCounts = await Promise.all(
        (portfoliosData || []).map(async (portfolio) => {
          const { count } = await supabase
            .from('portfolio_items')
            .select('*', { count: 'exact', head: true })
            .eq('portfolio_id', portfolio.id)
            .eq('is_active', true);
          
          return {
            ...portfolio,
            artwork_count: count || 0
          };
        })
      );

      setPortfolios(portfoliosWithCounts);

      // Calculate stats
      const totalPortfolios = portfoliosWithCounts.length;
      const activeMonitoring = portfoliosWithCounts.filter(p => p.monitoring_enabled).length;
      const totalArtworks = portfoliosWithCounts.reduce((sum, p) => sum + (p.artwork_count || 0), 0);

      // Get real recent threats from portfolio alerts (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentAlerts } = await supabase
        .from('portfolio_alerts')
        .select('id')
        .gte('created_at', yesterday.toISOString());

      setStats({
        total_portfolios: totalPortfolios,
        active_monitoring: activeMonitoring,
        total_artworks: totalArtworks,
        recent_threats: recentAlerts?.length || 0,
        monitoring_coverage: totalPortfolios > 0 ? Math.round((activeMonitoring / totalPortfolios) * 100) : 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuickScan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring', {
        body: { action: 'quick_scan' }
      });

      if (error) throw error;

      toast({
        title: "Quick Scan Started",
        description: "Scanning all active portfolios for threats",
      });
    } catch (error) {
      console.error('Error starting quick scan:', error);
      toast({
        title: "Error",
        description: "Failed to start quick scan",
        variant: "destructive",
      });
    }
  };

  const startRealtimeSimulation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-realtime-data', {
        body: { action: 'start_realtime_simulation' }
      });

      if (error) throw error;

      toast({
        title: "Real-time Simulation Started",
        description: "Portfolio monitoring data will be generated continuously for 1 hour",
      });
    } catch (error) {
      console.error('Error starting real-time simulation:', error);
      toast({
        title: "Error",
        description: "Failed to start real-time simulation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolios</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_portfolios}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_monitoring} actively monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Artworks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_artworks}</div>
            <p className="text-xs text-muted-foreground">
              Across all portfolios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_threats}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monitoring_coverage}%</div>
            <Progress value={stats.monitoring_coverage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your portfolio monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={startQuickScan} className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Start Quick Scan
            </Button>
            <Button onClick={startRealtimeSimulation} variant="secondary" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Start Real-time Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View All Threats
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Create Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Portfolios */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Portfolios</CardTitle>
          <CardDescription>Your latest portfolio activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolios.slice(0, 5).map((portfolio) => (
              <div key={portfolio.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{portfolio.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {portfolio.artwork_count} artworks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={portfolio.monitoring_enabled ? "default" : "secondary"}>
                    {portfolio.monitoring_enabled ? "Monitoring" : "Paused"}
                  </Badge>
                  <Badge variant="outline">
                    {portfolio.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
            {portfolios.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No portfolios found. Create your first portfolio to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}