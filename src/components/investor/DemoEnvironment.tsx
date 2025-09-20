import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Shield, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Monitor,
  FileText,
  Users
} from 'lucide-react';

const DemoEnvironment = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  const demoSteps = [
    { title: "Upload Protected Content", description: "Artist uploads their artwork to TSMO Technology" },
    { title: "AI Fingerprinting", description: "Our AI creates unique fingerprints for protection" },
    { title: "Real-time Monitoring", description: "System scans 70+ platforms continuously" },
    { title: "Violation Detection", description: "Unauthorized use detected on multiple platforms" },
    { title: "Automated Response", description: "DMCA notices filed automatically" },
    { title: "Legal Enforcement", description: "Legal team contacted for escalation" }
  ];

  const mockData = {
    detections: [
      { platform: "Instagram", matches: 5, status: "processing", confidence: 95 },
      { platform: "Pinterest", matches: 12, status: "dmca_sent", confidence: 92 },
      { platform: "Facebook", matches: 3, status: "resolved", confidence: 98 },
      { platform: "TikTok", matches: 8, status: "escalated", confidence: 89 }
    ],
    metrics: {
      protectedArtworks: 1247,
      activeScans: 89,
      violationsDetected: 156,
      dmcaSuccess: 87
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setDemoStep(current => (current + 1) % demoSteps.length);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, demoSteps.length]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'dmca_sent': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing': return 'Analyzing';
      case 'dmca_sent': return 'DMCA Sent';
      case 'resolved': return 'Resolved';
      case 'escalated': return 'Legal Action';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              TSMO Live Demo Environment
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Start'} Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPlaying(false);
                  setDemoStep(0);
                  setScanProgress(0);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Demo Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {demoStep + 1} of {demoSteps.length}
              </span>
            </div>
            <Progress value={(demoStep / (demoSteps.length - 1)) * 100} />
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold text-primary mb-2">
                {demoSteps[demoStep].title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {demoSteps[demoStep].description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Demo Interface */}
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="detections">Detections</TabsTrigger>
          <TabsTrigger value="responses">Auto Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Protection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockData.metrics.protectedArtworks}</div>
                    <div className="text-sm text-muted-foreground">Protected Artworks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{mockData.metrics.activeScans}</div>
                    <div className="text-sm text-muted-foreground">Active Scans</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scanning Progress</span>
                    <span>{scanProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={scanProgress} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Platform Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Social Media (20)', 'E-commerce (15)', 'Art Platforms (12)', 'Stock Photos (8)', 'Print on Demand (15)'].map((platform, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{platform}</span>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Detections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.detections.map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(detection.status)}
                      <div>
                        <div className="font-medium">{detection.platform}</div>
                        <div className="text-sm text-muted-foreground">
                          {detection.matches} matches found • {detection.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    <Badge variant={detection.status === 'resolved' ? 'default' : 'secondary'}>
                      {getStatusLabel(detection.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">25</div>
                    <div className="text-sm text-blue-700">DMCA Notices Sent</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-green-700">Success Rate</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Recent Actions</h3>
                  {[
                    { action: 'DMCA Notice Filed', platform: 'Instagram', time: '2 minutes ago', status: 'sent' },
                    { action: 'Takedown Request', platform: 'Pinterest', time: '5 minutes ago', status: 'acknowledged' },
                    { action: 'Legal Escalation', platform: 'Etsy', time: '1 hour ago', status: 'in_progress' },
                    { action: 'Content Removed', platform: 'Facebook', time: '3 hours ago', status: 'resolved' }
                  ].map((actionItem, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{actionItem.action}</div>
                        <div className="text-xs text-muted-foreground">{actionItem.platform} • {actionItem.time}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {actionItem.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary">156</div>
                    <div className="text-sm text-muted-foreground">Violations Detected</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-muted-foreground">Resolution Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Platform Coverage</span>
                    <span>70+ platforms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Response Time</span>
                    <span>&lt; 2 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>False Positive Rate</span>
                    <span>&lt; 5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Retention</span>
                    <span className="font-medium text-green-600">97.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Net Promoter Score</span>
                    <span className="font-medium text-green-600">72</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Support Response</span>
                    <span className="font-medium text-blue-600">&lt; 1 hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Demo Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Experience TSMO's Power</h3>
            <p className="text-muted-foreground">
              This interactive demo showcases our comprehensive IP protection capabilities.
              Ready to see the full platform in action?
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg">
                <Users className="h-4 w-4 mr-2" />
                Schedule Live Demo
              </Button>
              <Button variant="outline" size="lg">
                <Shield className="h-4 w-4 mr-2" />
                Start Free Trial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoEnvironment;