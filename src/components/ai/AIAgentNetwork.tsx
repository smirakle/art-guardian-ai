import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Shield, 
  Zap, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Globe,
  Settings,
  PlayCircle,
  PauseCircle,
  Eye,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface Agent {
  id: string;
  platform_name: string;
  status: string;
  last_scan: string | null;
  threats_detected: number;
  success_rate: number;
  scan_frequency: number;
}

interface ThreatDetection {
  id: string;
  platform: string;
  threat_level: string;
  confidence_score: number;
  detected_at: string;
  threat_data: any;
}

interface AgentConfig {
  platforms: string[];
  monitoring_frequency: number;
  threat_threshold: number;
  auto_response_enabled: boolean;
  predictive_analytics: boolean;
}

const PLATFORM_OPTIONS = [
  { id: 'instagram', name: 'Instagram', priority: 95, category: 'Social Media' },
  { id: 'tiktok', name: 'TikTok', priority: 90, category: 'Social Media' },
  { id: 'youtube', name: 'YouTube', priority: 85, category: 'Social Media' },
  { id: 'twitter', name: 'Twitter/X', priority: 80, category: 'Social Media' },
  { id: 'facebook', name: 'Facebook', priority: 75, category: 'Social Media' },
  { id: 'onlyfans', name: 'OnlyFans', priority: 100, category: 'Adult Content' },
  { id: 'pornhub', name: 'Pornhub', priority: 95, category: 'Adult Content' },
  { id: 'opensea', name: 'OpenSea', priority: 95, category: 'NFT Platforms' },
  { id: 'rarible', name: 'Rarible', priority: 85, category: 'NFT Platforms' },
  { id: 'amazon', name: 'Amazon', priority: 85, category: 'E-commerce' },
  { id: 'ebay', name: 'eBay', priority: 80, category: 'E-commerce' },
  { id: 'etsy', name: 'Etsy', priority: 85, category: 'E-commerce' },
  { id: 'google_images', name: 'Google Images', priority: 100, category: 'Search Engines' },
  { id: 'bing_visual', name: 'Bing Visual', priority: 95, category: 'Search Engines' },
  { id: 'shutterstock', name: 'Shutterstock', priority: 90, category: 'Stock Photos' },
  { id: 'getty', name: 'Getty Images', priority: 85, category: 'Stock Photos' },
];

