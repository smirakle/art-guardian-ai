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
  AlertTriangle, 
  TrendingUp,
  Globe,
  Brain,
  Crown,
  Settings,
  Users,
  Clock,
  Eye,
  Search,
  Zap,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealTimeBlockchainWidget } from '@/components/dashboard/RealTimeBlockchainWidget';
import NFTMintingWidget from '@/components/nft/NFTMintingWidget';
import { UnifiedScanResults } from '@/components/dashboard/UnifiedScanResults';
import ScheduledScansManager from '@/components/ScheduledScansManager';
import { WhiteLabelManager } from '@/components/WhiteLabelManager';
import FeatureGuard from '@/components/FeatureGuard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import RealTimeImageAnalysis from '@/components/RealTimeImageAnalysis';
import MobileAppCTA from '@/components/MobileAppCTA';
import SocialMediaAccountManager from '@/components/SocialMediaAccountManager';
import { ComprehensiveWebScanner } from '@/components/ComprehensiveWebScanner';
import { AIProtectionStatusWidget } from '@/components/dashboard/AIProtectionStatusWidget';
import SocialMediaMonitoringResults from '@/components/monitoring/SocialMediaMonitoringResults';
import RealTimeDeepfakeMonitor from '@/components/RealTimeDeepfakeMonitor';
import { ProductionOptimizations } from '@/components/ProductionOptimizations';
import { EmailNotificationSettings } from '@/components/EmailNotificationSettings';
import { StorageWidget } from '@/components/storage/StorageWidget';
import { AIAgentNetwork } from '@/components/ai/AIAgentNetwork';

interface DashboardStats {
  protectedArtworks: number;
  totalScans: number;
  detectionsThisMonth: number;
  protectionScore: number;
  activeScans: number;
  recentThreatLevel: 'low' | 'medium' | 'high';
}

export const ProductionDashboard = () => {
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
    } else {
      setLoading(false);
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

      // Calculate protection score
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
      toast({
        title: "Failed to load dashboard data",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Dashboard Access</CardTitle>
              <CardDescription>
                You need to be logged in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sign in to view your protected content, monitoring statistics, and AI-powered protection tools.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full"
                  size="lg"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Artist'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your AI-powered content protection
              </p>
            </div>
            <Button
              onClick={() => navigate('/upload')}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
          
          {/* Get Started Banner for new users */}
          {stats.protectedArtworks === 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Start Protecting Your Content</h3>
                  <p className="text-sm text-muted-foreground">Upload your first artwork to begin AI-powered monitoring and protection.</p>
                </div>
                <Button
                  onClick={() => navigate('/upload')}
                  variant="outline"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Protected Content</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectedArtworks}</div>
              <p className="text-xs text-muted-foreground mt-1">Active monitoring</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Scans</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeScans} running</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Threats Found</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${
                stats.recentThreatLevel === 'high' ? 'text-destructive' :
                stats.recentThreatLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.detectionsThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Protection Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectionScore}%</div>
              <Progress value={stats.protectionScore} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <StorageWidget />
        </div>

        {/* AI Protection Status */}
        <div className="mb-8">
          <AIProtectionStatusWidget />
        </div>

        {/* Main Dashboard Content - Organized in Tabs */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="scanning" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Scanning</span>
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Blockchain</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Agents</span>
              </TabsTrigger>
              <TabsTrigger value="production" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Production</span>
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Management</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Real-Time AI Analysis
                  </CardTitle>
                  <CardDescription>
                    Upload content for instant AI-powered analysis and monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeImageAnalysis />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Social Media Protection
                  </CardTitle>
                  <CardDescription>
                    Monitor and protect your content across social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SocialMediaAccountManager />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Social Media Monitoring
                  </CardTitle>
                  <CardDescription>
                    Live monitoring results from social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SocialMediaMonitoringResults />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Deepfake Detection
                  </CardTitle>
                  <CardDescription>
                    Real-time deepfake detection and monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeDeepfakeMonitor />
                </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MobileAppCTA variant="dashboard" />
              </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity & Results</CardTitle>
                <CardDescription>
                  View your latest scan results and detected threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedScanResults />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <AIAgentNetwork />
          </TabsContent>

          {/* Scanning Tab */}
          <TabsContent value="scanning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Web Scanner
                  </CardTitle>
                  <CardDescription>
                    Comprehensive web scanning for content protection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComprehensiveWebScanner />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Scheduled Monitoring
                  </CardTitle>
                  <CardDescription>
                    Set up automated scans and monitoring schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScheduledScansManager />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <FeatureGuard feature="blockchain">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Blockchain Protection
                    </CardTitle>
                    <CardDescription>
                      Immutable proof of ownership and creation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RealTimeBlockchainWidget />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>NFT Management</CardTitle>
                    <CardDescription>
                      Mint and manage your NFTs with blockchain verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NFTMintingWidget />
                  </CardContent>
                </Card>
              </div>
            </FeatureGuard>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <EmailNotificationSettings />
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-6">
            <ProductionOptimizations />
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  White Label Management
                </CardTitle>
                <CardDescription>
                  Customize and manage your brand settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhiteLabelManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};