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
    }
  }, [user]);

  const loadFakeAccounts = async () => {
    try {
      // This would load from a fake_account_matches table in a real implementation
      // For now, we'll use mock data
      const mockData: FakeAccountMatch[] = [
        {
          id: '1',
          platform: 'instagram',
          account_handle: 'john_doe_artist',
          account_url: 'https://instagram.com/john_doe_artist',
          similarity_score: 0.89,
          profile_image_match: true,
          name_similarity: 0.95,
          bio_similarity: 0.78,
          followers_count: 1250,
          verification_status: 'unverified',
          detected_at: new Date().toISOString(),
          is_blocked: false,
          threat_level: 'high'
        },
        {
          id: '2',
          platform: 'facebook',
          account_handle: 'john.doe.official',
          account_url: 'https://facebook.com/john.doe.official',
          similarity_score: 0.76,
          profile_image_match: false,
          name_similarity: 0.88,
          bio_similarity: 0.65,
          followers_count: 890,
          verification_status: 'unverified',
          detected_at: new Date().toISOString(),
          is_blocked: false,
          threat_level: 'medium'
        }
      ];
      setFakeAccounts(mockData);
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

    const platforms = ['instagram', 'facebook', 'twitter', 'tiktok', 'youtube'];
    
    try {
      // Initialize progress for each platform
      const initialProgress = platforms.map(platform => ({
        platform,
        status: 'starting',
        progress: 0,
        accountsScanned: 0,
        totalAccounts: Math.floor(Math.random() * 1000) + 500
      }));
      setScanProgress(initialProgress);

      // Simulate scanning progress
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        
        // Update status to scanning
        setScanProgress(prev => prev.map(p => 
          p.platform === platform 
            ? { ...p, status: 'scanning' }
            : p
        ));

        // Simulate progressive scanning
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setScanProgress(prev => prev.map(p => 
            p.platform === platform 
              ? { 
                  ...p, 
                  progress,
                  accountsScanned: Math.floor((progress / 100) * p.totalAccounts)
                }
              : p
          ));
        }

        // Mark as completed
        setScanProgress(prev => prev.map(p => 
          p.platform === platform 
            ? { ...p, status: 'completed' }
            : p
        ));
      }

      // Simulate discovering new fake accounts
      const newFakeAccount: FakeAccountMatch = {
        id: `new-${Date.now()}`,
        platform: 'twitter',
        account_handle: 'johndoe_art',
        account_url: 'https://twitter.com/johndoe_art',
        similarity_score: 0.82,
        profile_image_match: true,
        name_similarity: 0.90,
        bio_similarity: 0.74,
        followers_count: 2100,
        verification_status: 'unverified',
        detected_at: new Date().toISOString(),
        is_blocked: false,
        threat_level: 'high'
      };

      setFakeAccounts(prev => [newFakeAccount, ...prev]);

      toast({
        title: "Scan Complete",
        description: "Deep scan completed. New fake accounts detected.",
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
      // In a real implementation, this would call an API to block the account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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