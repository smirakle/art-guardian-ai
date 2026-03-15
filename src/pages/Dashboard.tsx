import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BugReportButton } from '@/components/BugReportButton';
import { DashboardEmptyState } from '@/components/customer-success/DashboardEmptyState';
import { PremiumDashboardHeader } from '@/components/dashboard/PremiumDashboardHeader';
import { PremiumStatCard } from '@/components/dashboard/PremiumStatCard';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { DashboardActivityFeed } from '@/components/dashboard/DashboardActivityFeed';
import { ThreatRadar } from '@/components/dashboard/ThreatRadar';
import { HighThreatsSection } from '@/components/dashboard/HighThreatsSection';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Activity,
  AlertTriangle,
  Link2,
  Scale,
  TrendingUp,
} from 'lucide-react';

import SimpleDashboard from './SimpleDashboard';

const Dashboard = () => {
  const { interfaceMode } = useUserPreferences();

  if (interfaceMode === 'beginner') {
    return (
      <>
        <SimpleDashboard />
        <BugReportButton />
      </>
    );
  }

  return (
    <>
      <PremiumDashboardContent />
      <BugReportButton />
    </>
  );
};

const PremiumDashboardContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: dataLoading } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    enabled: !!user && !authLoading,
    staleTime: 30000,
    gcTime: 300000,
    queryFn: async () => {
      const [
        artworkResult,
        protectionResult,
        blockchainResult,
        violationResult,
        dmcaResult,
        agentResult,
        threatResult,
      ] = await Promise.all([
        supabase.from('artwork').select('id, title, created_at', { count: 'exact' }).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('ai_protection_records').select('id, created_at', { count: 'exact' }).eq('user_id', user!.id).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('blockchain_certificates').select('id, created_at', { count: 'exact' }).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('ai_training_violations').select('id, detected_at').eq('user_id', user!.id).order('detected_at', { ascending: false }).limit(1),
        supabase.from('ai_protection_dmca_notices').select('id, created_at', { count: 'exact' }).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('ai_monitoring_agents').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('status', 'active'),
        supabase.from('ai_threat_detections').select('id, status').eq('user_id', user!.id),
      ]);

      const artworkIds = artworkResult.data?.map((a) => a.id) || [];
      const matchResult = artworkIds.length > 0
        ? await supabase.from('copyright_matches').select('id', { count: 'exact' }).in('artwork_id', artworkIds)
        : { count: 0, data: [] };

      const totalThreats = threatResult.data?.length || 0;
      const resolvedThreats = threatResult.data?.filter((t) => t.status === 'resolved').length || 0;
      const successRate = totalThreats > 0 ? Math.round((resolvedThreats / totalThreats) * 100) : 95;

      const recentActivity = [
        artworkResult.data?.[0] && { icon: 'shield', message: `Protected "${artworkResult.data[0].title}"`, timestamp: new Date(artworkResult.data[0].created_at) },
        violationResult.data?.[0] && { icon: 'alert', message: 'AI training violation detected', timestamp: new Date(violationResult.data[0].detected_at) },
        blockchainResult.data?.[0] && { icon: 'link', message: 'Blockchain certificate created', timestamp: new Date(blockchainResult.data[0].created_at) },
        dmcaResult.data?.[0] && { icon: 'scale', message: 'DMCA notice filed', timestamp: new Date(dmcaResult.data[0].created_at) },
        protectionResult.data?.[0] && { icon: 'eye', message: 'AI protection applied', timestamp: new Date(protectionResult.data[0].created_at) },
      ]
        .filter(Boolean)
        .sort((a, b) => b!.timestamp.getTime() - a!.timestamp.getTime())
        .slice(0, 5) as Array<{ icon: string; message: string; timestamp: Date }>;

      return {
        protectedAssets: (artworkResult.count || 0) + (protectionResult.count || 0),
        activeScans: agentResult.count || 0,
        threats: matchResult.count || 0,
        blockchainRecords: blockchainResult.count || 0,
        legalActions: dmcaResult.count || 0,
        successRate,
        recentActivity,
      };
    },
  });

  const hasAnyData = useMemo(
    () => (stats ? stats.protectedAssets > 0 || stats.threats > 0 || stats.blockchainRecords > 0 : false),
    [stats]
  );

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!hasAnyData) {
    return <DashboardEmptyState />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <PremiumDashboardHeader />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <PremiumStatCard
          icon={Shield}
          value={stats?.protectedAssets.toLocaleString() ?? '0'}
          label="Protected Assets"
          accentColor="green"
          trend="+2"
          trendUp
        />
        <PremiumStatCard
          icon={Activity}
          value={stats?.activeScans ?? 0}
          label="Active Scans"
          accentColor="primary"
        />
        <PremiumStatCard
          icon={AlertTriangle}
          value={stats?.threats ?? 0}
          label="Threats Found"
          accentColor="accent"
        />
        <PremiumStatCard
          icon={Link2}
          value={stats?.blockchainRecords ?? 0}
          label="Blockchain Records"
          accentColor="purple"
        />
        <PremiumStatCard
          icon={Scale}
          value={stats?.legalActions ?? 0}
          label="Legal Actions"
          accentColor="secondary"
        />
        <PremiumStatCard
          icon={TrendingUp}
          value={`${stats?.successRate ?? 95}%`}
          label="Success Rate"
          accentColor="green"
          trend="↑"
          trendUp
        />
      </div>

      {/* Quick Actions */}
      <DashboardQuickActions />

      {/* Bento Grid: Activity + Threat Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardActivityFeed activities={stats?.recentActivity ?? []} />
        </div>
        <ThreatRadar
          threatCount={stats?.threats ?? 0}
          successRate={stats?.successRate ?? 95}
        />
      </div>

      {/* High Threats */}
      <HighThreatsSection />
    </div>
  );
};

export default Dashboard;
