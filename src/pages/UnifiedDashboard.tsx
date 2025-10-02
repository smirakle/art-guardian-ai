import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ContextualHelp from '@/components/help-system/ContextualHelp';

import SmartTooltips from '@/components/user-experience/SmartTooltips';
import { 
  Shield, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Users,
  Link2,
  Scale,
  Brain,
  Zap,
  Eye,
  Upload,
  Settings,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardEmptyState } from '@/components/customer-success/DashboardEmptyState';

// Import consolidated components
import { ProductionDashboard } from '@/components/dashboard/ProductionDashboard';
import { AIDetectionDashboard } from '@/components/phase1/AIDetectionDashboard';
import { OneClickProtection } from '@/components/phase1/OneClickProtection';
import { BlockchainOwnershipRegistry } from '@/components/blockchain/BlockchainOwnershipRegistry';
import { GlobalLegalNetwork } from '@/components/legal/GlobalLegalNetwork';
import { RealTimeLegalDashboard } from '@/components/legal/RealTimeLegalDashboard';
import { CreatorEconomy } from '@/components/phase2/CreatorEconomy';
import { MultiModalAIProtection } from '@/components/multi-modal/MultiModalAIProtection';

interface DashboardStats {
  protectedAssets: number;
  activeScans: number;
  threats: number;
  blockchainRecords: number;
  legalActions: number;
  successRate: number;
  recentActivity: Array<{
    icon: string;
    message: string;
    timestamp: Date;
  }>;
}

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    protectedAssets: 0,
    activeScans: 0,
    threats: 0,
    blockchainRecords: 0,
    legalActions: 0,
    successRate: 0,
    recentActivity: []
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('UnifiedDashboard: useEffect triggered', { 
      user: user?.id, 
      authLoading, 
      dataLoading, 
      hasLoadedOnce 
    });
    
    if (user && !authLoading && !hasLoadedOnce) {
      loadRealDashboardData();
    }
  }, [user, authLoading, hasLoadedOnce]);

  const loadRealDashboardData = async () => {
    try {
      console.log('UnifiedDashboard: Starting to load dashboard data for user:', user!.id);
      setDataLoading(true);

      // Get user's artworks
      console.log('UnifiedDashboard: Fetching artwork data...');
      const { data: artworkData, count: artworkCount, error: artworkError } = await supabase
        .from('artwork')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      if (artworkError) {
        console.error('UnifiedDashboard: Error fetching artwork:', artworkError);
        throw artworkError;
      }
      console.log('UnifiedDashboard: Artwork data fetched:', { count: artworkCount });

      // Get AI protection records
      console.log('UnifiedDashboard: Fetching AI protection records...');
      const { data: protectionData, count: protectionCount, error: protectionError } = await supabase
        .from('ai_protection_records')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('is_active', true);

      if (protectionError) {
        console.error('UnifiedDashboard: Error fetching protection records:', protectionError);
      }
      console.log('UnifiedDashboard: Protection data fetched:', { count: protectionCount });

      // Get copyright matches (threats)
      const artworkIds = artworkData?.map(a => a.id) || [];
      console.log('UnifiedDashboard: Fetching copyright matches for artworks:', artworkIds.length);
      const { data: matchData, count: matchCount, error: matchError } = await supabase
        .from('copyright_matches')
        .select('*', { count: 'exact' })
        .in('artwork_id', artworkIds);

      if (matchError) {
        console.error('UnifiedDashboard: Error fetching copyright matches:', matchError);
      }
      console.log('UnifiedDashboard: Match data fetched:', { count: matchCount });

      // Get blockchain certificates
      console.log('UnifiedDashboard: Fetching blockchain certificates...');
      const { data: blockchainData, count: blockchainCount, error: blockchainError } = await supabase
        .from('blockchain_certificates')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      if (blockchainError) {
        console.error('UnifiedDashboard: Error fetching blockchain certificates:', blockchainError);
      }
      console.log('UnifiedDashboard: Blockchain data fetched:', { count: blockchainCount });

      // Get AI training violations
      console.log('UnifiedDashboard: Fetching AI training violations...');
      const { data: violationData, error: violationError } = await supabase
        .from('ai_training_violations')
        .select('*')
        .eq('user_id', user!.id)
        .order('detected_at', { ascending: false })
        .limit(5);

      if (violationError) {
        console.error('UnifiedDashboard: Error fetching violations:', violationError);
      }

      // Get DMCA notices (legal actions)
      console.log('UnifiedDashboard: Fetching DMCA notices...');
      const { data: dmcaData, count: dmcaCount, error: dmcaError } = await supabase
        .from('ai_protection_dmca_notices')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      if (dmcaError) {
        console.error('UnifiedDashboard: Error fetching DMCA notices:', dmcaError);
      }

      // Calculate active scans from AI monitoring agents
      console.log('UnifiedDashboard: Fetching monitoring agents...');
      const { data: agentData, error: agentError } = await supabase
        .from('ai_monitoring_agents')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (agentError) {
        console.error('UnifiedDashboard: Error fetching agents:', agentError);
      }

      // Calculate success rate from threat detections
      console.log('UnifiedDashboard: Fetching threat detections...');
      const { data: threatData, error: threatError } = await supabase
        .from('ai_threat_detections')
        .select('*')
        .eq('user_id', user!.id);

      if (threatError) {
        console.error('UnifiedDashboard: Error fetching threats:', threatError);
      }

      const totalThreats = threatData?.length || 0;
      const resolvedThreats = threatData?.filter(threat => threat.status === 'resolved').length || 0;
      const successRate = totalThreats > 0 ? Math.round((resolvedThreats / totalThreats) * 100) : 95;

      // Build recent activity
      const recentActivity = [];
      
      if (artworkData && artworkData.length > 0) {
        const recentArtwork = artworkData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        recentActivity.push({
          icon: 'shield',
          message: `Protected "${recentArtwork.title}"`,
          timestamp: new Date(recentArtwork.created_at)
        });
      }

      if (violationData && violationData.length > 0) {
        recentActivity.push({
          icon: 'alert',
          message: 'AI training violation detected',
          timestamp: new Date(violationData[0].detected_at)
        });
      }

      if (blockchainData && blockchainData.length > 0) {
        const recentBlockchain = blockchainData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        recentActivity.push({
          icon: 'link',
          message: 'Blockchain certificate created',
          timestamp: new Date(recentBlockchain.created_at)
        });
      }

      if (dmcaData && dmcaData.length > 0) {
        const recentDmca = dmcaData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        recentActivity.push({
          icon: 'scale',
          message: 'DMCA notice filed',
          timestamp: new Date(recentDmca.created_at)
        });
      }

      if (protectionData && protectionData.length > 0) {
        const recentProtection = protectionData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        recentActivity.push({
          icon: 'eye',
          message: 'AI protection applied',
          timestamp: new Date(recentProtection.created_at)
        });
      }

      const finalStats = {
        protectedAssets: (artworkCount || 0) + (protectionCount || 0),
        activeScans: agentData?.length || 0,
        threats: matchCount || 0,
        blockchainRecords: blockchainCount || 0,
        legalActions: dmcaCount || 0,
        successRate,
        recentActivity: recentActivity.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ).slice(0, 5)
      };

      console.log('UnifiedDashboard: Final stats calculated:', finalStats);
      setStats(finalStats);

    } catch (error) {
      console.error('UnifiedDashboard: Error loading dashboard data:', error);
      toast({
        title: "Failed to load dashboard data",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      });
      
      // Set default stats even on error so the dashboard shows something
      setStats({
        protectedAssets: 0,
        activeScans: 0,
        threats: 0,
        blockchainRecords: 0,
        legalActions: 0,
        successRate: 0,
        recentActivity: []
      });
    } finally {
      console.log('UnifiedDashboard: Loading complete, setting loading to false');
      setDataLoading(false);
      setHasLoadedOnce(true);
    }
  };

  const renderActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'shield': return <Shield className="h-4 w-4 text-green-500" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'link': return <Link2 className="h-4 w-4 text-blue-500" />;
      case 'scale': return <Scale className="h-4 w-4 text-purple-500" />;
      case 'eye': return <Eye className="h-4 w-4 text-indigo-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show error state if user is not authenticated
  if (!user && !authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the dashboard.</p>
          <Button onClick={() => window.location.href = '/auth'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Show loading while auth is loading or while data is loading for the first time
  if (authLoading || (dataLoading && !hasLoadedOnce)) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="animate-pulse space-y-8">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if user has no data
  const hasAnyData = stats.protectedAssets > 0 || stats.threats > 0 || stats.blockchainRecords > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* User Experience Enhancements */}
      <ContextualHelp />
      <SmartTooltips />
      
      {!hasAnyData ? (
        <DashboardEmptyState />
      ) : (
        <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Unified Protection Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Complete overview of your IP protection across all phases and technologies
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
            Phase 1: Core Protection
          </Badge>
          <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500">
            Phase 2: Market Differentiation
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            Phase 3: Technological Superiority
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold" data-tooltip="protection-status">
              {stats.protectedAssets.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Protected Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold" data-tooltip="monitoring">
              {stats.activeScans}
            </div>
            <p className="text-sm text-muted-foreground">Active Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats.threats}</div>
            <p className="text-sm text-muted-foreground">Threats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Link2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.blockchainRecords}</div>
            <p className="text-sm text-muted-foreground">Blockchain Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Scale className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{stats.legalActions}</div>
            <p className="text-sm text-muted-foreground">Legal Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="phase1" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Core Protection
          </TabsTrigger>
          <TabsTrigger value="phase2" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Market Edge
          </TabsTrigger>
          <TabsTrigger value="phase3" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Advanced AI
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legal Network
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Blockchain
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Production
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phase Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Phase Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Phase 1: Core Protection</span>
                    <Badge className="bg-green-500">Complete</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Phase 2: Market Differentiation</span>
                    <Badge className="bg-blue-500">Active</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Phase 3: Tech Superiority</span>
                    <Badge className="bg-purple-500">In Progress</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-3/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {renderActivityIcon(activity.icon)}
                        <span>{activity.message}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No recent activity</p>
                      <p className="text-xs mt-1">Upload content to start monitoring</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm" onClick={() => navigate('/upload')}>
                  <Upload className="h-3 w-3 mr-2" />
                  Upload & Protect
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/monitoring-hub')}>
                  <Eye className="h-3 w-3 mr-2" />
                  Start Monitoring
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/protection-hub')}>
                  <Brain className="h-3 w-3 mr-2" />
                  Configure AI Protection
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/legal-templates')}>
                  <Scale className="h-3 w-3 mr-2" />
                  Legal Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Phase 1: Core Protection */}
        <TabsContent value="phase1" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  One-Click Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OneClickProtection />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-green-500">94.7%</div>
                  <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                  <Button className="w-full" onClick={() => navigate('/protection-hub')}>View Detection Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <AIDetectionDashboard />
        </TabsContent>

        {/* Phase 2: Market Differentiation */}
        <TabsContent value="phase2" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-xl font-semibold mb-2">Blockchain Registry</h3>
                <p className="text-sm text-muted-foreground">
                  Immutable proof of ownership with smart contracts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Scale className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Legal Network</h3>
                <p className="text-sm text-muted-foreground">
                  Global network of IP attorneys and legal experts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-semibold mb-2">Creator Economy</h3>
                <p className="text-sm text-muted-foreground">
                  Monetization and licensing platform integration
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <BlockchainOwnershipRegistry />
            <CreatorEconomy />
          </div>
        </TabsContent>

        {/* Phase 3: Advanced AI */}
        <TabsContent value="phase3" className="space-y-6">
          <MultiModalAIProtection />
        </TabsContent>

        {/* Legal Network */}
        <TabsContent value="legal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlobalLegalNetwork />
            <RealTimeLegalDashboard />
          </div>
        </TabsContent>

        {/* Blockchain */}
        <TabsContent value="blockchain" className="space-y-6">
          <BlockchainOwnershipRegistry />
        </TabsContent>

        {/* Production */}
        <TabsContent value="production" className="space-y-6">
          <ProductionDashboard />
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  );
};

export default UnifiedDashboard;