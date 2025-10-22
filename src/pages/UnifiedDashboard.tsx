import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ContextualHelp from '@/components/help-system/ContextualHelp';
import { UserGuide } from '@/components/UserGuide';
import { unifiedDashboardGuide } from '@/data/userGuides';
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
  BarChart3,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardEmptyState } from '@/components/customer-success/DashboardEmptyState';
import { useQuery } from '@tanstack/react-query';

// Lazy load tab components for better performance
const ProductionDashboard = lazy(() => import('@/components/dashboard/ProductionDashboard').then(m => ({ default: m.ProductionDashboard })));
const AIDetectionDashboard = lazy(() => import('@/components/phase1/AIDetectionDashboard').then(m => ({ default: m.AIDetectionDashboard })));
const OneClickProtection = lazy(() => import('@/components/phase1/OneClickProtection').then(m => ({ default: m.OneClickProtection })));
const BlockchainOwnershipRegistry = lazy(() => import('@/components/blockchain/BlockchainOwnershipRegistry').then(m => ({ default: m.BlockchainOwnershipRegistry })));
const GlobalLegalNetwork = lazy(() => import('@/components/legal/GlobalLegalNetwork').then(m => ({ default: m.GlobalLegalNetwork })));
const RealTimeLegalDashboard = lazy(() => import('@/components/legal/RealTimeLegalDashboard').then(m => ({ default: m.RealTimeLegalDashboard })));
const CreatorEconomy = lazy(() => import('@/components/phase2/CreatorEconomy').then(m => ({ default: m.CreatorEconomy })));
const VisualRecognition = lazy(() => import('@/components/VisualRecognition'));

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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [monitoringFrequency, setMonitoringFrequency] = useState<string>('daily');
  const [savingFrequency, setSavingFrequency] = useState(false);

  // Optimized data fetching with React Query and parallel queries
  const { data: stats, isLoading: dataLoading } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    enabled: !!user && !authLoading,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (formerly cacheTime)
    queryFn: async () => {
      console.log('UnifiedDashboard: Starting parallel queries for user:', user!.id);
      const startTime = performance.now();

      // Execute all queries in parallel for better performance
      const [
        artworkResult,
        protectionResult,
        blockchainResult,
        violationResult,
        dmcaResult,
        agentResult,
        threatResult
      ] = await Promise.all([
        // Only select needed fields instead of '*'
        supabase
          .from('artwork')
          .select('id, title, created_at', { count: 'exact' })
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1), // Only need latest for activity
        
        supabase
          .from('ai_protection_records')
          .select('id, created_at', { count: 'exact' })
          .eq('user_id', user!.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1),
        
        supabase
          .from('blockchain_certificates')
          .select('id, created_at', { count: 'exact' })
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1),
        
        supabase
          .from('ai_training_violations')
          .select('id, detected_at')
          .eq('user_id', user!.id)
          .order('detected_at', { ascending: false })
          .limit(1),
        
        supabase
          .from('ai_protection_dmca_notices')
          .select('id, created_at', { count: 'exact' })
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1),
        
        supabase
          .from('ai_monitoring_agents')
          .select('id', { count: 'exact' })
          .eq('user_id', user!.id)
          .eq('status', 'active'),
        
        supabase
          .from('ai_threat_detections')
          .select('id, status')
          .eq('user_id', user!.id)
      ]);

      // Get copyright matches separately since it depends on artwork IDs
      const artworkIds = artworkResult.data?.map(a => a.id) || [];
      const matchResult = artworkIds.length > 0 ? await supabase
        .from('copyright_matches')
        .select('id', { count: 'exact' })
        .in('artwork_id', artworkIds) : { count: 0, data: [] };

      const endTime = performance.now();
      console.log(`Dashboard queries completed in ${Math.round(endTime - startTime)}ms`);

      // Calculate stats from results
      const totalThreats = threatResult.data?.length || 0;
      const resolvedThreats = threatResult.data?.filter(t => t.status === 'resolved').length || 0;
      const successRate = totalThreats > 0 ? Math.round((resolvedThreats / totalThreats) * 100) : 95;

      // Build recent activity efficiently
      const recentActivity = [
        artworkResult.data?.[0] && {
          icon: 'shield',
          message: `Protected "${artworkResult.data[0].title}"`,
          timestamp: new Date(artworkResult.data[0].created_at)
        },
        violationResult.data?.[0] && {
          icon: 'alert',
          message: 'AI training violation detected',
          timestamp: new Date(violationResult.data[0].detected_at)
        },
        blockchainResult.data?.[0] && {
          icon: 'link',
          message: 'Blockchain certificate created',
          timestamp: new Date(blockchainResult.data[0].created_at)
        },
        dmcaResult.data?.[0] && {
          icon: 'scale',
          message: 'DMCA notice filed',
          timestamp: new Date(dmcaResult.data[0].created_at)
        },
        protectionResult.data?.[0] && {
          icon: 'eye',
          message: 'AI protection applied',
          timestamp: new Date(protectionResult.data[0].created_at)
        }
      ]
        .filter(Boolean)
        .sort((a, b) => b!.timestamp.getTime() - a!.timestamp.getTime())
        .slice(0, 5);

      return {
        protectedAssets: (artworkResult.count || 0) + (protectionResult.count || 0),
        activeScans: agentResult.count || 0,
        threats: matchResult.count || 0,
        blockchainRecords: blockchainResult.count || 0,
        legalActions: dmcaResult.count || 0,
        successRate,
        recentActivity
      };
    }
  });

  // Memoize empty state check - always called after all other hooks
  const hasAnyData = useMemo(() => 
    stats ? (stats.protectedAssets > 0 || stats.threats > 0 || stats.blockchainRecords > 0) : false,
    [stats]
  );

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

  const handleSaveMonitoringFrequency = async () => {
    if (!user) return;
    
    setSavingFrequency(true);
    try {
      // Update all active portfolios with the new frequency
      const { error } = await supabase
        .from('portfolios')
        .update({
          monitoring_frequency: monitoringFrequency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: "Frequency Updated",
        description: `Monitoring frequency set to ${monitoringFrequency} for all portfolios.`,
      });
    } catch (error: any) {
      console.error('Error saving monitoring frequency:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingFrequency(false);
    }
  };

  // Show loading state immediately to improve LCP
  if (authLoading || dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <ContextualHelp />
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-8 w-8 mx-auto mb-2 bg-muted animate-pulse rounded" />
                <div className="h-6 w-12 mx-auto bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-20 mx-auto bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* User Experience Enhancements */}
      <ContextualHelp />
      
      {!hasAnyData ? (
        <DashboardEmptyState />
      ) : (
          <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Protection Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your IP protection
            </p>
          </div>
          <UserGuide 
            title={unifiedDashboardGuide.title}
            description={unifiedDashboardGuide.description}
            sections={unifiedDashboardGuide.sections}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold" data-tooltip="protection-status">
              {stats?.protectedAssets.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Protected Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold" data-tooltip="monitoring">
              {stats?.activeScans}
            </div>
            <p className="text-sm text-muted-foreground">Active Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats?.threats}</div>
            <p className="text-sm text-muted-foreground">Threats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Link2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats?.blockchainRecords}</div>
            <p className="text-sm text-muted-foreground">Blockchain Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Scale className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{stats?.legalActions}</div>
            <p className="text-sm text-muted-foreground">Legal Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats?.successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="protection" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Protection
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legal
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Blockchain
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
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

          {/* Monitoring Frequency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Monitoring Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scan Frequency</label>
                <select
                  value={monitoringFrequency}
                  onChange={(e) => setMonitoringFrequency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="realtime">Real-time (Continuous)</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                {monitoringFrequency === 'realtime' && '⚡ Continuous monitoring across all platforms'}
                {monitoringFrequency === 'hourly' && '🔄 Scans run every hour'}
                {monitoringFrequency === 'daily' && '📅 Scans run once per day'}
                {monitoringFrequency === 'weekly' && '📆 Scans run once per week'}
                {monitoringFrequency === 'monthly' && '🗓️ Scans run once per month'}
              </div>
              <Button 
                className="w-full" 
                onClick={handleSaveMonitoringFrequency}
                disabled={savingFrequency}
              >
                {savingFrequency ? 'Saving...' : 'Save Frequency Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protection Tab - Lazy loaded */}
        <TabsContent value="protection" className="space-y-6">
          <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload & Protect
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
                  <AIDetectionDashboard />
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>

        {/* Legal Network - Lazy loaded */}
        <TabsContent value="legal" className="space-y-6">
          <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
            <GlobalLegalNetwork />
          </Suspense>
        </TabsContent>

        {/* Blockchain - Lazy loaded */}
        <TabsContent value="blockchain" className="space-y-6">
          <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
            <BlockchainOwnershipRegistry />
          </Suspense>
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  );
};

export default UnifiedDashboard;