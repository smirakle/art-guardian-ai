import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Shield, Globe, Eye, Search, AlertTriangle, Zap, Brain, Network, Activity, Play, Pause, Youtube, Facebook, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SocialMediaMonitoringResults from "@/components/SocialMediaMonitoringResults";

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

interface SocialMediaStats {
  platform: string;
  accounts_monitored: number;
  content_scanned: number;
  detections: number;
}

const EnhancedMonitoringOverview = () => {
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<MonitoringStats | null>(null);
  const [socialMediaStats, setSocialMediaStats] = useState<SocialMediaStats[]>([]);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  useEffect(() => {
    // Load latest stats
    loadLatestStats();
    loadSocialMediaStats();

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

    const socialChannel = supabase
      .channel('social-media-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_media_monitoring_results' },
        () => {
          loadSocialMediaStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(socialChannel);
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

  const loadSocialMediaStats = async () => {
    try {
      const { data: accounts, error: accountsError } = await supabase
        .from('social_media_accounts')
        .select('platform');

      const { data: results, error: resultsError } = await supabase
        .from('social_media_monitoring_results')
        .select('account_id, detection_type, social_media_accounts!inner(platform)');

      const { data: scans, error: scansError } = await supabase
        .from('social_media_scans')
        .select('content_scanned, social_media_accounts!inner(platform)');

      if (accountsError || resultsError || scansError) {
        console.error('Error loading social media stats');
        return;
      }

      // Aggregate stats by platform
      const platformStats = ['youtube', 'facebook', 'instagram', 'tiktok'].map(platform => {
        const accountCount = accounts?.filter(a => a.platform === platform).length || 0;
        const contentScanned = scans?.filter(s => s.social_media_accounts.platform === platform)
          .reduce((sum, scan) => sum + (scan.content_scanned || 0), 0) || 0;
        const detections = results?.filter(r => r.social_media_accounts.platform === platform).length || 0;

        return {
          platform,
          accounts_monitored: accountCount,
          content_scanned: contentScanned,
          detections
        };
      });

      setSocialMediaStats(platformStats);
    } catch (error) {
      console.error('Error loading social media stats:', error);
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

  // Only show stats when real data is available
  const monitoringStats = realtimeData ? [
    { label: "Total Sources", value: realtimeData.sources_scanned.toLocaleString(), icon: Globe, color: "text-primary" },
    { label: "Dark Web Scans", value: realtimeData.dark_web_scans.toLocaleString(), icon: Network, color: "text-purple-500" },
    { label: "Deepfakes Found", value: realtimeData.deepfakes_detected.toString(), icon: Brain, color: "text-red-500" },
    { label: "Surface Web Scans", value: realtimeData.surface_web_scans.toLocaleString(), icon: Zap, color: "text-blue-500" }
  ] : null;

  // Platform coverage will be derived from real monitoring data
  const platformCategories = realtimeData ? [
    { 
      name: "Surface Web", 
      count: realtimeData.surface_web_scans, 
      platforms: ["Social Media", "E-commerce", "Stock Photos", "News Sites"],
      coverage: realtimeData.surface_web_scans > 0 ? 100 : 0
    },
    { 
      name: "Dark Web", 
      count: realtimeData.dark_web_scans, 
      platforms: ["Tor Markets", "Anonymous Forums", "P2P Networks"],
      coverage: realtimeData.dark_web_scans > 0 ? 100 : 0
    }
  ] : [];

  // Detection features based on actual system capabilities
  const detectionFeatures = realtimeData ? [
    { 
      title: "AI-Powered Analysis", 
      description: `${realtimeData.deepfakes_detected} deepfakes detected with advanced neural networks`, 
      active: realtimeData.deepfakes_detected > 0 
    },
    { 
      title: "Dark Web Monitoring", 
      description: `${realtimeData.dark_web_scans} dark web sources actively monitored`, 
      active: realtimeData.dark_web_scans > 0 
    },
    { 
      title: "Surface Web Scanning", 
      description: `${realtimeData.surface_web_scans} surface web sources scanned`, 
      active: realtimeData.surface_web_scans > 0 
    },
    { 
      title: "Real-time Detection", 
      description: `Last updated: ${new Date(realtimeData.timestamp).toLocaleTimeString()}`, 
      active: true 
    }
  ] : [];

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
          {monitoringStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {monitoringStats.map((stat, index) => (
                <div key={index} className="text-center p-3 bg-background/50 rounded-lg">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No monitoring data available</p>
              <p className="text-sm text-muted-foreground">Start live data generation to see real-time statistics</p>
            </div>
          )}
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
          {platformCategories.length > 0 ? (
            platformCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {category.count.toLocaleString()} sources scanned
                    </span>
                  </div>
                  <Badge variant="outline">{category.coverage}% active</Badge>
                </div>
                <Progress value={category.coverage} className="h-2" />
                <div className="flex flex-wrap gap-1 mt-2">
                  {category.platforms.map((platform, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No platform data available</p>
              <p className="text-sm text-muted-foreground">Real platform coverage will appear after monitoring starts</p>
            </div>
          )}
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
          {detectionFeatures.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No detection data available</p>
              <p className="text-sm text-muted-foreground">Start monitoring to see detection capabilities</p>
            </div>
          )}
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
              <div className="font-medium text-green-700 dark:text-green-400">
                {realtimeData ? 'Live Data Active' : 'Awaiting Data'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                {realtimeData ? `Updated: ${new Date(realtimeData.timestamp).toLocaleTimeString()}` : 'Start monitoring'}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Search className="w-5 h-5 mx-auto mb-2 text-blue-500" />
              <div className="font-medium text-blue-700 dark:text-blue-400">Sources Scanned</div>
              <div className="text-sm text-blue-600 dark:text-blue-500">
                {realtimeData ? realtimeData.sources_scanned.toLocaleString() : '0'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Network className="w-5 h-5 mx-auto mb-2 text-purple-500" />
              <div className="font-medium text-purple-700 dark:text-purple-400">Deepfakes Found</div>
              <div className="text-sm text-purple-600 dark:text-purple-500">
                {realtimeData ? realtimeData.deepfakes_detected : '0'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Monitoring Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Social Media Platform Coverage
          </CardTitle>
          <CardDescription>
            Real-time monitoring across major social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialMediaStats.map((stat) => {
              const getPlatformIcon = (platform: string) => {
                switch (platform) {
                  case 'youtube': return <Youtube className="w-6 h-6 text-red-500" />;
                  case 'facebook': return <Facebook className="w-6 h-6 text-blue-500" />;
                  case 'instagram': return <Instagram className="w-6 h-6 text-pink-500" />;
                  case 'tiktok': return <div className="w-6 h-6 bg-black rounded text-white text-xs flex items-center justify-center font-bold">T</div>;
                  default: return <Shield className="w-6 h-6" />;
                }
              };

              return (
                <div key={stat.platform} className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    {getPlatformIcon(stat.platform)}
                    <span className="font-medium capitalize">{stat.platform}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accounts</span>
                      <span className="font-medium">{stat.accounts_monitored}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content Scanned</span>
                      <span className="font-medium">{stat.content_scanned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detections</span>
                      <span className="font-medium text-red-600">{stat.detections}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Results */}
      <SocialMediaMonitoringResults />
    </div>
  );
};

export default EnhancedMonitoringOverview;