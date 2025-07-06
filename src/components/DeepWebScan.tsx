import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Globe, 
  ShoppingCart, 
  Users, 
  Image, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Eye,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScanTarget {
  id: string;
  name: string;
  type: 'marketplace' | 'social' | 'content' | 'darkweb';
  icon: any;
  progress: number;
  status: 'pending' | 'scanning' | 'completed' | 'found';
  results: number;
  threats: number;
}

interface ScanResult {
  platform: string;
  url: string;
  similarity: number;
  status: 'violation' | 'suspicious' | 'monitored';
  timestamp: string;
  details: string;
}

const DeepWebScan = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [targets, setTargets] = useState<ScanTarget[]>([
    { id: '1', name: 'Etsy', type: 'marketplace', icon: ShoppingCart, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '2', name: 'eBay', type: 'marketplace', icon: ShoppingCart, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '3', name: 'Amazon', type: 'marketplace', icon: ShoppingCart, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '4', name: 'Instagram', type: 'social', icon: Users, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '5', name: 'Pinterest', type: 'social', icon: Users, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '6', name: 'Facebook', type: 'social', icon: Users, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '7', name: 'DeviantArt', type: 'content', icon: Image, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '8', name: 'Behance', type: 'content', icon: Image, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '9', name: 'ArtStation', type: 'content', icon: Image, progress: 0, status: 'pending', results: 0, threats: 0 },
    { id: '10', name: 'Dark Web Networks', type: 'darkweb', icon: Shield, progress: 0, status: 'pending', results: 0, threats: 0 },
  ]);

  const startDeepScan = async () => {
    setIsScanning(true);
    setOverallProgress(0);
    setScanResults([]);
    
    toast({
      title: "Deep Web Scan Initiated",
      description: "Comprehensive search across all platforms has begun",
    });

    // Reset all targets
    setTargets(prev => prev.map(target => ({
      ...target,
      progress: 0,
      status: 'pending',
      results: 0,
      threats: 0
    })));

    // Simulate scanning each target
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      
      // Update status to scanning
      setTargets(prev => prev.map(t => 
        t.id === target.id ? { ...t, status: 'scanning' } : t
      ));

      // Simulate scanning progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setTargets(prev => prev.map(t => 
          t.id === target.id ? { ...t, progress } : t
        ));
        
        setOverallProgress((i * 100 + progress) / targets.length);
      }

      // Generate random results
      const results = Math.floor(Math.random() * 50) + 10;
      const threats = Math.floor(Math.random() * 5);
      const status = threats > 0 ? 'found' : 'completed';

      setTargets(prev => prev.map(t => 
        t.id === target.id ? { 
          ...t, 
          status: status, 
          results, 
          threats 
        } : t
      ));

      // Add scan results if threats found
      if (threats > 0) {
        const newResults: ScanResult[] = Array.from({ length: threats }, (_, index) => ({
          platform: target.name,
          url: `https://${target.name.toLowerCase()}.com/item/${Math.random().toString(36).substr(2, 9)}`,
          similarity: Math.floor(Math.random() * 30) + 70,
          status: Math.random() > 0.5 ? 'violation' : 'suspicious',
          timestamp: new Date().toISOString(),
          details: `Potential copyright infringement detected with ${Math.floor(Math.random() * 30) + 70}% similarity match`
        }));
        
        setScanResults(prev => [...prev, ...newResults]);
      }
    }

    setIsScanning(false);
    
    toast({
      title: "Deep Web Scan Complete",
      description: `Scan completed. ${scanResults.length} potential threats detected.`,
      variant: scanResults.length > 0 ? "destructive" : "default"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found': return 'destructive';
      case 'scanning': return 'secondary';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'found': return AlertTriangle;
      case 'scanning': return Search;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Controls */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Deep Web Scan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Comprehensive search across marketplaces, social media, content platforms, and dark web
              </p>
              {isScanning && (
                <div className="mt-2">
                  <Progress value={overallProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Overall Progress: {Math.round(overallProgress)}%
                  </p>
                </div>
              )}
            </div>
            <Button 
              onClick={startDeepScan} 
              disabled={isScanning}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isScanning ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Start Deep Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {targets.map((target) => {
          const Icon = target.icon;
          const StatusIcon = getStatusIcon(target.status);
          
          return (
            <Card key={target.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <Badge variant={getStatusColor(target.status)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {target.status.toUpperCase()}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-sm mb-2">{target.name}</h3>
                
                {target.status === 'scanning' && (
                  <Progress value={target.progress} className="mb-2" />
                )}
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Results:</span>
                    <span>{target.results}</span>
                  </div>
                  {target.threats > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Threats:</span>
                      <span className="font-medium">{target.threats}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Threats Detected ({scanResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanResults.map((result, index) => (
                <div key={index} className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{result.platform}</Badge>
                        <Badge variant={result.status === 'violation' ? 'destructive' : 'secondary'}>
                          {result.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{result.similarity}% Similarity</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.details}</p>
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {result.url}
                      </a>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                      <Button size="sm" variant="destructive" className="mt-2">
                        <Zap className="w-3 h-3 mr-1" />
                        Take Action
                      </Button>
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

export default DeepWebScan;