export const AIAgentNetwork = () => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const { toast } = useToast();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentThreats, setRecentThreats] = useState<ThreatDetection[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    platforms: ['instagram', 'tiktok', 'google_images', 'onlyfans'],
    monitoring_frequency: 60, // minutes
    threat_threshold: 0.5,
    auto_response_enabled: false,
    predictive_analytics: true
  });

  const [networkStats, setNetworkStats] = useState({
    total_agents: 0,
    active_agents: 0,
    platforms_covered: 0,
    threats_detected_24h: 0,
    average_response_time: 0,
    detection_accuracy: 0
  });

  useEffect(() => {
    if (user) {
      loadAgentData();
      loadThreatData();
      
      // Set up real-time updates
      const agentChannel = supabase
        .channel('ai-agents-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_monitoring_agents',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadAgentData();
        })
        .subscribe();

      const threatChannel = supabase
        .channel('threat-updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_threat_detections',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadThreatData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(agentChannel);
        supabase.removeChannel(threatChannel);
      };
    }
  }, [user]);

  const loadAgentData = async () => {
    if (!user) return;

    try {
      const { data: agentData } = await supabase
        .from('ai_monitoring_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (agentData) {
        setAgents(agentData);
        
        // Calculate network stats
        const activeAgents = agentData.filter(a => a.status === 'active');
        const platformsCovered = new Set(agentData.map(a => a.platform_id)).size;
        
        setNetworkStats(prev => ({
          ...prev,
          total_agents: agentData.length,
          active_agents: activeAgents.length,
          platforms_covered: platformsCovered,
          detection_accuracy: agentData.reduce((sum, a) => sum + (a.success_rate || 0), 0) / Math.max(agentData.length, 1)
        }));
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    }
  };

  const loadThreatData = async () => {
    if (!user) return;

    try {
      const { data: threatData } = await supabase
        .from('ai_threat_detections')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(20);

      if (threatData) {
        setRecentThreats(threatData);
        
        // Calculate 24h threats
        const last24h = threatData.filter(t => 
          new Date(t.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        setNetworkStats(prev => ({
          ...prev,
          threats_detected_24h: last24h.length
        }));
      }
    } catch (error) {
      console.error('Error loading threat data:', error);
    }
  };

  const deployAgents = async () => {
    if (!user || !hasFeature('advanced_ai')) {
      toast({
        title: "Upgrade Required",
        description: "AI Agent Network requires Professional plan or higher.",
        variant: "destructive",
      });
      return;
    }

    setDeploying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-network', {
        body: {
          action: 'deploy_agents',
          user_id: user.id,
          ...agentConfig
        }
      });

      if (error) throw error;

      toast({
        title: "AI Agents Deployed Successfully",
        description: `${data.deployed_agents} autonomous agents are now monitoring ${data.monitoring_coverage}.`,
      });

      loadAgentData();
    } catch (error) {
      console.error('Error deploying agents:', error);
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy AI agents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeploying(false);
    }
  };

  const scanAllPlatforms = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-network', {
        body: {
          action: 'scan_all_platforms',
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Platform Scan Complete",
        description: `Scanned ${data.scan_results.platforms_scanned} platforms and detected ${data.scan_results.threats_detected} potential threats.`,
      });

      loadThreatData();
    } catch (error) {
      console.error('Error scanning platforms:', error);
      toast({
        title: "Scan Failed",
        description: "Platform scan failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getThreatIntelligence = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-network', {
        body: {
          action: 'get_threat_intelligence',
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Threat Intelligence Updated",
        description: "Latest threat analysis and predictions are now available.",
      });

      return data.intelligence;
    } catch (error) {
      console.error('Error getting threat intelligence:', error);
      return null;
    }
  };

  const getPlatformsByCategory = () => {
    const categories = PLATFORM_OPTIONS.reduce((acc, platform) => {
      if (!acc[platform.category]) {
        acc[platform.category] = [];
      }
      acc[platform.category].push(platform);
      return acc;
    }, {} as Record<string, typeof PLATFORM_OPTIONS>);

    return categories;
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'paused': return <PauseCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getThreatLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Agent Network
          </h1>
          <p className="text-muted-foreground mt-1">
            Autonomous monitoring across 50+ platforms with real-time threat detection
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={scanAllPlatforms}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Scan All Platforms
          </Button>
          <Button
            onClick={deployAgents}
            disabled={deploying || !hasFeature('advanced_ai')}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            {deploying ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            Deploy Agents
          </Button>
        </div>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{networkStats.total_agents}</p>
              </div>
              <Brain className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold text-green-600">{networkStats.active_agents}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platforms</p>
                <p className="text-2xl font-bold">{networkStats.platforms_covered}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Threats (24h)</p>
                <p className="text-2xl font-bold text-orange-600">{networkStats.threats_detected_24h}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{Math.round(networkStats.detection_accuracy)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response</p>
                <p className="text-2xl font-bold">&lt;30s</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Active Agents</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
        </TabsList>

        {/* Active Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployed AI Agents</CardTitle>
              <CardDescription>
                Autonomous agents monitoring platforms in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length > 0 ? (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getAgentStatusIcon(agent.status)}
                        <div>
                          <h4 className="font-medium">{agent.platform_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Scan Frequency: {agent.scan_frequency}min | 
                            Last Scan: {agent.last_scan ? new Date(agent.last_scan).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.threats_detected} threats</p>
                          <p className="text-xs text-muted-foreground">{Math.round(agent.success_rate)}% accuracy</p>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Agents Deployed</h3>
                  <p className="text-muted-foreground mb-4">
                    Deploy AI agents to start autonomous monitoring
                  </p>
                  <Button onClick={deployAgents} disabled={!hasFeature('advanced_ai')}>
                    Deploy Your First Agent
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Detection Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Threat Detections</CardTitle>
              <CardDescription>
                Real-time threat alerts from your AI agent network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentThreats.length > 0 ? (
                <div className="space-y-3">
                  {recentThreats.map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          threat.threat_level === 'critical' ? 'text-red-500' :
                          threat.threat_level === 'high' ? 'text-orange-500' :
                          threat.threat_level === 'medium' ? 'text-yellow-500' : 'text-gray-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">{threat.platform}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(threat.detected_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(threat.confidence_score * 100)}% confidence</p>
                        </div>
                        <Badge variant={getThreatLevelBadgeVariant(threat.threat_level) as any}>
                          {threat.threat_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Threats Detected</h3>
                  <p className="text-muted-foreground">
                    Your AI agents are actively monitoring and will alert you of any threats
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Configure your AI agent network settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div>
                <Label className="text-base font-medium">Monitoring Platforms</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select platforms for autonomous monitoring
                </p>
                <div className="space-y-4">
                  {Object.entries(getPlatformsByCategory()).map(([category, platforms]) => (
                    <div key={category}>
                      <h4 className="font-medium mb-2">{category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {platforms.map((platform) => (
                          <div key={platform.id} className="flex items-center space-x-2">
                            <Switch
                              id={platform.id}
                              checked={agentConfig.platforms.includes(platform.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAgentConfig(prev => ({
                                    ...prev,
                                    platforms: [...prev.platforms, platform.id]
                                  }));
                                } else {
                                  setAgentConfig(prev => ({
                                    ...prev,
                                    platforms: prev.platforms.filter(p => p !== platform.id)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={platform.id} className="text-sm">
                              {platform.name}
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {platform.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monitoring Frequency */}
              <div>
                <Label className="text-base font-medium">Monitoring Frequency</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  How often agents scan platforms (in minutes)
                </p>
                <Slider
                  value={[agentConfig.monitoring_frequency]}
                  onValueChange={(value) => setAgentConfig(prev => ({ ...prev, monitoring_frequency: value[0] }))}
                  max={1440}
                  min={15}
                  step={15}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Current: {agentConfig.monitoring_frequency} minutes
                </p>
              </div>

              {/* Threat Threshold */}
              <div>
                <Label className="text-base font-medium">Threat Detection Threshold</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Minimum confidence level for threat alerts
                </p>
                <Slider
                  value={[agentConfig.threat_threshold * 100]}
                  onValueChange={(value) => setAgentConfig(prev => ({ ...prev, threat_threshold: value[0] / 100 }))}
                  max={100}
                  min={10}
                  step={5}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Current: {Math.round(agentConfig.threat_threshold * 100)}% confidence
                </p>
              </div>

              {/* Auto Response */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Automatic Response</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate automated legal responses for high-threat detections
                  </p>
                </div>
                <Switch
                  checked={agentConfig.auto_response_enabled}
                  onCheckedChange={(checked) => setAgentConfig(prev => ({ ...prev, auto_response_enabled: checked }))}
                />
              </div>

              {/* Predictive Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Predictive Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered threat prediction and pattern recognition
                  </p>
                </div>
                <Switch
                  checked={agentConfig.predictive_analytics}
                  onCheckedChange={(checked) => setAgentConfig(prev => ({ ...prev, predictive_analytics: checked }))}
                />
              </div>

              <Button onClick={deployAgents} className="w-full" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Apply Configuration & Deploy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence Dashboard</CardTitle>
              <CardDescription>
                AI-powered insights and predictive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Intelligence Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Deploy agents to generate comprehensive threat intelligence reports
                </p>
                <Button onClick={getThreatIntelligence} variant="outline">
                  Generate Intelligence Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};