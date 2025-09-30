import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Zap,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface SimulationEvent {
  id: string;
  type: 'scan' | 'threat' | 'protection' | 'resolution';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: Date;
  platform?: string;
}

export const LiveDemoSimulation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [stats, setStats] = useState({
    scansCompleted: 0,
    threatsDetected: 0,
    threatsResolved: 0,
    platformsMonitored: 0
  });

  const simulationScenarios: Omit<SimulationEvent, 'id' | 'timestamp'>[] = [
    {
      type: 'scan',
      title: 'Scanning Instagram',
      description: 'Analyzing 1,245 posts for unauthorized usage',
      severity: 'info',
      platform: 'Instagram'
    },
    {
      type: 'threat',
      title: 'Threat Detected',
      description: 'Unauthorized use detected on Instagram - 92% match confidence',
      severity: 'critical',
      platform: 'Instagram'
    },
    {
      type: 'protection',
      title: 'AI Protection Applied',
      description: 'Adversarial protection layer activated for new artwork',
      severity: 'success'
    },
    {
      type: 'scan',
      title: 'Scanning Pinterest',
      description: 'Monitoring 847 pins for potential violations',
      severity: 'info',
      platform: 'Pinterest'
    },
    {
      type: 'threat',
      title: 'Style Theft Detected',
      description: 'Similar artwork style detected on DeviantArt - 85% confidence',
      severity: 'warning',
      platform: 'DeviantArt'
    },
    {
      type: 'resolution',
      title: 'DMCA Notice Filed',
      description: 'Automated takedown request sent to Instagram',
      severity: 'success',
      platform: 'Instagram'
    },
    {
      type: 'scan',
      title: 'Blockchain Verification',
      description: 'Verifying ownership certificates on Ethereum',
      severity: 'info'
    },
    {
      type: 'protection',
      title: 'Certificate Registered',
      description: 'Blockchain certificate #CERT-4829 registered successfully',
      severity: 'success'
    },
    {
      type: 'threat',
      title: 'AI Training Violation',
      description: 'Your artwork detected in AI training dataset',
      severity: 'critical'
    },
    {
      type: 'resolution',
      title: 'Violation Resolved',
      description: 'Content removed from AI training dataset',
      severity: 'success'
    }
  ];

  useEffect(() => {
    if (!isRunning) return;

    let eventIndex = 0;
    let progressValue = 0;

    const eventInterval = setInterval(() => {
      if (eventIndex >= simulationScenarios.length) {
        setIsRunning(false);
        return;
      }

      const scenario = simulationScenarios[eventIndex];
      const newEvent: SimulationEvent = {
        ...scenario,
        id: `event-${Date.now()}-${eventIndex}`,
        timestamp: new Date()
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 10));

      // Update stats
      setStats(prev => ({
        ...prev,
        scansCompleted: scenario.type === 'scan' ? prev.scansCompleted + 1 : prev.scansCompleted,
        threatsDetected: scenario.type === 'threat' ? prev.threatsDetected + 1 : prev.threatsDetected,
        threatsResolved: scenario.type === 'resolution' ? prev.threatsResolved + 1 : prev.threatsResolved,
        platformsMonitored: scenario.platform && prev.platformsMonitored < 4 ? prev.platformsMonitored + 1 : prev.platformsMonitored
      }));

      eventIndex++;
    }, 2000);

    const progressInterval = setInterval(() => {
      progressValue = (progressValue + 2) % 100;
      setScanProgress(progressValue);
    }, 100);

    return () => {
      clearInterval(eventInterval);
      clearInterval(progressInterval);
    };
  }, [isRunning]);

  const handleReset = () => {
    setEvents([]);
    setScanProgress(0);
    setStats({
      scansCompleted: 0,
      threatsDetected: 0,
      threatsResolved: 0,
      platformsMonitored: 0
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-500/5';
      case 'warning':
        return 'border-l-4 border-orange-500 bg-orange-500/5';
      case 'success':
        return 'border-l-4 border-green-500 bg-green-500/5';
      default:
        return 'border-l-4 border-blue-500 bg-blue-500/5';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle>Live Protection Simulation</CardTitle>
            </div>
            <Badge variant={isRunning ? 'default' : 'secondary'}>
              {isRunning ? 'Active' : 'Paused'}
            </Badge>
          </div>
          <CardDescription>
            Watch real-time simulation of our AI protection system in action
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Eye className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">{stats.scansCompleted}</div>
              <div className="text-xs text-muted-foreground">Scans</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <div className="text-2xl font-bold">{stats.threatsDetected}</div>
              <div className="text-xs text-muted-foreground">Threats</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">{stats.threatsResolved}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-bold">{stats.platformsMonitored}</div>
              <div className="text-xs text-muted-foreground">Platforms</div>
            </div>
          </div>

          {/* Scanning Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scanning...</span>
                <span className="text-muted-foreground">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1"
              variant={isRunning ? 'outline' : 'default'}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Feed */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Activity Feed</CardTitle>
            <CardDescription>Real-time protection events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg ${getSeverityColor(event.severity)} transition-all animate-slide-in`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(event.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.platform && (
                          <Badge variant="outline" className="text-xs">
                            {event.platform}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
