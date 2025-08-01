import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Shield, AlertTriangle, Activity, TrendingUp, Globe, Clock, 
  Download, Filter, Search, RefreshCw, Play, Pause, Settings,
  BarChart3, PieChart, LineChart, Eye, FileText, Gavel
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  monitoring_enabled: boolean;
  realtime_monitoring?: boolean;
  monitoring_frequency?: string;
  artwork_count?: number;
  last_scan?: string;
  threat_level?: string;
  protection_score?: number;
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
  scan_duration_minutes: number;
}

interface ThreatAlert {
  id: string;
  portfolio_id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  created_at: string;
  is_resolved: boolean;
  metadata?: any;
}

const ProductionPortfolioMonitoring = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [monitoringResults, setMonitoringResults] = useState<MonitoringResult[]>([]);
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('7d');
  
  // Real-time monitoring state
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    activeScans: 0,
    threatsDetected: 0,
    platformsCovered: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      setupRealtimeSubscriptions();
      checkRealTimeStatus();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [timeRange, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load portfolios with enhanced data
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (portfoliosError) throw portfoliosError;

      // Enhance portfolios with additional metrics
      const enhancedPortfolios = await Promise.all(
        (portfoliosData || []).map(async (portfolio) => {
          const { count: artworkCount } = await supabase
            .from('portfolio_items')
            .select('*', { count: 'exact', head: true })
            .eq('portfolio_id', portfolio.id)
            .eq('is_active', true);

          // Get latest scan results
          const { data: latestScan } = await supabase
            .from('portfolio_monitoring_results')
            .select('*')
            .eq('portfolio_id', portfolio.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const protectionScore = latestScan?.[0] ? 
            calculateProtectionScore(latestScan[0]) : 100;

          return {
            ...portfolio,
            artwork_count: artworkCount || 0,
            last_scan: latestScan?.[0]?.created_at,
            protection_score: protectionScore,
            threat_level: getThreatLevel(latestScan?.[0])
          };
        })
      );

      setPortfolios(enhancedPortfolios);

      // Load monitoring results
      const { data: resultsData, error: resultsError } = await supabase
        .from('portfolio_monitoring_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!resultsError) {
        setMonitoringResults(resultsData || []);
      }

      // Load threat alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('portfolio_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!alertsError) {
        setThreatAlerts(alertsData || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring-pro', {
        body: {
          action: 'generate_analytics',
          time_range: timeRange,
          portfolio_id: selectedPortfolio
        }
      });

      if (error) throw error;
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('production-portfolio-monitoring')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'portfolio_monitoring_results' },
        (payload) => {
          console.log('New monitoring result:', payload);
          if (payload.eventType === 'INSERT') {
            setMonitoringResults(prev => [payload.new as MonitoringResult, ...prev.slice(0, 19)]);
            updateRealTimeStats();
            toast.success('New scan results available');
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_alerts' },
        (payload) => {
          console.log('New alert:', payload);
          if (payload.eventType === 'INSERT') {
            setThreatAlerts(prev => [payload.new as ThreatAlert, ...prev.slice(0, 49)]);
            updateRealTimeStats();
            if (payload.new.severity === 'high') {
              toast.error(`High-risk threat detected: ${payload.new.title}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const checkRealTimeStatus = async () => {
    try {
      const { data: realTimePortfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user?.id)
        .eq('realtime_monitoring', true);

      setIsRealTimeActive(realTimePortfolios ? realTimePortfolios.length > 0 : false);
    } catch (error) {
      console.error('Error checking real-time status:', error);
    }
  };

  const updateRealTimeStats = () => {
    setRealTimeStats(prev => ({
      ...prev,
      threatsDetected: prev.threatsDetected + 1,
      lastUpdate: new Date()
    }));
  };

  const startComprehensiveScan = async () => {
    try {
      setScanning(true);
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring-pro', {
        body: {
          action: 'comprehensive_scan',
          portfolio_id: selectedPortfolio,
          scan_type: 'deep',
          platforms: [
            'Google Images', 'Bing Visual Search', 'TinEye', 'Yandex Images',
            'Instagram', 'Pinterest', 'Facebook', 'Twitter/X', 'LinkedIn',
            'DeviantArt', 'Behance', 'ArtStation', 'Dribbble', 'Flickr',
            'Etsy', 'Amazon', 'eBay', 'Reddit', 'Tumblr'
          ]
        }
      });

      if (error) throw error;

      toast.success(`Comprehensive scan started for ${data.portfolios_scanned} portfolios`);
      setTimeout(loadDashboardData, 3000);
    } catch (error) {
      console.error('Error starting comprehensive scan:', error);
      toast.error('Failed to start comprehensive scan');
    } finally {
      setScanning(false);
    }
  };

  const toggleRealTimeMonitoring = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring-pro', {
        body: {
          action: 'realtime_monitoring',
          enabled: !isRealTimeActive
        }
      });

      if (error) throw error;

      setIsRealTimeActive(!isRealTimeActive);
      toast.success(`Real-time monitoring ${!isRealTimeActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling real-time monitoring:', error);
      toast.error('Failed to toggle real-time monitoring');
    }
  };

  const performThreatAssessment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring-pro', {
        body: {
          action: 'threat_assessment',
          portfolio_id: selectedPortfolio
        }
      });

      if (error) throw error;

      toast.success('Threat assessment completed');
      // You could show detailed results in a modal here
    } catch (error) {
      console.error('Error performing threat assessment:', error);
      toast.error('Failed to perform threat assessment');
    }
  };

  const executeAutomatedResponse = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring-pro', {
        body: {
          action: 'automated_response'
        }
      });

      if (error) throw error;

      toast.success(`Processed ${data.alerts_processed} alerts with automated responses`);
      loadDashboardData();
    } catch (error) {
      console.error('Error executing automated response:', error);
      toast.error('Failed to execute automated responses');
    }
  };

  const exportReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-monitoring-pro', {
        body: {
          action: 'generate_analytics',
          time_range: timeRange,
          portfolio_id: selectedPortfolio,
          export_format: 'detailed'
        }
      });

      if (error) throw error;

      // Create and download report
      const reportData = {
        generated_at: new Date().toISOString(),
        time_range: timeRange,
        analytics: data.analytics,
        portfolios: portfolios,
        recent_results: monitoringResults.slice(0, 10),
        threat_alerts: threatAlerts.slice(0, 20)
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-monitoring-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const calculateProtectionScore = (result: any) => {
    if (!result || result.artworks_scanned === 0) return 100;
    const threatRate = result.total_matches / result.artworks_scanned;
    return Math.max(0, Math.round(100 - (threatRate * 100)));
  };

  const getThreatLevel = (result: any) => {
    if (!result) return 'low';
    if (result.high_risk_matches > 3) return 'high';
    if (result.medium_risk_matches > 5) return 'medium';
    return 'low';
  };

  const filteredAlerts = threatAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Portfolio Monitoring</h1>
          <p className="text-muted-foreground">Advanced monitoring and threat detection system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isRealTimeActive ? 'Real-time Active' : 'Real-time Inactive'}
            </span>
          </div>
          <Button
            variant={isRealTimeActive ? "outline" : "default"}
            onClick={toggleRealTimeMonitoring}
            className="flex items-center gap-2"
          >
            {isRealTimeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRealTimeActive ? 'Pause' : 'Start'} Real-time
          </Button>
        </div>
      </div>

      {/* Real-time Stats Bar */}
      {isRealTimeActive && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeStats.activeScans}</div>
                <div className="text-sm text-muted-foreground">Active Scans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{realTimeStats.threatsDetected}</div>
                <div className="text-sm text-muted-foreground">Threats Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeStats.platformsCovered}</div>
                <div className="text-sm text-muted-foreground">Platforms Covered</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Last Update</div>
                <div className="text-xs text-muted-foreground">
                  {realTimeStats.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Advanced Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Portfolio" />
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

            <Button
              onClick={startComprehensiveScan}
              disabled={scanning}
              className="flex items-center gap-2"
            >
              {scanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Comprehensive Scan
            </Button>

            <Button
              variant="outline"
              onClick={performThreatAssessment}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Threat Assessment
            </Button>

            <Button
              variant="outline"
              onClick={executeAutomatedResponse}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Auto Response
            </Button>

            <Button
              variant="outline"
              onClick={exportReport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{portfolio.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={portfolio.monitoring_enabled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {portfolio.monitoring_enabled ? "Active" : "Paused"}
                  </Badge>
                  {portfolio.realtime_monitoring && (
                    <Badge variant="outline" className="text-xs">
                      Real-time
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Artworks:</span>
                  <span className="font-medium">{portfolio.artwork_count || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Protection Score:</span>
                  <span className={`font-medium ${
                    (portfolio.protection_score || 0) >= 80 ? 'text-green-600' :
                    (portfolio.protection_score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {portfolio.protection_score || 100}%
                  </span>
                </div>
                
                <Progress value={portfolio.protection_score || 100} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Threat Level:</span>
                  <Badge 
                    variant={
                      portfolio.threat_level === 'high' ? "destructive" :
                      portfolio.threat_level === 'medium' ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {portfolio.threat_level || 'Low'}
                  </Badge>
                </div>
                
                {portfolio.last_scan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Scan:</span>
                    <span className="text-xs">
                      {new Date(portfolio.last_scan).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Threat Alerts
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart3 className="w-4 h-4 mr-2" />
            Scan Results
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Gavel className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Alert Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Threat Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${
                alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            alert.severity === 'high' ? "destructive" :
                            alert.severity === 'medium' ? "secondary" : "outline"
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <h4 className="font-medium">{alert.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        <span>Type: {alert.alert_type}</span>
                        {alert.metadata?.platform && <span>Platform: {alert.metadata.platform}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {alert.severity === 'high' && (
                        <Button size="sm" variant="default">
                          <Gavel className="w-3 h-3 mr-1" />
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No threat alerts found matching your criteria
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-4">
            {monitoringResults.map((result) => {
              const portfolio = portfolios.find(p => p.id === result.portfolio_id);
              const progress = result.total_artworks > 0 ? 
                Math.round((result.artworks_scanned / result.total_artworks) * 100) : 0;
              
              return (
                <Card key={result.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{portfolio?.name || 'Unknown Portfolio'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.scan_date).toLocaleDateString()} • 
                          Duration: {result.scan_duration_minutes}min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.high_risk_matches > 0 ? "destructive" : "outline"}>
                          {result.total_matches} matches
                        </Badge>
                        <Badge variant="secondary">
                          {result.platforms_scanned.length} platforms
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Scan Progress:</span>
                        <span>{result.artworks_scanned}/{result.total_artworks} artworks</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-red-600 font-medium">{result.high_risk_matches}</div>
                          <div className="text-xs text-muted-foreground">High Risk</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-600 font-medium">{result.medium_risk_matches}</div>
                          <div className="text-xs text-muted-foreground">Medium Risk</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">{result.low_risk_matches}</div>
                          <div className="text-xs text-muted-foreground">Low Risk</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
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
              <Button variant="outline" onClick={loadAnalytics}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Analytics
              </Button>
            </div>
            
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Scans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary?.total_scans || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Threats Detected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.summary?.total_threats || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Protection Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.summary?.avg_protection_score || 100}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      analytics.summary?.trend_analysis?.trend === 'improving' ? 'text-green-600' :
                      analytics.summary?.trend_analysis?.trend === 'declining' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {analytics.summary?.trend_analysis?.change || 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Loading analytics data...
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>Track legal compliance and required actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Compliance tracking features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Center</CardTitle>
              <CardDescription>Generate and download detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={exportReport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Comprehensive Report
                </Button>
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Additional report formats and scheduling options coming soon
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionPortfolioMonitoring;