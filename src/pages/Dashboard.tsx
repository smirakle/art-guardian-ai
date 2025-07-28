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
  HelpCircle,
  Scale,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealTimeMonitoringWidget } from '@/components/dashboard/RealTimeMonitoringWidget';
import { RealTimeBlockchainWidget } from '@/components/dashboard/RealTimeBlockchainWidget';
import { RecentDetectionsWidget } from '@/components/dashboard/RecentDetectionsWidget';
import NFTMintingWidget from '@/components/nft/NFTMintingWidget';
import { NFTMintingAnalytics } from '@/components/nft/NFTMintingAnalytics';
import { LiveNFTStatusFeed } from '@/components/nft/LiveNFTStatusFeed';
import { NFTGasPriceTracker } from '@/components/nft/NFTGasPriceTracker';
import { MonitoringWidget } from '@/components/dashboard/MonitoringWidget';
import { UploadWidget } from '@/components/dashboard/UploadWidget';
import DailyReport from '@/components/DailyReport';
import { ScanHistoryResults } from '@/components/ScanHistoryResults';
import ScheduledScansManager from '@/components/ScheduledScansManager';
import { WhiteLabelManager } from '@/components/WhiteLabelManager';
import AdvancedBlockchain from '@/components/AdvancedBlockchain';
import FeatureGuard from '@/components/FeatureGuard';
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
      title: 'Real-Time AI Monitoring', 
      description: 'AI-powered image analysis and detection',
      icon: Brain,
      action: () => {
        const realtimeTab = document.querySelector('[value="realtime"]') as HTMLElement;
        if (realtimeTab) realtimeTab.click();
      },
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    { 
      title: 'Social Media Protection', 
      description: 'Monitor content across social platforms',
      icon: Shield,
      action: () => {
        const socialTab = document.querySelector('[value="social"]') as HTMLElement;
        if (socialTab) socialTab.click();
      },
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    { 
      title: 'Deepfake Detection', 
      description: 'Advanced AI deepfake scanning',
      icon: Eye,
      action: () => {
        const deepfakeTab = document.querySelector('[value="deepfake"]') as HTMLElement;
        if (deepfakeTab) deepfakeTab.click();
      },
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    { 
      title: 'Blockchain Verification', 
      description: 'Immutable proof of ownership',
      icon: Crown,
      action: () => {
        const blockchainTab = document.querySelector('[value="blockchain"]') as HTMLElement;
        if (blockchainTab) blockchainTab.click();
      },
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
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

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
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

        {/* Stats Overview - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Protected Artworks</CardTitle>
              <Shield className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.protectedArtworks}</div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                With AI monitoring active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">AI Scans</CardTitle>
              <Brain className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {stats.activeScans} currently active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Detections</CardTitle>
              <AlertTriangle className={`h-5 w-5 ${
                stats.recentThreatLevel === 'high' ? 'text-red-500' :
                stats.recentThreatLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.detectionsThisMonth}</div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                This month • {stats.recentThreatLevel} risk
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Protection Score</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.protectionScore}%</div>
              <Progress value={stats.protectionScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
              {/* Real-Time AI */}
              <button 
                onClick={() => {
                  const section = document.getElementById('realtime-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">AI</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Real-Time AI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Image analysis & detection</p>
              </button>

              {/* Social Media */}
              <button 
                onClick={() => {
                  const section = document.getElementById('social-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Social Media</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Platform monitoring</p>
              </button>

              {/* Deepfake Detection */}
              <button 
                onClick={() => {
                  const section = document.getElementById('deepfake-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Deepfake Detection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Advanced AI scanning</p>
              </button>

              {/* Web Scanner */}
              <button 
                onClick={() => {
                  const section = document.getElementById('webscanner-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                    <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Scan</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Web Scanner</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive web search</p>
              </button>

              {/* Scheduling */}
              <button 
                onClick={() => {
                  const section = document.getElementById('scheduling-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Auto</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Scheduling</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">24/7 monitoring & scans</p>
              </button>

              {/* Scan History */}
              <button 
                onClick={() => {
                  const section = document.getElementById('scan-history-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">History</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Scan History</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Detailed scan results</p>
              </button>

              {/* White Label */}
              <button 
                onClick={() => {
                  const section = document.getElementById('whitelabel-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                    <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">White Label</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Custom branding</p>
              </button>

              {/* Blockchain */}
              <button 
                onClick={() => {
                  const section = document.getElementById('blockchain-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors">
                    <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Proof</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Blockchain</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Immutable verification</p>
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="space-y-12">

          {/* White Label Section */}
          <div id="whitelabel-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">White Label Management</h2>
                <p className="text-muted-foreground">Create and manage your branded platform with custom domains and styling</p>
              </div>
            </div>
            <FeatureGuard 
              feature="white_label" 
              fallbackTitle="White Label Access Required"
              fallbackDescription="Upgrade to Professional or Enterprise plan to access white label management features."
            >
              <WhiteLabelManager />
            </FeatureGuard>
          </div>

          {/* Daily Reports Section */}
          <div id="reports-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Daily Reports</h2>
                <p className="text-muted-foreground">Comprehensive downloadable reports with all monitoring data</p>
              </div>
            </div>
            <DailyReport type="comprehensive" />
          </div>

          {/* Scan History Results Section */}
          <div id="scan-history-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Scan History Results</h2>
                <p className="text-muted-foreground">Detailed history of all your scans and detections</p>
              </div>
            </div>
            <ScanHistoryResults />
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl p-8 border border-primary/20 mb-12">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-foreground mb-4">AI-Powered Content Protection</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Monitor, protect, and verify your digital assets with cutting-edge AI technology across multiple platforms and blockchain networks.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate('/upload')} size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Content
                </Button>
                <Button variant="outline" size="lg" onClick={() => {
                  const section = document.getElementById('blockchain-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <Crown className="w-5 h-5 mr-2" />
                  Learn About Blockchain
                </Button>
              </div>
            </div>
          </div>

          {/* Real-Time AI Section */}
          <div id="realtime-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Real-Time AI Monitoring</h2>
                <p className="text-muted-foreground">AI-powered image analysis and content detection</p>
              </div>
            </div>
            <RealTimeImageAnalysis />
          </div>

          {/* Social Media Section */}
          <div id="social-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Social Media Scanner</h2>
                <p className="text-muted-foreground">Monitor content across social platforms</p>
              </div>
            </div>
            <SocialMediaAccountManager />
            <div className="mt-6">
              <SocialMediaMonitoringResults />
            </div>
          </div>

          {/* Deepfake Detection Section */}
          <div id="deepfake-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Deepfake Detection</h2>
                <p className="text-muted-foreground">Advanced AI deepfake scanning and analysis</p>
              </div>
            </div>
            <RecentDetectionsWidget />
          </div>

          {/* Scheduling & Automation Section */}
          <div id="scheduling-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Scheduling & Automation</h2>
                <p className="text-muted-foreground">Set up 24/7 monitoring and schedule automated scans</p>
              </div>
            </div>
            <ScheduledScansManager />
          </div>

          {/* Web Scanner Section */}
          <div id="webscanner-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Web Scanner</h2>
                <p className="text-muted-foreground">Comprehensive web scanning for unauthorized usage</p>
              </div>
            </div>
            <ComprehensiveWebScanner />
          </div>

          {/* Blockchain Section */}
          <div id="blockchain-section" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Blockchain Verification</h2>
                <p className="text-muted-foreground">Immutable proof of ownership and authenticity</p>
              </div>
            </div>
            
            {/* Educational Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                    <Crown className="w-5 h-5" />
                    What is Blockchain?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-yellow-800 dark:text-yellow-200">
                  <p>Blockchain is a distributed ledger technology that creates an immutable, transparent record of digital transactions and ownership.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Immutable proof of creation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Tamper-proof ownership records</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Global verification network</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <Scale className="w-5 h-5" />
                    Blockchain vs Copyright
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-blue-800 dark:text-blue-200">
                  <p><strong>Copyright:</strong> Legal protection that requires registration and can be disputed in courts.</p>
                  <p><strong>Blockchain:</strong> Technical proof of creation timestamp and ownership that cannot be altered or disputed.</p>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <p className="text-sm font-medium">Both work together: Blockchain provides technical proof, while copyright provides legal protection.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <RealTimeBlockchainWidget />
              <NFTMintingWidget />
            </div>

            {/* NFT Real-Time Analytics */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Real-Time NFT Analytics</h3>
              <NFTMintingAnalytics />
            </div>

            {/* Live Activity Feed and Gas Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <LiveNFTStatusFeed />
              <div>
                <h3 className="text-lg font-semibold mb-4">Gas Price Monitor</h3>
                <NFTGasPriceTracker />
              </div>
            </div>
            
            {/* Advanced Blockchain Section */}
            <div className="mt-8">
              <AdvancedBlockchain />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;