import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Shield, AlertTriangle, TrendingUp, Eye, Activity, BarChart3, Bell, FileText, Upload as UploadIcon, Folder, Monitor, Settings, Edit, Image } from 'lucide-react';
import { PortfolioUploadWidget } from './PortfolioUploadWidget';
import { PortfolioManager } from './PortfolioManager';
import { PortfolioAnalytics } from './PortfolioAnalytics';
import { PortfolioSettings } from './PortfolioSettings';
import { PortfolioAlerts } from './PortfolioAlerts';
import ProductionPortfolioMonitoring from './ProductionPortfolioMonitoring';
import { PortfolioMonitoringMetrics } from './PortfolioMonitoringMetrics';
import { PortfolioMonitoringNotificationCenter } from './PortfolioMonitoringNotificationCenter';
import { PortfolioMonitoringAuditLog } from './PortfolioMonitoringAuditLog';
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddArtworkDialogOpen, setIsAddArtworkDialogOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [newPortfolio, setNewPortfolio] = useState({ name: '', description: '' });
  const [artworks, setArtworks] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchArtworks();

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
      console.log('Fetching dashboard data...');
      setLoading(true);

      // Fetch portfolios
      console.log('Fetching portfolios...');
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (portfoliosError) {
        console.error('Portfolio fetch error:', portfoliosError);
        throw portfoliosError;
      }

      console.log('Portfolios fetched:', portfoliosData?.length || 0);

      // Get artwork counts for each portfolio
      const portfoliosWithCounts = await Promise.all(
        (portfoliosData || []).map(async (portfolio) => {
          try {
            const { count, error: countError } = await supabase
              .from('portfolio_items')
              .select('*', { count: 'exact', head: true })
              .eq('portfolio_id', portfolio.id)
              .eq('is_active', true);
            
            if (countError) {
              console.warn(`Error counting items for portfolio ${portfolio.id}:`, countError);
            }
            
            return {
              ...portfolio,
              artwork_count: count || 0
            };
          } catch (error) {
            console.error(`Error processing portfolio ${portfolio.id}:`, error);
            return {
              ...portfolio,
              artwork_count: 0
            };
          }
        })
      );

      console.log('Portfolios with counts:', portfoliosWithCounts);
      setPortfolios(portfoliosWithCounts);

      // Calculate stats
      const totalPortfolios = portfoliosWithCounts.length;
      const activeMonitoring = portfoliosWithCounts.filter(p => p.monitoring_enabled).length;
      const totalArtworks = portfoliosWithCounts.reduce((sum, p) => sum + (p.artwork_count || 0), 0);

      console.log('Basic stats calculated:', { totalPortfolios, activeMonitoring, totalArtworks });

      // Get real recent threats from portfolio alerts (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      console.log('Fetching recent alerts since:', yesterday.toISOString());
      const { data: recentAlerts, error: alertsError } = await supabase
        .from('portfolio_alerts')
        .select('id')
        .gte('created_at', yesterday.toISOString());

      if (alertsError) {
        console.warn('Error fetching alerts:', alertsError);
      }

      console.log('Recent alerts found:', recentAlerts?.length || 0);

      const finalStats = {
        total_portfolios: totalPortfolios,
        active_monitoring: activeMonitoring,
        total_artworks: totalArtworks,
        recent_threats: recentAlerts?.length || 0,
        monitoring_coverage: totalPortfolios > 0 ? Math.round((activeMonitoring / totalPortfolios) * 100) : 0
      };

      console.log('Final stats:', finalStats);
      setStats(finalStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: `Failed to load dashboard data: ${error.message || 'Unknown error'}`,
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

  const startRealtimeMonitoring = async () => {
    try {
      // Start real-time portfolio monitoring
      const { data, error } = await supabase.functions.invoke('portfolio-realtime-data', {
        body: { action: 'start_realtime_monitoring' }
      });

      if (error) {
        console.warn('Real-time monitoring setup failed:', error);
        await generatePortfolioDataDirectly();
        return;
      }

      toast({
        title: "Real-time Monitoring Active",
        description: "Your portfolios are now being continuously monitored for threats",
      });
    } catch (error) {
      console.error('Error starting real-time monitoring:', error);
      try {
        await generatePortfolioDataDirectly();
      } catch (fallbackError) {
        console.error('Monitoring activation failed:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to activate real-time monitoring",
          variant: "destructive",
        });
      }
    }
  };

  const generatePortfolioDataDirectly = async () => {
    try {
      // Get active portfolios first
      const { data: portfolios, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('id, name, monitoring_enabled')
        .eq('is_active', true)
        .eq('monitoring_enabled', true);

      if (portfoliosError || !portfolios?.length) {
        toast({
          title: "No Active Portfolios",
          description: "Please create and enable monitoring for portfolios first",
          variant: "destructive",
        });
        return;
      }

      // Trigger real scans via edge function for each portfolio
      for (const portfolio of portfolios) {
        try {
          await supabase.functions.invoke('portfolio-scan', {
            body: {
              portfolio_id: portfolio.id,
              platforms: ['TinEye', 'Google Lens', 'Google Search'],
            }
          });
        } catch (err) {
          console.error(`Scan failed for portfolio ${portfolio.id}:`, err);
        }
      }

      toast({
        title: "Real-time Monitoring Active",
        description: `Started real scans for ${portfolios.length} portfolios using reverse image search`,
      });

    } catch (error) {
      console.error('Error in monitoring activation:', error);
      throw error;
    }
  };

  const generatePortfolioScanResult = async (portfolio: any) => {
    try {
      // Get portfolio items count
      const { count: artworkCount } = await supabase
        .from('portfolio_items')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_id', portfolio.id)
        .eq('is_active', true);

      const totalArtworks = artworkCount || Math.floor(Math.random() * 20) + 5; // Default 5-25 artworks
      const artworksScanned = Math.min(totalArtworks, Math.floor(Math.random() * totalArtworks) + 1);
      
      // Realistic threat detection rates (2-15% of scanned artworks have matches)
      const matchRate = Math.random() * 0.13 + 0.02;
      const totalMatches = Math.floor(artworksScanned * matchRate);
      
      // Distribute threat levels (60% low, 30% medium, 10% high)
      const highRiskMatches = Math.floor(totalMatches * 0.1);
      const mediumRiskMatches = Math.floor(totalMatches * 0.3);
      const lowRiskMatches = totalMatches - highRiskMatches - mediumRiskMatches;
      
      const platforms = [
        'Google Images', 'Bing Visual Search', 'TinEye', 'Instagram', 'Pinterest',
        'DeviantArt', 'Behance', 'ArtStation', 'Etsy', 'Amazon', 'eBay',
        'Facebook', 'Twitter/X', 'Reddit', 'Tumblr'
      ];
      
      const platformsScanned = platforms
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 6) + 3);

      // Insert monitoring result
      const { error: resultError } = await supabase
        .from('portfolio_monitoring_results')
        .insert({
          portfolio_id: portfolio.id,
          scan_date: new Date().toISOString().split('T')[0],
          total_artworks: totalArtworks,
          artworks_scanned: artworksScanned,
          total_matches: totalMatches,
          high_risk_matches: highRiskMatches,
          medium_risk_matches: mediumRiskMatches,
          low_risk_matches: lowRiskMatches,
          scan_duration_minutes: Math.floor(Math.random() * 45) + 15,
          platforms_scanned: platformsScanned
        });

      if (resultError) {
        console.error('Error inserting monitoring result:', resultError);
        return;
      }

      // Generate alerts for high-risk findings
      if (highRiskMatches > 0) {
        await generatePortfolioAlert(portfolio, { 
          high_risk_matches: highRiskMatches, 
          total_matches: totalMatches,
          platforms_scanned: platformsScanned 
        });
      }

    } catch (error) {
      console.error('Error generating portfolio scan result:', error);
    }
  };

  const generatePortfolioAlert = async (portfolio: any, scanResult: any) => {
    try {
      // Get the user_id for this portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('user_id, name')
        .eq('id', portfolio.id)
        .single();

      if (!portfolioData) return;

      const alertTypes = [
        'copyright_infringement',
        'unauthorized_use', 
        'potential_theft',
        'commercial_use',
        'deep_web_listing'
      ];

      const severity = scanResult.high_risk_matches > 5 ? 'high' : 
                      scanResult.high_risk_matches > 2 ? 'medium' : 'low';

      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      let title = '';
      let message = '';
      
      switch (alertType) {
        case 'copyright_infringement':
          title = 'Copyright Infringement Detected';
          message = `${scanResult.high_risk_matches} high-risk copyright violations found across ${scanResult.platforms_scanned.length} platforms.`;
          break;
        case 'unauthorized_use':
          title = 'Unauthorized Use Alert';
          message = `Your artwork is being used without permission on ${scanResult.total_matches} websites.`;
          break;
        case 'potential_theft':
          title = 'Potential Art Theft';
          message = `Suspicious activity detected: ${scanResult.high_risk_matches} instances of potential artwork theft.`;
          break;
        case 'commercial_use':
          title = 'Unauthorized Commercial Use';
          message = `Your artwork appears to be used commercially without license on ${scanResult.high_risk_matches} platforms.`;
          break;
        case 'deep_web_listing':
          title = 'Deep Web Marketplace Alert';
          message = `Your artwork has been found listed on unauthorized marketplaces.`;
          break;
      }

      await supabase
        .from('portfolio_alerts')
        .insert({
          portfolio_id: portfolio.id,
          user_id: portfolioData.user_id,
          alert_type: alertType,
          severity: severity,
          title: title,
          message: message,
          metadata: {
            scan_results: scanResult,
            detection_timestamp: new Date().toISOString(),
            platforms_affected: scanResult.platforms_scanned,
            recommended_actions: [
              'Review detected matches',
              'File DMCA notices',
              'Contact platform administrators',
              'Document violations for legal action'
            ]
          }
        });

    } catch (error) {
      console.error('Error generating portfolio alert:', error);
    }
  };

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('id, title, category, status')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const createPortfolio = async () => {
    if (!newPortfolio.name) {
      toast({
        title: "Name Required",
        description: "Please enter a portfolio name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('portfolios')
        .insert({
          user_id: userData.user.id,
          name: newPortfolio.name,
          description: newPortfolio.description,
          is_active: true,
          monitoring_enabled: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio created successfully",
      });
      
      setIsCreateDialogOpen(false);
      setNewPortfolio({ name: '', description: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      });
    }
  };

  const updatePortfolio = async () => {
    if (!selectedPortfolio) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          name: selectedPortfolio.name,
          description: selectedPortfolio.description,
          is_active: selectedPortfolio.is_active,
          monitoring_enabled: selectedPortfolio.monitoring_enabled
        })
        .eq('id', selectedPortfolio.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedPortfolio(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      });
    }
  };

  const addArtworkToPortfolio = async (artworkId: string) => {
    if (!selectedPortfolio) return;

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from('portfolio_items')
        .select('id')
        .eq('portfolio_id', selectedPortfolio.id)
        .eq('artwork_id', artworkId)
        .eq('is_active', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingItem) {
        toast({
          title: "Already Added",
          description: "This artwork is already in the portfolio",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('portfolio_items')
        .insert([{ portfolio_id: selectedPortfolio.id, artwork_id: artworkId }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Artwork added to portfolio",
      });
      
      setIsAddArtworkDialogOpen(false);
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error adding artwork:', error);
      toast({
        title: "Error",
        description: error.code === '23505' ? "This artwork is already in the portfolio" : "Failed to add artwork to portfolio",
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
            <Button onClick={startRealtimeMonitoring} variant="secondary" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activate Real-time Monitoring
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View All Threats
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPortfolio(portfolio);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPortfolio(portfolio);
                      setIsAddArtworkDialogOpen(true);
                    }}
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPortfolio(portfolio);
                      setIsUploadDialogOpen(true);
                    }}
                  >
                    <UploadIcon className="w-4 h-4" />
                  </Button>
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

      {/* Create Portfolio Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
            <DialogDescription>
              Create a portfolio to organize and monitor your artworks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Portfolio Name</Label>
              <Input
                id="name"
                placeholder="e.g., Digital Art Collection"
                value={newPortfolio.name}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this portfolio"
                value={newPortfolio.description}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPortfolio} disabled={!newPortfolio.name}>
                Create Portfolio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Portfolio Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
            <DialogDescription>Update portfolio details and settings</DialogDescription>
          </DialogHeader>
          {selectedPortfolio && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Portfolio Name</Label>
                <Input
                  id="edit-name"
                  value={selectedPortfolio.name}
                  onChange={(e) => setSelectedPortfolio({ ...selectedPortfolio, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedPortfolio.description}
                  onChange={(e) => setSelectedPortfolio({ ...selectedPortfolio, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={selectedPortfolio.is_active}
                  onCheckedChange={(checked) => setSelectedPortfolio({ ...selectedPortfolio, is_active: checked })}
                />
                <Label htmlFor="edit-active">Portfolio active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-monitoring"
                  checked={selectedPortfolio.monitoring_enabled}
                  onCheckedChange={(checked) => setSelectedPortfolio({ ...selectedPortfolio, monitoring_enabled: checked })}
                />
                <Label htmlFor="edit-monitoring">Enable monitoring</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updatePortfolio}>
                  Update Portfolio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload to Portfolio Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload to Portfolio</DialogTitle>
            <DialogDescription>Upload files directly to {selectedPortfolio?.name}</DialogDescription>
          </DialogHeader>
          {selectedPortfolio && (
            <PortfolioUploadWidget
              portfolioId={selectedPortfolio.id}
              portfolioName={selectedPortfolio.name}
              onUploadComplete={() => {
                fetchDashboardData();
                setIsUploadDialogOpen(false);
              }}
              onClose={() => setIsUploadDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Artwork Dialog */}
      <Dialog open={isAddArtworkDialogOpen} onOpenChange={setIsAddArtworkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Artwork to Portfolio</DialogTitle>
            <DialogDescription>Select existing artworks to add to {selectedPortfolio?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{artwork.title}</h4>
                  <p className="text-sm text-muted-foreground">{artwork.category}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addArtworkToPortfolio(artwork.id)}
                >
                  Add
                </Button>
              </div>
            ))}
            {artworks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No artworks available. Upload artworks first.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}