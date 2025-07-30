import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TrendingUp, 
  File, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AITrainingViolationMonitor from '@/components/AITrainingViolationMonitor';

interface ProtectionStats {
  totalProtected: number;
  activeProtections: number;
  protectionMethods: { [key: string]: number };
  protectionLevels: { [key: string]: number };
  violationsDetected: number;
  threatsStopped: number;
  protectionScore: number;
}

interface RecentActivity {
  id: string;
  type: 'protection_applied' | 'violation_detected' | 'threat_blocked';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

const AIProtectionAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ProtectionStats>({
    totalProtected: 0,
    activeProtections: 0,
    protectionMethods: {},
    protectionLevels: {},
    violationsDetected: 0,
    threatsStopped: 0,
    protectionScore: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load protection records
      const { data: protectionRecords, error: protectionError } = await supabase
        .from('ai_protection_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (protectionError) throw protectionError;

      // Load violations
      const { data: violations, error: violationsError } = await supabase
        .from('ai_training_violations')
        .select('*')
        .eq('user_id', user.id);

      if (violationsError) throw violationsError;

      // Calculate stats
      const protectionMethodCounts: { [key: string]: number } = {};
      const protectionLevelCounts: { [key: string]: number } = {};

      protectionRecords?.forEach(record => {
        // Count protection methods
        const methods = Array.isArray(record.protection_methods) ? record.protection_methods : [];
        methods.forEach((method: string) => {
          protectionMethodCounts[method] = (protectionMethodCounts[method] || 0) + 1;
        });

        // Count protection levels
        protectionLevelCounts[record.protection_level] = 
          (protectionLevelCounts[record.protection_level] || 0) + 1;
      });

      const verifiedViolations = violations?.filter(v => v.status === 'verified') || [];
      const resolvedViolations = violations?.filter(v => v.status === 'resolved') || [];

      const protectionScore = calculateProtectionScore(
        protectionRecords?.length || 0,
        verifiedViolations.length,
        resolvedViolations.length
      );

      setStats({
        totalProtected: protectionRecords?.length || 0,
        activeProtections: protectionRecords?.length || 0,
        protectionMethods: protectionMethodCounts,
        protectionLevels: protectionLevelCounts,
        violationsDetected: violations?.length || 0,
        threatsStopped: resolvedViolations.length,
        protectionScore
      });

      // Generate recent activity
      const activity: RecentActivity[] = [];
      
      // Add protection activities
      protectionRecords?.slice(-5).forEach(record => {
        activity.push({
          id: record.id,
          type: 'protection_applied',
          message: `Applied ${record.protection_level} protection to ${record.original_filename}`,
          timestamp: record.created_at,
          severity: 'low'
        });
      });

      // Add violation activities
      violations?.slice(-3).forEach(violation => {
        activity.push({
          id: violation.id,
          type: 'violation_detected',
          message: `Detected ${violation.violation_type.replace('_', ' ')} violation`,
          timestamp: violation.detected_at,
          severity: violation.confidence_score > 80 ? 'high' : 'medium'
        });
      });

      // Sort by timestamp
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activity.slice(0, 10));

    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load protection analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProtectionScore = (
    totalProtected: number,
    violations: number,
    resolved: number
  ): number => {
    if (totalProtected === 0) return 0;
    
    const baseScore = Math.min(totalProtected * 10, 70);
    const violationPenalty = violations * 5;
    const resolutionBonus = resolved * 3;
    
    return Math.max(0, Math.min(100, baseScore - violationPenalty + resolutionBonus));
  };

  const downloadProtectionReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const reportData = {
        user_id: user.id,
        generated_at: new Date().toISOString(),
        stats,
        recent_activity: recentActivity
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-protection-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Protection report downloaded successfully",
      });

    } catch (error) {
      console.error('Failed to download report:', error);
      toast({
        title: "Error",
        description: "Failed to download protection report",
        variant: "destructive"
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'protection_applied':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'violation_detected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'threat_blocked':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <File className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Protected Files</p>
                <p className="text-2xl font-bold">{stats.totalProtected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Violations Detected</p>
                <p className="text-2xl font-bold">{stats.violationsDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Threats Stopped</p>
                <p className="text-2xl font-bold">{stats.threatsStopped}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Protection Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.protectionScore}</p>
                  <Progress value={stats.protectionScore} className="w-16 h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <Button onClick={downloadProtectionReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Protection Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.protectionMethods).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm">{method.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(stats.protectionMethods).length === 0 && (
                    <p className="text-sm text-muted-foreground">No protection methods applied yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protection Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.protectionLevels).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{level}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / stats.totalProtected) * 100} 
                          className="w-20 h-2" 
                        />
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats.protectionLevels).length === 0 && (
                    <p className="text-sm text-muted-foreground">No protection levels configured yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="violations">
          <AITrainingViolationMonitor />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className={`text-xs ${getSeverityColor(activity.severity)}`}>
                          {new Date(activity.timestamp).toLocaleDateString()} • {activity.severity} priority
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIProtectionAnalytics;