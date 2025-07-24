import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Activity,
  Youtube,
  Facebook,
  Instagram,
  Zap,
  Eye,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SocialMediaAccount {
  id: string;
  platform: string;
  account_handle: string;
  account_url: string;
  account_name?: string;
  follower_count?: number;
  verification_status: string;
  monitoring_enabled: boolean;
  last_scan_at?: string;
  created_at: string;
}

interface ScanResult {
  id: string;
  account_id: string;
  scan_type: string;
  status: string;
  content_scanned: number;
  detections_found: number;
  started_at: string;
  completed_at?: string;
}

const SocialMediaAccountManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: '',
    account_handle: '',
    account_url: ''
  });
  const [isScanning, setIsScanning] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAccounts();
      loadScans();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    const accountsChannel = supabase
      .channel('social-media-accounts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_media_accounts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAccounts(prev => [...prev, payload.new as SocialMediaAccount]);
          } else if (payload.eventType === 'UPDATE') {
            setAccounts(prev => prev.map(acc => 
              acc.id === payload.new.id ? payload.new as SocialMediaAccount : acc
            ));
          } else if (payload.eventType === 'DELETE') {
            setAccounts(prev => prev.filter(acc => acc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const scansChannel = supabase
      .channel('social-media-scans-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_media_scans' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setScans(prev => [...prev, payload.new as ScanResult]);
          } else if (payload.eventType === 'UPDATE') {
            setScans(prev => prev.map(scan => 
              scan.id === payload.new.id ? payload.new as ScanResult : scan
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accountsChannel);
      supabase.removeChannel(scansChannel);
    };
  };

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_scans')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const validateSocialMediaUrl = (platform: string, url: string): boolean => {
    const patterns = {
      youtube: /^https?:\/\/(www\.)?(youtube\.com\/(channel\/|c\/|user\/|@)|youtu\.be\/)/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\//,
      instagram: /^https?:\/\/(www\.)?instagram\.com\//,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@/
    };

    return patterns[platform as keyof typeof patterns]?.test(url) || false;
  };

  const extractAccountHandle = (platform: string, url: string): string => {
    try {
      const urlObj = new URL(url);
      switch (platform) {
        case 'youtube':
          const match = url.match(/@([^/?]+)|\/c\/([^/?]+)|\/channel\/([^/?]+)|\/user\/([^/?]+)/);
          return match ? (match[1] || match[2] || match[3] || match[4]) : '';
        case 'facebook':
          return urlObj.pathname.split('/')[1] || '';
        case 'instagram':
          return urlObj.pathname.split('/')[1] || '';
        case 'tiktok':
          return urlObj.pathname.replace('/@', '').split('/')[0] || '';
        default:
          return '';
      }
    } catch {
      return '';
    }
  };

  const addAccount = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add social media accounts",
        variant: "destructive",
      });
      return;
    }

    if (!newAccount.platform || !newAccount.account_url) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and enter the account URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateSocialMediaUrl(newAccount.platform, newAccount.account_url)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${newAccount.platform} URL`,
        variant: "destructive",
      });
      return;
    }

    const handle = extractAccountHandle(newAccount.platform, newAccount.account_url);
    if (!handle) {
      toast({
        title: "Invalid URL",
        description: "Could not extract account handle from URL",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAccount(true);

    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .insert({
          user_id: user.id,
          platform: newAccount.platform,
          account_handle: handle,
          account_url: newAccount.account_url,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setNewAccount({ platform: '', account_handle: '', account_url: '' });
      
      toast({
        title: "Account Added",
        description: `${newAccount.platform} account added successfully`,
      });

      // Start initial verification scan
      startMonitoring(data.id);

    } catch (error: any) {
      console.error('Error adding account:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Account Already Added",
          description: "This account is already being monitored",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Add Account",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingAccount(false);
    }
  };

  const startMonitoring = async (accountId: string) => {
    setIsScanning(accountId);
    
    try {
      const { data, error } = await supabase.functions.invoke('social-media-monitor', {
        body: {
          accountId,
          scanType: 'full'
        }
      });

      if (error) throw error;

      toast({
        title: "Monitoring Started",
        description: "Real-time monitoring has begun for this account",
      });

    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast({
        title: "Monitoring Failed",
        description: "Failed to start monitoring. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(null);
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_media_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Removed",
        description: "Social media account has been removed from monitoring",
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to remove account",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'tiktok': return <div className="w-5 h-5 bg-black rounded text-white text-xs flex items-center justify-center">T</div>;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-500">Verified</Badge>;
      case 'pending': return <Badge variant="outline">Verifying</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Account Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Social Media Account
          </CardTitle>
          <CardDescription>
            Monitor YouTube, Facebook, Instagram, and TikTok accounts for deepfakes and copyright violations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select 
                value={newAccount.platform} 
                onValueChange={(value) => setNewAccount(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="account_url">Account URL</Label>
              <Input
                id="account_url"
                placeholder="https://www.youtube.com/@channelname"
                value={newAccount.account_url}
                onChange={(e) => setNewAccount(prev => ({ ...prev, account_url: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            onClick={addAccount} 
            disabled={isAddingAccount || !user}
            className="flex items-center gap-2"
          >
            {isAddingAccount ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Adding Account...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Account
              </>
            )}
          </Button>

          {!user && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Please sign in to add and monitor social media accounts
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Account List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitored Accounts ({accounts.length})
          </CardTitle>
          <CardDescription>
            Social media accounts under active monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No accounts being monitored</p>
              <p className="text-sm text-muted-foreground">Add your first social media account above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                const accountScan = scans.find(s => s.account_id === account.id && s.status === 'running');
                
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getPlatformIcon(account.platform)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">@{account.account_handle}</span>
                          {getStatusBadge(account.verification_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                          {account.last_scan_at && (
                            <span> • Last scan: {new Date(account.last_scan_at).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {accountScan && (
                        <div className="flex items-center gap-2 mr-4">
                          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                          <span className="text-sm text-green-600">Scanning...</span>
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startMonitoring(account.id)}
                        disabled={isScanning === account.id || !!accountScan}
                        className="flex items-center gap-2"
                      >
                        {isScanning === account.id ? (
                          <>
                            <Activity className="w-4 h-4 animate-spin" />
                            Scanning
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Scan Now
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAccount(account.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {scans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scans.slice(0, 5).map((scan) => {
                const account = accounts.find(a => a.id === scan.account_id);
                
                return (
                  <div key={scan.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {account && getPlatformIcon(account.platform)}
                      <div>
                        <span className="font-medium">@{account?.account_handle}</span>
                        <p className="text-sm text-muted-foreground">
                          {scan.scan_type} scan • {scan.content_scanned} items scanned
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {scan.detections_found > 0 && (
                        <Badge variant="destructive">
                          {scan.detections_found} detections
                        </Badge>
                      )}
                      
                      <Badge variant={
                        scan.status === 'completed' ? 'default' :
                        scan.status === 'running' ? 'secondary' :
                        scan.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {scan.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialMediaAccountManager;