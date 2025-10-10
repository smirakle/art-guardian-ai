import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRealtimeMonitoring } from '@/hooks/useRealtimeMonitoring';
import { Activity, AlertTriangle, CheckCircle, Globe, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LiveMonitoringDashboardProps {
  artworkId?: string;
}

const LiveMonitoringDashboard: React.FC<LiveMonitoringDashboardProps> = ({ artworkId }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['google_images', 'tineye', 'pinterest']);
  const { matches, scanUpdates, session, isMonitoring, startMonitoring, stopMonitoring } = useRealtimeMonitoring(activeSessionId);
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalScans: 0, matchesFound: 0, highThreats: 0 });

  // Load existing session if any
  useEffect(() => {
    if (artworkId) {
      const loadActiveSession = async () => {
        const { data } = await supabase
          .from('realtime_monitoring_sessions')
          .select('id')
          .eq('status', 'active')
          .limit(1)
          .single();
        
        if (data) {
          setActiveSessionId(data.id);
        }
      };
      loadActiveSession();
    }
  }, [artworkId]);

  // Update stats from matches
  useEffect(() => {
    setStats({
      totalScans: scanUpdates.length,
      matchesFound: matches.length,
      highThreats: matches.filter(m => m.threat_level === 'high').length
    });
  }, [matches, scanUpdates]);

  const handleStartMonitoring = async () => {
    if (!artworkId) {
      toast({
        title: 'No Artwork Selected',
        description: 'Please select an artwork to monitor',
        variant: 'destructive'
      });
      return;
    }

    try {
      const sessionId = await startMonitoring(artworkId, selectedPlatforms);
      setActiveSessionId(sessionId);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const handleStopMonitoring = async () => {
    if (activeSessionId) {
      await stopMonitoring(activeSessionId);
      setActiveSessionId(undefined);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getLatestProgress = () => {
    if (scanUpdates.length === 0) return 0;
    return scanUpdates[scanUpdates.length - 1]?.progress_percentage || 0;
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Monitoring Control
          </CardTitle>
          <CardDescription>
            Real-time copyright monitoring across multiple platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
              variant={isMonitoring ? 'destructive' : 'default'}
              className="gap-2"
            >
              {isMonitoring ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>
            
            {isMonitoring && (
              <Badge variant="default" className="gap-2 animate-pulse">
                <Activity className="h-3 w-3" />
                Live
              </Badge>
            )}
          </div>

          {isMonitoring && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scan Progress</span>
                <span className="font-medium">{getLatestProgress()}%</span>
              </div>
              <Progress value={getLatestProgress()} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Platform Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {selectedPlatforms.length} platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Matches Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matchesFound}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total detections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.highThreats}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Matches Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Detection Feed</CardTitle>
          <CardDescription>
            Real-time copyright matches as they're discovered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No matches detected yet</p>
              {isMonitoring && <p className="text-sm mt-2">Monitoring active...</p>}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards` }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {match.threat_level === 'high' ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getThreatColor(match.threat_level)}>
                        {match.threat_level}
                      </Badge>
                      <Badge variant="outline">{match.platform}</Badge>
                      <span className="text-sm font-medium">
                        {Math.round(match.confidence_score * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{match.match_title}</p>
                    <a
                      href={match.match_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary truncate block"
                    >
                      {match.match_url}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Detected {new Date(match.detected_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LiveMonitoringDashboard;