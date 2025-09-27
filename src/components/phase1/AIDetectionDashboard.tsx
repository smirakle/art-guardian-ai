import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Shield, Zap, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdvancedAIAnalysis } from './AdvancedAIAnalysis';

interface DetectionResult {
  id: string;
  detection_type: string;
  confidence_score: number;
  threat_level: string;
  ai_model_used: string;
  detection_metadata: any;
  created_at: string;
  status: string;
}

interface MonitoringSession {
  id: string;
  session_type: string;
  platforms_monitored: string[];
  detections_count: number;
  high_threat_count: number;
  status: string;
  started_at: string;
  ended_at?: string;
}

export function AIDetectionDashboard() {
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [monitoringSessions, setMonitoringSessions] = useState<MonitoringSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDetections: 0,
    highThreatCount: 0,
    activeSessions: 0,
    averageConfidence: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load detection results
      const { data: results, error: resultsError } = await supabase
        .from('ai_detection_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (resultsError) throw resultsError;
      setDetectionResults(results || []);

      // Load monitoring sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('realtime_monitoring_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;
      setMonitoringSessions(sessions || []);

      // Calculate stats
      const totalDetections = results?.length || 0;
      const highThreatCount = results?.filter(r => ['high', 'critical'].includes(r.threat_level)).length || 0;
      const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
      const averageConfidence = results?.length ? 
        results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length * 100 : 0;

      setStats({
        totalDetections,
        highThreatCount,
        activeSessions,
        averageConfidence
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load AI detection dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAIDetection = async (imageUrl: string, artworkId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-network', {
        body: {
          imageUrl,
          artworkId,
          detectionTypes: ['ai_generated', 'deepfake', 'forgery'],
          platforms: ['google', 'tineye', 'yandex']
        }
      });

      if (error) throw error;

      toast({
        title: "AI Detection Complete",
        description: `Detected ${data.detectionCount} potential issues with ${data.highThreatCount} high-threat items.`,
      });

      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('AI detection error:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to run AI detection analysis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRealtimeMonitoring = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('realtime-threat-monitor', {
        body: {
          sessionType: 'manual',
          platforms: ['google', 'bing', 'social_media'],
          keywords: ['your_brand', 'your_artwork'],
          imageFingerprints: [],
          duration: 60
        }
      });

      if (error) throw error;

      toast({
        title: "Monitoring Started",
        description: `Real-time monitoring session initiated. Session ID: ${data.sessionId}`,
      });

      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Monitoring error:', error);
      toast({
        title: "Monitoring Failed",
        description: "Failed to start real-time monitoring.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatBadgeVariant = (threatLevel: string) => {
    switch (threatLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getDetectionIcon = (detectionType: string) => {
    switch (detectionType) {
      case 'ai_generated': return <Brain className="h-4 w-4" />;
      case 'deepfake': return <Eye className="h-4 w-4" />;
      case 'forgery': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Detection Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze AI-generated content, deepfakes, and unauthorized usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={startRealtimeMonitoring} disabled={isLoading}>
            <Zap className="h-4 w-4 mr-2" />
            Start Monitoring
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDetections}</div>
            <p className="text-xs text-muted-foreground">
              Across all detection types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.highThreatCount}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageConfidence.toFixed(1)}%</div>
            <Progress value={stats.averageConfidence} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detections">Recent Detections</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Sessions</TabsTrigger>
          <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="detections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Detection Results</CardTitle>
              <CardDescription>
                Latest AI content detection and analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detectionResults.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No detection results yet. Start monitoring or upload content for analysis.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {detectionResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDetectionIcon(result.detection_type)}
                        <div>
                          <div className="font-medium capitalize">
                            {result.detection_type.replace('_', ' ')} Detection
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.ai_model_used} • {new Date(result.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {(result.confidence_score * 100).toFixed(1)}% confidence
                          </div>
                          <Progress value={result.confidence_score * 100} className="w-20" />
                        </div>
                        <Badge variant={getThreatBadgeVariant(result.threat_level)}>
                          {result.threat_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Sessions</CardTitle>
              <CardDescription>
                Real-time monitoring session history and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monitoringSessions.length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    No monitoring sessions yet. Start real-time monitoring to track threats.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {monitoringSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">
                          {session.session_type} Monitoring
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Platforms: {session.platforms_monitored.join(', ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(session.started_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {session.detections_count} detections
                          </div>
                          <div className="text-sm text-destructive">
                            {session.high_threat_count} high threats
                          </div>
                        </div>
                        <Badge 
                          variant={session.status === 'active' ? 'default' : 'secondary'}
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AdvancedAIAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}