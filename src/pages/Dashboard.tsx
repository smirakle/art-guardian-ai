import React, { useState } from 'react';
import { BugReportButton } from '@/components/BugReportButton';
import SimpleDashboard from './SimpleDashboard';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, BarChart3 } from 'lucide-react';
import { PremiumStatCard } from '@/components/dashboard/PremiumStatCard';
import { ThreatRadar } from '@/components/dashboard/ThreatRadar';
import { HighThreatsSection } from '@/components/dashboard/HighThreatsSection';
import { DashboardActivityFeed } from '@/components/dashboard/DashboardActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Activity,
  AlertTriangle,
  Link2,
  Scale,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const { isAdmin } = useUserPreferences();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <SimpleDashboard />

      {/* Progressive disclosure: admin users can expand advanced stats */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto mt-6 px-2">
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2 justify-center">
                <BarChart3 className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Analytics
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-6">
              <AdvancedStatsSection />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <BugReportButton />
    </>
  );
};

const AdvancedStatsSection = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['advancedDashboardStats', user?.id],
    enabled: !!user,
    staleTime: 30000,
    queryFn: async () => {
      const [artworkResult, protectionResult, blockchainResult, violationResult, dmcaResult, agentResult, threatResult] = await Promise.all([
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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <PremiumStatCard icon={Shield} value={stats?.protectedAssets.toLocaleString() ?? '0'} label="Protected Assets" accentColor="green" trend="+2" trendUp />
        <PremiumStatCard icon={Activity} value={stats?.activeScans ?? 0} label="Active Scans" accentColor="primary" />
        <PremiumStatCard icon={AlertTriangle} value={stats?.threats ?? 0} label="Threats Found" accentColor="accent" />
        <PremiumStatCard icon={Link2} value={stats?.blockchainRecords ?? 0} label="Blockchain Records" accentColor="purple" />
        <PremiumStatCard icon={Scale} value={stats?.legalActions ?? 0} label="Legal Actions" accentColor="secondary" />
        <PremiumStatCard icon={TrendingUp} value={`${stats?.successRate ?? 95}%`} label="Success Rate" accentColor="green" trend="↑" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardActivityFeed activities={stats?.recentActivity ?? []} />
        </div>
        <ThreatRadar threatCount={stats?.threats ?? 0} successRate={stats?.successRate ?? 95} />
      </div>

      <HighThreatsSection />
    </>
  );
};

export default Dashboard;
