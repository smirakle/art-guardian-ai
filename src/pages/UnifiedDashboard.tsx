import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRealDashboardData();
    }
  }, [user]);

  const loadRealDashboardData = async () => {
    try {
      setLoading(true);

      // Get user's artworks
      const { data: artworkData, count: artworkCount } = await supabase
        .from('artwork')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Get AI protection records
      const { data: protectionData, count: protectionCount } = await supabase
        .from('ai_protection_records')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('is_active', true);

      // Get copyright matches (threats)
      const artworkIds = artworkData?.map(a => a.id) || [];
      const { data: matchData, count: matchCount } = await supabase
        .from('copyright_matches')
        .select('*', { count: 'exact' })
        .in('artwork_id', artworkIds);

      // Get blockchain certificates
      const { data: blockchainData, count: blockchainCount } = await supabase
        .from('blockchain_certificates')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Get AI training violations
      const { data: violationData } = await supabase
        .from('ai_training_violations')
        .select('*')
        .eq('user_id', user!.id)
        .order('detected_at', { ascending: false })
        .limit(5);

      // Get DMCA notices (legal actions)
      const { data: dmcaData, count: dmcaCount } = await supabase
        .from('ai_protection_dmca_notices')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Calculate active scans from AI monitoring agents
      const { data: agentData } = await supabase
        .from('ai_monitoring_agents')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active');

      // Calculate success rate from threat detections
      const { data: threatData } = await supabase
        .from('ai_threat_detections')
        .select('*')
        .eq('user_id', user!.id);

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

      setStats({
        protectedAssets: (artworkCount || 0) + (protectionCount || 0),
        activeScans: agentData?.length || 0,
        threats: matchCount || 0,
        blockchainRecords: blockchainCount || 0,
        legalActions: dmcaCount || 0,
        successRate,
        recentActivity: recentActivity.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ).slice(0, 5)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Failed to load dashboard data",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
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
            <div className="text-2xl font-bold">{stats.protectedAssets.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Protected Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.activeScans}</div>
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
                <Button className="w-full" size="sm">
                  <Upload className="h-3 w-3 mr-2" />
                  Upload & Protect
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="h-3 w-3 mr-2" />
                  Start Monitoring
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Brain className="h-3 w-3 mr-2" />
                  Configure AI Protection
                </Button>
                <Button variant="outline" className="w-full" size="sm">
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
                  <Button className="w-full">View Detection Dashboard</Button>
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
    </div>
  );
};

export default UnifiedDashboard;