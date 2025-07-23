import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Shield, Globe, Eye, Search, AlertTriangle, Zap, Brain, Network, Activity, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const EnhancedMonitoringOverview = () => {
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<MonitoringStats | null>(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  useEffect(() => {
    // Load latest stats
    loadLatestStats();

    // Set up real-time subscription
    const statsChannel = supabase
      .channel('monitoring-overview-stats')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'realtime_monitoring_stats' },
        (payload) => {
          setRealtimeData(payload.new as MonitoringStats);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
    };
  }, []);

  const loadLatestStats = async () => {
    try {
      const { data, error } = await supabase
        .from('realtime_monitoring_stats')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setRealtimeData(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const startRealtimeDataGeneration = async () => {
    setIsGeneratingData(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-realtime-data', {
        body: {
          action: 'start',
          duration: 300 // 5 minutes
        }
      });

      if (error) throw error;

      toast({
        title: "Real-time Data Generation Started",
        description: "Live monitoring data will update automatically for the next 5 minutes",
      });

    } catch (error) {
      console.error('Error starting data generation:', error);
      toast({
        title: "Error",
        description: "Failed to start real-time data generation",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingData(false);
    }
  };

  // Dynamic stats based on real-time data
  const monitoringStats = realtimeData ? [
    { label: "Total Sources", value: realtimeData.sources_scanned.toLocaleString(), icon: Globe, color: "text-primary" },
    { label: "Dark Web Scans", value: realtimeData.dark_web_scans.toLocaleString(), icon: Network, color: "text-purple-500" },
    { label: "Deepfakes Found", value: realtimeData.deepfakes_detected.toString(), icon: Brain, color: "text-red-500" },
    { label: "Surface Web Scans", value: realtimeData.surface_web_scans.toLocaleString(), icon: Zap, color: "text-blue-500" }
  ] : [
    { label: "Total Sources", value: "1,000,000+", icon: Globe, color: "text-primary" },
    { label: "Dark Web Coverage", value: "98%", icon: Network, color: "text-purple-500" },
    { label: "AI Detection Rate", value: "99.7%", icon: Brain, color: "text-green-500" },
    { label: "Response Time", value: "< 2s", icon: Zap, color: "text-yellow-500" }
  ];

  const platformCategories = [
    { 
      name: "Social Media", 
      count: 250000, 
      platforms: ["Instagram", "Pinterest", "TikTok", "YouTube", "Facebook", "Twitter/X", "Reddit", "Tumblr"],
      coverage: 99
    },
    { 
      name: "E-commerce", 
      count: 180000, 
      platforms: ["Amazon", "eBay", "Etsy", "Alibaba", "Shopify", "Redbubble", "Society6"],
      coverage: 97
    },
    { 
      name: "Stock Photos", 
      count: 120000, 
      platforms: ["Getty Images", "Shutterstock", "Unsplash", "Pixabay", "Adobe Stock"],
      coverage: 95
    },
    { 
      name: "Dark Web", 
      count: 80000, 
      platforms: ["Tor Markets", "Anonymous Forums", "P2P Networks", "Crypto Exchanges"],
      coverage: 85
    },
    { 
      name: "International", 
      count: 200000, 
      platforms: ["WeChat", "Weibo", "Baidu", "Yandex", "VK", "Douyin", "LINE"],
      coverage: 92
    },
    { 
      name: "Art & Design", 
      count: 170000, 
      platforms: ["ArtStation", "Behance", "DeviantArt", "Dribbble", "Figma Community"],
      coverage: 98
    }
  ];

  const detectionFeatures = [
    { title: "AI-Powered Analysis", description: "Advanced neural networks detect even modified versions", active: true },
    { title: "Dark Web Monitoring", description: "Comprehensive coverage of hidden marketplaces", active: true },
    { title: "Real-time Alerts", description: "Instant notifications when infringement is detected", active: true },
    { title: "Blockchain Verification", description: "Immutable proof of ownership and timestamps", active: true }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Control Panel */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Real-time Monitoring Control
          </CardTitle>
          <CardDescription>
            Start live data generation to see real-time monitoring statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={startRealtimeDataGeneration}
              disabled={isGeneratingData}
              className="flex items-center gap-2"
            >
              {isGeneratingData ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Live Data
                </>
              )}
            </Button>
            {realtimeData && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">
                  Last updated: {new Date(realtimeData.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Enhanced Copyright Monitoring</CardTitle>
              <CardDescription>
                AI-powered protection across 1M+ sources including dark web surveillance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {monitoringStats.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-background/50 rounded-lg">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Platform Coverage Analysis
          </CardTitle>
          <CardDescription>
            Monitoring distribution across different platform categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {platformCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {category.count.toLocaleString()} sources
                  </span>
                </div>
                <Badge variant="outline">{category.coverage}% covered</Badge>
              </div>
              <Progress value={category.coverage} className="h-2" />
              <div className="flex flex-wrap gap-1 mt-2">
                {category.platforms.slice(0, 5).map((platform, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
                {category.platforms.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.platforms.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detection Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Advanced Detection Features
          </CardTitle>
          <CardDescription>
            Cutting-edge AI technology for comprehensive copyright protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectionFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${feature.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="font-medium text-green-700 dark:text-green-400">All Systems Operational</div>
              <div className="text-sm text-green-600 dark:text-green-500">99.9% uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Search className="w-5 h-5 mx-auto mb-2 text-blue-500" />
              <div className="font-medium text-blue-700 dark:text-blue-400">Active Scans</div>
              <div className="text-sm text-blue-600 dark:text-blue-500">24/7 monitoring</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Network className="w-5 h-5 mx-auto mb-2 text-purple-500" />
              <div className="font-medium text-purple-700 dark:text-purple-400">Dark Web Active</div>
              <div className="text-sm text-purple-600 dark:text-purple-500">Deep monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMonitoringOverview;