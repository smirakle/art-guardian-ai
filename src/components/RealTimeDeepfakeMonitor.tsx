import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  Eye, 
  Globe, 
  Shield, 
  Brain,
  Zap,
  Clock,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringStats {
  sources_scanned: number;
  deepfakes_detected: number;
  surface_web_scans: number;
  dark_web_scans: number;
  high_threat_count: number;
  medium_threat_count: number;
  low_threat_count: number;
  timestamp: string;
}

interface DeepfakeMatch {
  id: string;
  source_url: string;
  source_domain: string;
  source_title: string;
  image_url: string;
  detection_confidence: number;
  manipulation_type: string;
  threat_level: string;
  source_type: string;
  detected_at: string;
  facial_artifacts: string[];
  temporal_inconsistency: boolean;
}

const RealTimeDeepfakeMonitor = () => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<DeepfakeMatch[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load initial data
    loadRecentMatches();
    loadLatestStats();

    // Set up real-time subscriptions
    const matchesChannel = supabase
      .channel('deepfake-matches-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'deepfake_matches' },
        (payload) => {
          console.log('New deepfake detected:', payload.new);
          setRecentMatches(prev => [payload.new as DeepfakeMatch, ...prev.slice(0, 9)]);
          
          toast({
            title: "🚨 Deepfake Detected!",
            description: `${(payload.new as DeepfakeMatch).manipulation_type} detected with ${Math.round((payload.new as DeepfakeMatch).detection_confidence * 100)}% confidence`,
            variant: "destructive",
          });
        }
      )
      .subscribe();

    const statsChannel = supabase
      .channel('monitoring-stats-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'realtime_monitoring_stats' },
        (payload) => {
          setStats(payload.new as MonitoringStats);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(statsChannel);
    };
  }, []);

  const loadRecentMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('deepfake_matches')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentMatches(data || []);
    } catch (error: any) {
      console.error('Error loading recent matches:', error);
    }
  };

  const loadLatestStats = async () => {
    try {
      const { data, error } = await supabase
        .from('realtime_monitoring_stats')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const startRealtimeMonitoring = async () => {
    setIsMonitoring(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 1000);

      console.log('Starting real-time deepfake monitoring...');
      
      const { data: result, error } = await supabase.functions.invoke('realtime-deepfake-monitor', {
        body: {
          scanType: 'realtime',
          duration: 300 // 5 minutes
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      console.log('Monitoring cycle complete:', result);
      
      toast({
        title: "Monitoring Cycle Complete",
        description: `Scanned ${result.monitoring_summary.total_sources_scanned} sources, detected ${result.monitoring_summary.deepfakes_detected} potential deepfakes`,
      });

      setIsMonitoring(false);

    } catch (error) {
      console.error('Monitoring error:', error);
      toast({
        title: "Monitoring Failed",
        description: error instanceof Error ? error.message : "Failed to start monitoring",
        variant: "destructive",
      });
      setIsMonitoring(false);
      setProgress(0);
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setProgress(0);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'dark': return '🕸️';
      case 'deep': return '🔒';
      default: return '🌐';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const detected = new Date(dateString);
    const diffMs = now.getTime() - detected.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Real-Time Deepfake Monitoring
          </CardTitle>
          <CardDescription>
            Continuous AI-powered scanning across 2.5M+ surface and dark web sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={isMonitoring ? stopMonitoring : startRealtimeMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="flex items-center gap-2"
              size="lg"
            >
              {isMonitoring ? (
                <>
                  <Shield className="w-4 h-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Start Real-Time Monitoring
                </>
              )}
            </Button>
            
            {isMonitoring && (
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-sm text-green-600 font-medium">Live Monitoring Active</span>
              </div>
            )}
          </div>

          {isMonitoring && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Scanning Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {progress < 25 && "Scanning surface web sources..."}
                {progress >= 25 && progress < 50 && "Analyzing dark web forums..."}
                {progress >= 50 && progress < 75 && "Processing detection results..."}
                {progress >= 75 && "Completing analysis cycle..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sources Scanned</p>
                  <p className="text-2xl font-bold">{stats.sources_scanned.toLocaleString()}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Deepfakes Found</p>
                  <p className="text-2xl font-bold text-red-600">{stats.deepfakes_detected}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Surface Web</p>
                  <p className="text-2xl font-bold">{stats.surface_web_scans}</p>
                </div>
                <span className="text-2xl">🌐</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Dark Web</p>
                  <p className="text-2xl font-bold">{stats.dark_web_scans}</p>
                </div>
                <span className="text-2xl">🕸️</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Detections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Deepfake Detections
          </CardTitle>
          <CardDescription>
            Live feed of detected deepfakes across monitored sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No recent detections</p>
              <p className="text-sm text-muted-foreground">Start monitoring to begin detection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <Alert key={match.id} className={`border-l-4 ${
                  match.threat_level === 'high' ? 'border-l-red-500' : 
                  match.threat_level === 'medium' ? 'border-l-yellow-500' : 
                  'border-l-green-500'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getThreatColor(match.threat_level)} className="text-xs">
                            {match.threat_level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getSourceTypeIcon(match.source_type)} {match.source_domain}
                          </span>
                        </div>
                        <p className="font-medium text-sm mb-1">{match.manipulation_type}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {Math.round(match.detection_confidence * 100)}% confidence • {formatTimeAgo(match.detected_at)}
                        </p>
                        {match.facial_artifacts.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {match.facial_artifacts.slice(0, 2).map((artifact, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {artifact}
                              </Badge>
                            ))}
                            {match.facial_artifacts.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{match.facial_artifacts.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(match.detected_at)}
                        </span>
                        <Button variant="ghost" size="sm" className="p-1">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Level Breakdown */}
      {stats && (stats.high_threat_count > 0 || stats.medium_threat_count > 0 || stats.low_threat_count > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Threat Level Analysis</CardTitle>
            <CardDescription>Current threat distribution from monitoring cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stats.high_threat_count}</span>
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.high_threat_count / Math.max(stats.deepfakes_detected, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stats.medium_threat_count}</span>
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.medium_threat_count / Math.max(stats.deepfakes_detected, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stats.low_threat_count}</span>
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.low_threat_count / Math.max(stats.deepfakes_detected, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeDeepfakeMonitor;