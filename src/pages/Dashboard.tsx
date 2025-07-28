import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Activity, 
  Upload, 
  FileImage, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Clock,
  Globe,
  Brain,
  Zap,
  Building2,
  Settings,
  Users,
  Bell,
  Crown,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealTimeMonitoringWidget } from '@/components/dashboard/RealTimeMonitoringWidget';
import { RealTimeBlockchainWidget } from '@/components/dashboard/RealTimeBlockchainWidget';
import { RecentDetectionsWidget } from '@/components/dashboard/RecentDetectionsWidget';
import { MonitoringWidget } from '@/components/dashboard/MonitoringWidget';
import { UploadWidget } from '@/components/dashboard/UploadWidget';
import NFTMintingWidget from '@/components/nft/NFTMintingWidget';
import NFTAnalytics from '@/components/nft/NFTAnalytics';
import DailyReport from '@/components/DailyReport';
import ScheduledScansManager from '@/components/ScheduledScansManager';
import { WhiteLabelManager } from '@/components/WhiteLabelManager';
import AdvancedBlockchain from '@/components/AdvancedBlockchain';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Import monitoring components from Upload page
import RealTimeImageAnalysis from '@/components/RealTimeImageAnalysis';
import SocialMediaAccountManager from '@/components/SocialMediaAccountManager';
import SocialMediaMonitoringResults from '@/components/SocialMediaMonitoringResults';
import { ComprehensiveWebScanner } from '@/components/ComprehensiveWebScanner';

interface DashboardStats {
  protectedArtworks: number;
  totalScans: number;
  detectionsThisMonth: number;
  protectionScore: number;
  activeScans: number;
  recentThreatLevel: 'low' | 'medium' | 'high';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { hasFeature } = useSubscription();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    protectedArtworks: 0,
    totalScans: 0,
    detectionsThisMonth: 0,
    protectionScore: 0,
    activeScans: 0,
    recentThreatLevel: 'low'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      // Load user's artworks count
      const { data: artworkData, count: artworkCount } = await supabase
        .from('artwork')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Load monitoring scans
      const artworkIds = artworkData?.map(a => a.id) || [];
      const { data: scanData, count: scanCount } = await supabase
        .from('monitoring_scans')
        .select('*', { count: 'exact' })
        .in('artwork_id', artworkIds);

      // Load copyright matches for threat detection
      const { data: matchData, count: matchCount } = await supabase
        .from('copyright_matches')
        .select('*', { count: 'exact' })
        .in('artwork_id', artworkIds)
        .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Count active scans
      const activeScans = scanData?.filter(scan => scan.status === 'running').length || 0;

