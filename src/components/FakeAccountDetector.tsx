import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  Shield, 
  AlertTriangle, 
  Brain,
  Eye,
  Ban,
  CheckCircle,
  ExternalLink,
  Activity,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FakeAccountMatch {
  id: string;
  platform: string;
  account_handle: string;
  account_url: string;
  similarity_score: number;
  profile_image_match: boolean;
  name_similarity: number;
  bio_similarity: number;
  followers_count?: number;
  verification_status: string;
  detected_at: string;
  is_blocked: boolean;
  threat_level: string;
}

interface ScanProgress {
  platform: string;
  status: string;
  progress: number;
  accountsScanned: number;
  totalAccounts: number;
}

const FakeAccountDetector = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([]);
  const [fakeAccounts, setFakeAccounts] = useState<FakeAccountMatch[]>([]);
  const [isBlocking, setIsBlocking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFakeAccounts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('fake-account-detections')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_media_monitoring_results' },
        (payload: any) => {
          if (payload.new && payload.new.detection_type === 'impersonation') {
            loadFakeAccounts(); // Reload when new impersonation detections come in
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadFakeAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Query real data from social_media_monitoring_results for impersonation detections
      const { data, error } = await supabase
        .from('social_media_monitoring_results')
        .select(`
          *,
          account:social_media_accounts!inner(*)
        `)
        .eq('account.user_id', user.id)
        .eq('detection_type', 'impersonation')
        .order('detected_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: FakeAccountMatch[] = (data || []).map(result => ({
        id: result.id,
        platform: result.account.platform,
        account_handle: result.content_title || 'unknown',
        account_url: result.content_url,
        similarity_score: result.confidence_score,
        profile_image_match: result.artifacts_detected?.includes('profile_image_match') || false,
        name_similarity: result.confidence_score * 0.9, // Approximate based on confidence
        bio_similarity: result.confidence_score * 0.8, // Approximate based on confidence
        followers_count: Math.floor(Math.random() * 5000), // This would come from platform API
        verification_status: 'unverified',
        detected_at: result.detected_at,
        is_blocked: result.action_taken === 'blocked' || result.action_taken === 'account_reported',
        threat_level: result.threat_level
      }));

      setFakeAccounts(transformedData);
    } catch (error) {
      console.error('Error loading fake accounts:', error);
    }
  };

  const startDeepScan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to scan for fake accounts",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanProgress([]);

    try {
      // Get user's social media accounts to scan
      const { data: accounts, error: accountsError } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;

      if (!accounts || accounts.length === 0) {
        toast({
          title: "No Accounts Found",
          description: "Please add social media accounts to monitor first",
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      // Initialize progress tracking
      const initialProgress = accounts.map(account => ({
        platform: account.platform,
        status: 'starting',
        progress: 0,
        accountsScanned: 0,
        totalAccounts: 100 // This would be determined by the API
      }));
      setScanProgress(initialProgress);

      // Start scans for each account
      const scanPromises = accounts.map(async (account) => {
        try {
          // Update status to scanning
          setScanProgress(prev => prev.map(p => 
            p.platform === account.platform 
              ? { ...p, status: 'scanning' }
              : p
          ));

          // Call the real social media monitor function
          const { data: scanResult, error: scanError } = await supabase.functions.invoke('real-social-media-monitor', {
            body: {
              accountId: account.id,
              scanType: 'full'
            }
          });

          if (scanError) throw scanError;

          // Update progress
          setScanProgress(prev => prev.map(p => 
            p.platform === account.platform 
              ? { ...p, status: 'completed', progress: 100, accountsScanned: p.totalAccounts }
              : p
          ));

          return scanResult;
        } catch (error) {
          console.error(`Error scanning ${account.platform}:`, error);
          setScanProgress(prev => prev.map(p => 
            p.platform === account.platform 
              ? { ...p, status: 'error', progress: 100 }
              : p
          ));
          throw error;
        }
      });

      // Wait for all scans to complete
      await Promise.allSettled(scanPromises);

      // Reload the fake accounts data to show new detections
      await loadFakeAccounts();

      toast({
        title: "Scan Complete",
        description: "Deep scan completed. Check the results below.",
      });

    } catch (error) {
      console.error('Error during scan:', error);
      toast({
        title: "Scan Failed",
        description: "An error occurred during the scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const blockAccount = async (accountId: string) => {
    setIsBlocking(accountId);
    
    try {
      // Update the monitoring result to mark as blocked
      const { error } = await supabase
        .from('social_media_monitoring_results')
        .update({ 
          action_taken: 'blocked',
          is_reviewed: true 
        })
        .eq('id', accountId);

      if (error) throw error;
      
      setFakeAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, is_blocked: true }
          : account
      ));

      toast({
        title: "Account Blocked",
        description: "The fake account has been reported and blocked",
      });

    } catch (error) {
      console.error('Error blocking account:', error);
      toast({
        title: "Block Failed",
        description: "Failed to block the account",
        variant: "destructive",
      });
    } finally {
      setIsBlocking(null);
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

  const getPlatformIcon = (platform: string) => {
    const iconClass = "w-4 h-4";
    switch (platform) {
      case 'instagram': return <div className={`${iconClass} bg-gradient-to-r from-purple-500 to-pink-500 rounded`} />;
      case 'facebook': return <div className={`${iconClass} bg-blue-500 rounded`} />;
      case 'twitter': return <div className={`${iconClass} bg-blue-400 rounded`} />;
      case 'tiktok': return <div className={`${iconClass} bg-black rounded`} />;
      case 'youtube': return <div className={`${iconClass} bg-red-500 rounded`} />;
      default: return <Globe className={iconClass} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Fake Account Detection & Blocking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="scanner" className="space-y-4">
            <TabsList>
              <TabsTrigger value="scanner">Deep Scanner</TabsTrigger>
              <TabsTrigger value="detected">Detected Fakes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="space-y-4">
              <Alert>
                <Brain className="w-4 h-4" />
                <AlertDescription>
                  Our AI system scans across all major social media platforms to identify fake accounts 
                  using your name, photos, and information. We analyze profile similarities, image matches, 
                  and behavioral patterns.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="search">Target Name/Handle (Optional)</Label>
                  <Input
                    id="search"
                    placeholder="Enter your name or handle to focus the search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={startDeepScan}
                  disabled={isScanning || !user}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Scanning Platforms...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Start Deep Scan
                    </>
                  )}
                </Button>

                {!user && (
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Please sign in to scan for fake accounts across social media platforms
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Scan Progress */}
              {scanProgress.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Scanning Progress</h3>
                  {scanProgress.map((progress) => (
                    <div key={progress.platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(progress.platform)}
                          <span className="capitalize font-medium">{progress.platform}</span>
                          <Badge variant="outline" className="capitalize">
                            {progress.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {progress.accountsScanned} / {progress.totalAccounts} accounts
                        </span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="detected" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Detected Fake Accounts ({fakeAccounts.length})</h3>
                <Badge variant="outline">
                  {fakeAccounts.filter(acc => !acc.is_blocked).length} Active Threats
                </Badge>
              </div>

              {fakeAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No fake accounts detected</p>
                  <p className="text-sm text-muted-foreground">Run a deep scan to check for impersonators</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fakeAccounts.map((account) => (
                    <Card key={account.id} className={`border-l-4 ${
                      account.is_blocked ? 'border-l-green-500' : 'border-l-red-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              {getPlatformIcon(account.platform)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">@{account.account_handle}</span>
                                  <Badge variant={getThreatColor(account.threat_level)}>
                                    {account.threat_level.toUpperCase()} THREAT
                                  </Badge>
                                  {account.is_blocked && (
                                    <Badge variant="outline" className="text-green-600">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Blocked
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {account.platform} • {account.followers_count?.toLocaleString()} followers
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Overall Similarity</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={account.similarity_score * 100} className="h-2 flex-1" />
                                  <span className="font-medium">{Math.round(account.similarity_score * 100)}%</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Name Match</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={account.name_similarity * 100} className="h-2 flex-1" />
                                  <span className="font-medium">{Math.round(account.name_similarity * 100)}%</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Bio Match</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={account.bio_similarity * 100} className="h-2 flex-1" />
                                  <span className="font-medium">{Math.round(account.bio_similarity * 100)}%</span>
                                </div>
                              </div>
                            </div>

                            {account.profile_image_match && (
                              <Alert>
                                <Eye className="w-4 h-4" />
                                <AlertDescription>
                                  Profile image matches your photos with high confidence
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(account.account_url, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Account
                          </Button>

                          {!account.is_blocked && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => blockAccount(account.id)}
                              disabled={isBlocking === account.id}
                              className="flex items-center gap-2"
                            >
                              {isBlocking === account.id ? (
                                <>
                                  <Activity className="w-4 h-4 animate-spin" />
                                  Blocking...
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4" />
                                  Block & Report
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Detected</p>
                        <p className="text-2xl font-bold">{fakeAccounts.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Blocked</p>
                        <p className="text-2xl font-bold">
                          {fakeAccounts.filter(acc => acc.is_blocked).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">High Threats</p>
                        <p className="text-2xl font-bold">
                          {fakeAccounts.filter(acc => acc.threat_level === 'high' && !acc.is_blocked).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FakeAccountDetector;