import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Square, Activity, AlertTriangle, CheckCircle, Eye, Zap, ExternalLink } from 'lucide-react';
import { useDeepfakeMonitoring } from '@/hooks/useDeepfakeMonitoring';

export default function LiveDeepfakeMonitor() {
  const {
    isMonitoring,
    activeSession,
    liveMatches,
    scanUpdates,
    startMonitoring,
    stopMonitoring
  } = useDeepfakeMonitoring();

  const [selectedPlatforms] = useState([
    'Twitter/X',
    'Reddit',
    'Instagram',
    'TikTok',
    'YouTube',
    'Facebook'
  ]);

  const handleStart = () => {
    startMonitoring(selectedPlatforms);
  };

  const scanProgress = activeSession 
    ? Math.min((scanUpdates.length / selectedPlatforms.length) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="flex items-center gap-2">
                Live Deepfake Monitoring
              </CardTitle>
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <Zap className="w-3 h-3 mr-1" />
                Real API
              </Badge>
            </div>
          </div>
          <CardDescription>
            Real-time scanning using SerpAPI reverse image search + OpenAI GPT-4 Vision analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Info Banner */}
          <div className="flex flex-wrap gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <Badge variant="outline" className="text-xs">
              <img src="https://serpapi.com/favicon.ico" alt="" className="w-3 h-3 mr-1" />
              SerpAPI Reverse Image
            </Badge>
            <Badge variant="outline" className="text-xs">
              <img src="https://openai.com/favicon.ico" alt="" className="w-3 h-3 mr-1" />
              OpenAI GPT-4 Vision
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              Searches your protected images across 6 platforms
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <div className="flex items-center gap-2">
                {isMonitoring ? (
                  <>
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-sm text-green-600 dark:text-green-400">Scanning with Real APIs</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ready to Scan</span>
                  </>
                )}
              </div>
            </div>

            {isMonitoring ? (
              <Button onClick={stopMonitoring} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                Stop Monitoring
              </Button>
            ) : (
              <Button onClick={handleStart} className="bg-gradient-to-r from-primary to-accent">
                <Play className="w-4 h-4 mr-2" />
                Start Real Scan
              </Button>
            )}
          </div>

          {isMonitoring && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning Progress</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Statistics */}
      {isMonitoring && activeSession && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Platforms Scanned</p>
                <p className="text-2xl font-bold">{scanUpdates.length}/{selectedPlatforms.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Deepfakes Found</p>
                <p className="text-2xl font-bold text-red-500">{liveMatches.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">High Threats</p>
                <p className="text-2xl font-bold text-orange-500">
                  {liveMatches.filter(m => m.threat_level === 'high').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">AI Confidence Avg</p>
                <p className="text-2xl font-bold">
                  {liveMatches.length > 0
                    ? Math.round(liveMatches.reduce((sum, m) => sum + m.detection_confidence, 0) / liveMatches.length * 100)
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Detection Feed */}
      {liveMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Detections ({liveMatches.length})
              <Badge variant="outline" className="ml-2 text-xs">Real Results</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liveMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {match.threat_level === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{match.manipulation_type}</p>
                      <Badge variant={match.threat_level === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {Math.round(match.detection_confidence * 100)}% AI Confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Found on {match.source_domain}
                    </p>
                    {match.source_url && (
                      <a 
                        href={match.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        View Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {match.facial_artifacts && match.facial_artifacts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.facial_artifacts.slice(0, 3).map((artifact, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {artifact}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    {new Date(match.detected_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Progress Feed */}
      {scanUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Platform Scan Progress
              <Badge variant="outline" className="text-xs">Real API Calls</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanUpdates.slice(0, 6).map((update) => (
                <div key={update.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{update.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {update.matches_found > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {update.matches_found} deepfake{update.matches_found > 1 ? 's' : ''} found
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓ API Scan Complete
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