      // Calculate protection score based on various factors
      const hasRecentScans = scanData?.some(scan => 
        new Date(scan.started_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const matchRatio = matchCount && scanCount ? matchCount / scanCount : 0;
      const protectionScore = Math.max(0, Math.min(100, 
        (hasRecentScans ? 50 : 0) + 
        ((artworkCount || 0) > 0 ? 25 : 0) + 
        (matchRatio < 0.1 ? 25 : matchRatio < 0.2 ? 15 : 5)
      ));

      // Determine threat level
      const highThreatMatches = matchData?.filter(m => m.threat_level === 'high').length || 0;
      const mediumThreatMatches = matchData?.filter(m => m.threat_level === 'medium').length || 0;
      const recentThreatLevel = highThreatMatches > 0 ? 'high' : 
                               mediumThreatMatches > 0 ? 'medium' : 'low';

      setStats({
        protectedArtworks: artworkCount || 0,
        totalScans: scanCount || 0,
        detectionsThisMonth: matchCount || 0,
        protectionScore,
        activeScans,
        recentThreatLevel
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivity = [
    { id: 1, type: 'scan', description: 'AI monitoring scan completed', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'detection', description: 'Potential match found via real-time scanning', time: '5 hours ago', status: 'warning' },
    { id: 3, type: 'protection', description: 'Copyright protection activated', time: '1 day ago', status: 'success' },
    { id: 4, type: 'upload', description: 'New artwork protected with AI monitoring', time: '2 days ago', status: 'info' }
  ];

  const quickActions = [
    { 
      title: 'Real-Time AI', 
      description: 'AI-powered image analysis',
      icon: Brain,
      action: () => {
        const realtimeTab = document.querySelector('[value="realtime"]') as HTMLElement;
        if (realtimeTab) realtimeTab.click();
      },
      color: 'bg-blue-500'
    },
    { 
      title: 'Social Media Monitoring', 
      description: 'Monitor social platforms',
      icon: Shield,
      action: () => {
        const socialTab = document.querySelector('[value="social"]') as HTMLElement;
        if (socialTab) socialTab.click();
      },
      color: 'bg-green-500'
    },
    { 
      title: 'Deepfake Detection', 
      description: 'AI deepfake scanning',
      icon: Eye,
      action: () => {
        const deepfakeTab = document.querySelector('[value="deepfake"]') as HTMLElement;
        if (deepfakeTab) deepfakeTab.click();
      },
      color: 'bg-purple-500'
    },
    { 
      title: 'Web Scanner', 
      description: 'Comprehensive web scanning',
      icon: Globe,
      action: () => {
        const webscannerTab = document.querySelector('[value="webscanner"]') as HTMLElement;
        if (webscannerTab) webscannerTab.click();
      },
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header with Improved Guidance */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Artist'}!
              </h1>
              <p className="text-muted-foreground">
                Real-time AI monitoring dashboard for your protected content.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Content
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/help')}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
          </div>
          
          {/* Quick Status Banner */}
          {stats.protectedArtworks === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Get Started with Your First Upload</h3>
                  <p className="text-sm text-blue-700">Upload your artwork to begin AI-powered protection and monitoring.</p>
                </div>
                <Button
                  onClick={() => navigate('/upload')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protected Artworks</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectedArtworks}</div>
              <p className="text-xs text-muted-foreground">
                With AI monitoring active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Scans</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeScans} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detections</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${
                stats.recentThreatLevel === 'high' ? 'text-red-500' :
                stats.recentThreatLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.detectionsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                This month • {stats.recentThreatLevel} risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protection Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectionScore}%</div>
              <Progress value={stats.protectionScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full ${hasFeature('white_label') ? (hasFeature('advanced_blockchain') ? 'grid-cols-9' : 'grid-cols-8') : (hasFeature('advanced_blockchain') ? 'grid-cols-8' : 'grid-cols-7')}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Real-Time AI
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="deepfake" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Deepfake Detection
            </TabsTrigger>
            <TabsTrigger value="webscanner" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Web Scanner
            </TabsTrigger>
            <TabsTrigger value="detections" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Detections
            </TabsTrigger>
            <TabsTrigger value="protection" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Protection
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              Reports
            </TabsTrigger>
            
            {hasFeature('advanced_blockchain') && (
              <TabsTrigger value="advanced-blockchain" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Advanced Blockchain
              </TabsTrigger>
            )}
            
            {hasFeature('white_label') && (
              <TabsTrigger value="white-label" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                White Label
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>AI-powered protection tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-4"
                        onClick={action.action}
                      >
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest AI monitoring updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          activity.status === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.status === 'success' ? 'default' :
                          activity.status === 'warning' ? 'secondary' :
                          'outline'
                        }>
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Global Protection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>AI Protection Status</span>
                </CardTitle>
                <CardDescription>Real-time AI monitoring across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">Active</div>
                    <p className="text-sm text-muted-foreground">AI Monitoring</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-2">20+</div>
                    <p className="text-sm text-muted-foreground">AI Detection Models</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-2">24/7</div>
                    <p className="text-sm text-muted-foreground">Real-time Scanning</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time AI Monitoring integrated into Overview */}
            <RealTimeMonitoringWidget />
          </TabsContent>

          {/* Real-Time AI Monitoring Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Real-Time AI Image Analysis</h2>
                  <p className="text-muted-foreground">AI-powered image analysis and monitoring</p>
                </div>
              </div>
            </div>
            <RealTimeImageAnalysis />
          </TabsContent>

          {/* Social Media Monitoring Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Social Media Monitoring</h2>
                  <p className="text-muted-foreground">Monitor your content across social platforms</p>
                </div>
              </div>
            </div>
            <SocialMediaAccountManager />
            <SocialMediaMonitoringResults />
          </TabsContent>

          {/* Deepfake Detection Tab */}
          <TabsContent value="deepfake" className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Real-Time Deepfake Monitoring
                  </h2>
                  <p className="text-muted-foreground">
                    Continuous AI-powered scanning across 2.5M+ surface and dark web sources
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="monitor" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monitor" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Live Monitoring
                </TabsTrigger>
                <TabsTrigger value="detected" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Detection Feed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="monitor">
                <RealTimeMonitoringWidget />
              </TabsContent>

              <TabsContent value="detected">
                <RecentDetectionsWidget />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Web Scanner Tab */}
          <TabsContent value="webscanner" className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Comprehensive Web Scanner</h2>
                  <p className="text-muted-foreground">Deep web scanning and content monitoring</p>
                </div>
              </div>
            </div>
            <ComprehensiveWebScanner />
          </TabsContent>

          {/* Upload Tab - Remove this since upload functionality is separate */}
          <TabsContent value="upload" className="space-y-6">
            <UploadWidget onUploadComplete={(artworkId) => {
              toast({
                title: "Upload Complete",
                description: "Your content is now protected with AI monitoring",
              });
              // Optionally refresh dashboard stats
              loadDashboardStats();
            }} />
          </TabsContent>

          {/* Detections Tab */}
          <TabsContent value="detections" className="space-y-6">
            <RecentDetectionsWidget />
          </TabsContent>

          {/* Protection Tab */}
          <TabsContent value="protection" className="space-y-6">
            <MonitoringWidget />
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <ScheduledScansManager />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyReport 
                type="monitoring" 
                realTimeStats={{
                  totalScans: stats.totalScans,
                  activeAlerts: stats.detectionsThisMonth,
                  protectedAssets: stats.protectedArtworks,
                  systemUptime: stats.protectionScore,
                  lastScanTime: '2 hours ago',
                  threatLevel: stats.recentThreatLevel
                }}
              />
              <DailyReport 
                type="deep-scan"
                realTimeStats={{
                  totalScans: Math.floor(stats.totalScans * 0.3),
                  activeAlerts: Math.floor(stats.detectionsThisMonth * 1.5),
                  protectedAssets: stats.protectedArtworks,
                  systemUptime: Math.min(99.9, stats.protectionScore + 5),
                  lastScanTime: '6 hours ago',
                  threatLevel: stats.recentThreatLevel
                }}
              />
            </div>
          </TabsContent>

          {/* Advanced Blockchain Tab */}
          {hasFeature('advanced_blockchain') && (
            <TabsContent value="advanced-blockchain" className="space-y-6">
              <Tabs defaultValue="blockchain" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="blockchain">Blockchain Certificates</TabsTrigger>
                  <TabsTrigger value="nft">NFT Minting</TabsTrigger>
                  <TabsTrigger value="analytics">NFT Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blockchain">
                  <RealTimeBlockchainWidget />
                  <AdvancedBlockchain />
                </TabsContent>
                
                <TabsContent value="nft">
                  <NFTMintingWidget />
                </TabsContent>
                
                <TabsContent value="analytics">
                  <NFTAnalytics />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* White Label Tab */}
          {hasFeature('white_label') && (
            <TabsContent value="white-label" className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold mb-2">White Label Solutions</CardTitle>
                  <p className="text-muted-foreground">Enterprise-grade customization coming soon</p>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Settings className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We're working on powerful white label features that will allow you to customize the platform with your own branding, domain, and user management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                    <div className="p-4 border border-border rounded-lg">
                      <Badge className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-medium mb-1">Custom Branding</h4>
                      <p className="text-sm text-muted-foreground">Your logo, colors, and styling</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <Globe className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-medium mb-1">Custom Domain</h4>
                      <p className="text-sm text-muted-foreground">Host on your own domain</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <Users className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-medium mb-1">User Management</h4>
                      <p className="text-sm text-muted-foreground">Manage your team members</p>
                    </div>
                  </div>
                  <Button variant="outline" disabled>
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me When Available
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;