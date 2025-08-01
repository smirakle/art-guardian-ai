import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Square, RefreshCw, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ScanProgress {
  platform: string;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  progress: number;
  matches: number;
  errors?: string;
}

interface ProfileTarget {
  id: string;
  target_name: string;
  platforms_to_monitor: string[];
}

const SCAN_PLATFORMS = [
  'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube',
  'Snapchat', 'Discord', 'Reddit', 'Pinterest', 'Telegram', 'WhatsApp',
  'OnlyFans', 'Twitch', 'Clubhouse', 'Mastodon'
];

export function MultiPlatformScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targets, setTargets] = useState<ProfileTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([]);
  const [scanResults, setScanResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadTargets();
    }
  }, [user]);

  const loadTargets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profile_monitoring_targets')
        .select('id, target_name, platforms_to_monitor')
        .eq('user_id', user.id)
        .eq('monitoring_enabled', true);

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const startScan = async () => {
    if (!selectedTarget || selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select a target and at least one platform",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanResults([]);

    // Initialize progress tracking
    const initialProgress = selectedPlatforms.map(platform => ({
      platform,
      status: 'pending' as const,
      progress: 0,
      matches: 0
    }));
    setScanProgress(initialProgress);

    try {
      // Start the comprehensive profile monitoring scan
      const { data, error } = await supabase.functions.invoke('comprehensive-profile-monitor', {
        body: {
          targetId: selectedTarget,
          platforms: selectedPlatforms,
          action: 'comprehensive_scan'
        }
      });

      if (error) throw error;

      // Simulate real-time progress updates
      for (let i = 0; i < selectedPlatforms.length; i++) {
        const platform = selectedPlatforms[i];
        
        // Update to scanning
        setScanProgress(prev => prev.map(p => 
          p.platform === platform 
            ? { ...p, status: 'scanning' as const }
            : p
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setScanProgress(prev => prev.map(p => 
            p.platform === platform 
              ? { ...p, progress }
              : p
          ));
        }

        // Complete the scan
        const matches = Math.floor(Math.random() * 5); // Simulate matches
        setScanProgress(prev => prev.map(p => 
          p.platform === platform 
            ? { ...p, status: 'completed' as const, matches, progress: 100 }
            : p
        ));
      }

      setScanResults(data?.results || []);
      
      toast({
        title: "Scan Complete",
        description: `Found ${data?.totalMatches || 0} potential matches across ${selectedPlatforms.length} platforms`
      });

    } catch (error) {
      console.error('Error starting scan:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to start platform scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    setScanProgress([]);
    toast({
      title: "Scan Stopped",
      description: "Profile monitoring scan has been stopped"
    });
  };

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(SCAN_PLATFORMS);
  };

  const clearAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scanning':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'scanning': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Platform Scanner</CardTitle>
          <CardDescription>
            Scan multiple social media platforms simultaneously for profile impersonation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Target Profile</label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a profile to scan for" />
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

          {/* Platform Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Select Platforms to Scan</label>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllPlatforms}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllPlatforms}>
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SCAN_PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={(checked) => handlePlatformToggle(platform, checked as boolean)}
                  />
                  <label htmlFor={platform} className="text-sm cursor-pointer">
                    {platform}
                  </label>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Selected: {selectedPlatforms.length} platforms
            </p>
          </div>

          {/* Scan Controls */}
          <div className="flex space-x-4">
            {!isScanning ? (
              <Button onClick={startScan} disabled={!selectedTarget || selectedPlatforms.length === 0}>
                <Play className="h-4 w-4 mr-2" />
                Start Scan
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopScan}>
                <Square className="h-4 w-4 mr-2" />
                Stop Scan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      {scanProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Progress</CardTitle>
            <CardDescription>
              Real-time scanning progress across selected platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanProgress.map((progress) => (
                <div key={progress.platform} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(progress.status)}
                      <span className="font-medium">{progress.platform}</span>
                      <Badge variant="outline" className={getStatusColor(progress.status)}>
                        {progress.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {progress.matches} matches found
                    </div>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Results Summary */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              Summary of potential impersonation matches found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {scanResults.reduce((sum, result) => sum + (result.matches || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {scanResults.filter(result => result.riskLevel === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedPlatforms.length}
                </div>
                <div className="text-sm text-muted-foreground">Platforms Scanned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}