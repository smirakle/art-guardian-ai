import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Play, Pause, RefreshCw, Eye, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  name: string;
  monitoring_enabled: boolean;
  artwork_count?: number;
}

interface MonitoringResult {
  id: string;
  portfolio_id: string;
  scan_date: string;
  total_artworks: number;
  artworks_scanned: number;
  total_matches: number;
  high_risk_matches: number;
  medium_risk_matches: number;
  low_risk_matches: number;
  platforms_scanned: string[];
}

export function PortfolioMonitoring() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
  const [monitoringResults, setMonitoringResults] = useState<MonitoringResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolios();
    fetchMonitoringResults();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('portfolio-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios'
        },
        (payload) => {
          console.log('Portfolio change detected:', payload);
          fetchPortfolios();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_monitoring_results'
        },
        (payload) => {
          console.log('New monitoring result:', payload);
          // Add the new result to the top of the list
          setMonitoringResults(prev => [payload.new as MonitoringResult, ...prev.slice(0, 9)]);
          toast({
            title: "New Scan Results",
            description: "Portfolio monitoring scan completed",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'portfolio_monitoring_results'
        },
        (payload) => {
          console.log('Monitoring result updated:', payload);
          // Update the specific result
          setMonitoringResults(prev => 
            prev.map(result => 
              result.id === payload.new.id ? payload.new as MonitoringResult : result
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name, monitoring_enabled')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Get artwork counts for each portfolio
      const portfoliosWithCounts = await Promise.all(
        (data || []).map(async (portfolio) => {
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
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoringResults = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_monitoring_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMonitoringResults(data || []);
    } catch (error) {
      console.error('Error fetching monitoring results:', error);
    }
  };

  const startPortfolioScan = async (portfolioId?: string) => {
    try {
      setIsScanning(true);

      const { data, error } = await supabase.functions.invoke('portfolio-monitoring', {
        body: {
          action: 'start_scan',
          portfolio_id: portfolioId || selectedPortfolio,
          scan_type: 'comprehensive'
        }
      });

      if (error) throw error;

      toast({
        title: "Monitoring Started",
        description: `Started monitoring ${portfolioId ? 'portfolio' : 'all portfolios'}`,
      });

      // Refresh results after a delay
      setTimeout(fetchMonitoringResults, 2000);
    } catch (error) {
      console.error('Error starting portfolio scan:', error);
      toast({
        title: "Error",
        description: "Failed to start monitoring",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const togglePortfolioMonitoring = async (portfolioId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({ monitoring_enabled: enabled })
        .eq('id', portfolioId);

      if (error) throw error;

      setPortfolios(portfolios.map(p => 
        p.id === portfolioId ? { ...p, monitoring_enabled: enabled } : p
      ));

      toast({
        title: "Success",
        description: `Monitoring ${enabled ? 'enabled' : 'disabled'} for portfolio`,
      });
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to update monitoring settings",
        variant: "destructive",
      });
    }
  };

  const getScanProgress = (result: MonitoringResult) => {
    if (result.total_artworks === 0) return 0;
    return Math.round((result.artworks_scanned / result.total_artworks) * 100);
  };

  const getThreatLevel = (result: MonitoringResult) => {
    if (result.high_risk_matches > 0) return 'high';
    if (result.medium_risk_matches > 0) return 'medium';
    return 'low';
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
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Portfolio Monitoring
          </CardTitle>
          <CardDescription>Monitor your portfolios for copyright infringement and threats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Portfolio:</label>
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
            <Button 
              onClick={() => startPortfolioScan()} 
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Scan
            </Button>
            <Button variant="outline" onClick={fetchMonitoringResults}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{portfolio.name}</CardTitle>
                <Badge variant={portfolio.monitoring_enabled ? "default" : "secondary"}>
                  {portfolio.monitoring_enabled ? "Active" : "Paused"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Artworks:</span>
                  <span>{portfolio.artwork_count || 0}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startPortfolioScan(portfolio.id)}
                    disabled={isScanning || !portfolio.monitoring_enabled}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Scan
                  </Button>
                  <Button
                    size="sm"
                    variant={portfolio.monitoring_enabled ? "outline" : "default"}
                    onClick={() => togglePortfolioMonitoring(portfolio.id, !portfolio.monitoring_enabled)}
                  >
                    {portfolio.monitoring_enabled ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Monitoring Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Monitoring Results</CardTitle>
          <CardDescription>Latest scan results across all portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monitoringResults.map((result) => {
              const portfolio = portfolios.find(p => p.id === result.portfolio_id);
              const progress = getScanProgress(result);
              const threatLevel = getThreatLevel(result);
              
              return (
                <div key={result.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{portfolio?.name || 'Unknown Portfolio'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.scan_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={threatLevel === 'high' ? "destructive" : threatLevel === 'medium' ? "secondary" : "outline"}>
                        {threatLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {threatLevel === 'medium' && <Shield className="w-3 h-3 mr-1" />}
                        {result.total_matches} matches
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scan Progress:</span>
                      <span>{result.artworks_scanned}/{result.total_artworks} artworks</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Platforms: {result.platforms_scanned.join(', ')}</span>
                      <span>
                        High: {result.high_risk_matches} | 
                        Medium: {result.medium_risk_matches} | 
                        Low: {result.low_risk_matches}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {monitoringResults.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No monitoring results yet. Start a scan to see results here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}