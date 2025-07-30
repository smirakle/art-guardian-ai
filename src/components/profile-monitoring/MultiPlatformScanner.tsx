import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Pause, RefreshCw, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ScanResult {
  id: string;
  platform: string;
  profile_url: string;
  profile_username: string;
  profile_name: string;
  similarity_score: number;
  confidence_score: number;
  risk_level: string;
  detected_issues: string[];
  is_verified: boolean;
  detected_at: string;
}

interface Platform {
  id: string;
  platform_name: string;
  platform_category: string;
  is_enabled: boolean;
  features: any;
}

interface MonitoringTarget {
  id: string;
  target_name: string;
  monitoring_enabled: boolean;
}

interface ScanProgress {
  platform: string;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  progress: number;
  results_found: number;
}

export const MultiPlatformScanner: React.FC = () => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<MonitoringTarget[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load targets
      const { data: targetsData } = await supabase
        .from('profile_monitoring_targets')
        .select('id, target_name, monitoring_enabled')
        .eq('user_id', user?.id)
        .eq('monitoring_enabled', true);

      // Load platforms
      const { data: platformsData } = await supabase
        .from('monitored_platforms')
        .select('*')
        .eq('is_enabled', true)
        .order('platform_name');

      // Load recent scan results
      const { data: resultsData } = await supabase
        .from('profile_scan_results')
        .select(`
          *,
          profile_monitoring_targets!inner(user_id)
        `)
        .eq('profile_monitoring_targets.user_id', user?.id)
        .order('detected_at', { ascending: false })
        .limit(50);

      setTargets(targetsData || []);
      setPlatforms(platformsData || []);
      setScanResults(resultsData || []);

      // Initialize selected platforms to all enabled platforms
      if (platformsData && selectedPlatforms.length === 0) {
        setSelectedPlatforms(platformsData.map(p => p.platform_name));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load scanner data');
    } finally {
      setLoading(false);
    }
  };

  const startComprehensiveScan = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target to scan');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform to scan');
      return;
    }

    setIsScanning(true);
    
    // Initialize scan progress
    const initialProgress = selectedPlatforms.map(platform => ({
      platform,
      status: 'pending' as const,
      progress: 0,
      results_found: 0
    }));
    setScanProgress(initialProgress);

    try {
      const { error } = await supabase.functions.invoke('comprehensive-profile-monitor', {
        body: {
          targetId: selectedTarget,
          platforms: selectedPlatforms,
          action: 'comprehensive_scan'
        }
      });

      if (error) throw error;
      
      toast.success('Comprehensive scan started');
      
      // Simulate scan progress updates
      simulateScanProgress();
    } catch (error) {
      console.error('Error starting scan:', error);
      toast.error('Failed to start comprehensive scan');
      setIsScanning(false);
    }
  };

  const simulateScanProgress = () => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const updated = prev.map(platform => {
          if (platform.status === 'pending') {
            return { ...platform, status: 'scanning' as const };
          } else if (platform.status === 'scanning' && platform.progress < 100) {
            const newProgress = Math.min(platform.progress + Math.random() * 20, 100);
            return {
              ...platform,
              progress: newProgress,
              results_found: Math.floor(newProgress / 25),
              status: newProgress >= 100 ? 'completed' as const : 'scanning' as const
            };
          }
          return platform;
        });

        // Check if all scans are completed
        if (updated.every(p => p.status === 'completed')) {
          setIsScanning(false);
          loadData(); // Reload results
          clearInterval(interval);
        }

        return updated;
      });
    }, 1000);

    // Auto-complete after 30 seconds
    setTimeout(() => {
      setIsScanning(false);
      clearInterval(interval);
      loadData();
    }, 30000);
  };

  const stopScan = () => {
    setIsScanning(false);
    setScanProgress([]);
    toast.info('Scan stopped');
  };

  const platformCategories = platforms.reduce((acc, platform) => {
    if (!acc[platform.platform_category]) {
      acc[platform.platform_category] = [];
    }
    acc[platform.platform_category].push(platform);
    return acc;
  }, {} as Record<string, Platform[]>);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanning':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Multi-Platform Scanner</h2>
        <p className="text-muted-foreground">Comprehensive identity monitoring across all platforms</p>
      </div>

      {/* Scan Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Configuration</CardTitle>
          <CardDescription>Configure and start a comprehensive profile scan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Target</label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a monitoring target" />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.target_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Type</label>
              <Select defaultValue="comprehensive">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Scan</SelectItem>
                  <SelectItem value="quick">Quick Scan</SelectItem>
                  <SelectItem value="deep">Deep Web Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Platforms</label>
            <div className="space-y-2">
              {Object.entries(platformCategories).map(([category, categoryPlatforms]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium capitalize">{category.replace('_', ' ')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categoryPlatforms.map((platform) => (
                      <label key={platform.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.platform_name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlatforms(prev => [...prev, platform.platform_name]);
                            } else {
                              setSelectedPlatforms(prev => prev.filter(p => p !== platform.platform_name));
                            }
                          }}
                        />
                        <span className="text-sm">{platform.platform_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlatforms(platforms.map(p => p.platform_name))}
              disabled={isScanning}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlatforms([])}
              disabled={isScanning}
            >
              Clear All
            </Button>
            {!isScanning ? (
              <Button onClick={startComprehensiveScan} disabled={!selectedTarget}>
                <Play className="w-4 h-4 mr-2" />
                Start Scan
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopScan}>
                <Pause className="w-4 h-4 mr-2" />
                Stop Scan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      {isScanning && scanProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Scan in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanProgress.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(platform.status)}
                      <span className="font-medium">{platform.platform}</span>
                      <Badge variant="outline">
                        {platform.results_found} results
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(platform.progress)}%
                    </span>
                  </div>
                  <Progress value={platform.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Results</CardTitle>
          <CardDescription>Latest profile matches found across all platforms</CardDescription>
        </CardHeader>
        <CardContent>
          {scanResults.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No scan results found</p>
              <p className="text-sm text-muted-foreground">Start a scan to see results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scanResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{result.platform}</Badge>
                      <span className="font-medium">{result.profile_username || result.profile_name}</span>
                      <Badge variant={result.risk_level === 'high' ? 'destructive' : 'secondary'}>
                        {result.risk_level} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Similarity: {Math.round(result.similarity_score)}% • 
                      Confidence: {Math.round(result.confidence_score)}%
                    </p>
                    {result.detected_issues.length > 0 && (
                      <p className="text-sm text-red-500">
                        Issues: {result.detected_issues.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={result.profile_url} target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};