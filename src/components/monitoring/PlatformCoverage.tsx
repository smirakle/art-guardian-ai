import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Plus, Settings, Facebook, Instagram, Youtube, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SocialAccount {
  id: string;
  platform: string;
  account_handle: string;
  account_name: string | null;
  verification_status: string;
  last_scan_at: string | null;
  scan_count: number;
  detection_count: number;
  coverage: number;
  protection: string[];
}

const PlatformCoverage = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({ platform: "", username: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const platformIcons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    tiktok: Globe,
    youtube: Youtube,
    twitter: Globe,
  };

  // Load real accounts from DB
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: dbAccounts, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // For each account, get scan stats
      const enriched: SocialAccount[] = await Promise.all(
        (dbAccounts || []).map(async (acc: any) => {
          const { count: scanCount } = await supabase
            .from('social_media_scans')
            .select('*', { count: 'exact', head: true })
            .eq('account_id', acc.id);

          const { count: detectionCount } = await supabase
            .from('social_media_monitoring_results')
            .select('*', { count: 'exact', head: true })
            .eq('account_id', acc.id);

          // Coverage = verified + has scans = high coverage
          const coverage = acc.verification_status === 'verified'
            ? Math.min(100, 60 + (scanCount || 0) * 5)
            : (scanCount || 0) > 0 ? 50 : 0;

          return {
            id: acc.id,
            platform: acc.platform,
            account_handle: acc.account_handle,
            account_name: acc.account_name,
            verification_status: acc.verification_status || 'pending',
            last_scan_at: acc.last_scan_at,
            scan_count: scanCount || 0,
            detection_count: detectionCount || 0,
            coverage,
            protection: ['deepfake', 'copyright'],
          };
        })
      );

      setAccounts(enriched);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      toast({ title: "Error", description: "Failed to load social media accounts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async () => {
    if (!newAccount.platform || !newAccount.username) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Error", description: "Please sign in first", variant: "destructive" }); return; }

      const { error } = await supabase.from('social_media_accounts').insert({
        user_id: user.id,
        platform: newAccount.platform.toLowerCase(),
        account_handle: newAccount.username.replace('@', ''),
        account_name: newAccount.username,
        account_url: `https://${newAccount.platform.toLowerCase()}.com/${newAccount.username.replace('@', '')}`,
        verification_status: 'pending',
      });

      if (error) throw error;

      setNewAccount({ platform: "", username: "" });
      setIsDialogOpen(false);
      toast({ title: "Account Added", description: `${newAccount.platform} account monitoring configured.` });
      loadAccounts();
    } catch (err: any) {
      console.error('Failed to add account:', err);
      toast({ title: "Error", description: err.message || "Failed to add account", variant: "destructive" });
    }
  };

  const runScan = async (accountId: string) => {
    setScanningId(accountId);
    try {
      const { data, error } = await supabase.functions.invoke('real-social-media-monitor', {
        body: { accountId, scanType: 'full' }
      });

      if (error) throw error;

      toast({
        title: "Scan Complete",
        description: `Scanned ${data.contentScanned} items, found ${data.detectionsFound} violations.`,
      });
      loadAccounts();
    } catch (err: any) {
      console.error('Scan failed:', err);
      toast({ title: "Scan Failed", description: err.message || "Monitoring scan failed", variant: "destructive" });
    } finally {
      setScanningId(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform.toLowerCase()] || Globe;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Social Media Protection
            </CardTitle>
            <CardDescription>
              Real-time monitoring via SerpAPI + AI threat classification
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Media Account</DialogTitle>
                <DialogDescription>
                  Configure real monitoring for your social media accounts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    className="w-full mt-1 p-2 border rounded-md bg-background text-foreground"
                    value={newAccount.platform}
                    onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                  >
                    <option value="">Select Platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter/X</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="username">Username/Handle</Label>
                  <Input
                    id="username"
                    placeholder="@your_username"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Protection Types</Label>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Deepfake Detection</Badge>
                    <Badge variant="secondary">Copyright Monitoring</Badge>
                  </div>
                </div>
                <Button onClick={addAccount} className="w-full">
                  Start Monitoring
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading accounts...
          </div>
        ) : accounts.length > 0 ? (
          accounts.map((account) => (
            <div key={account.id} className="space-y-2 p-3 rounded-lg bg-muted/30">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(account.platform)}
                  <div>
                    <span className="text-sm font-medium capitalize">{account.platform}</span>
                    <p className="text-xs text-muted-foreground">@{account.account_handle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">{account.scan_count} scans</span>
                  {account.detection_count > 0 && (
                    <p className="text-xs text-destructive font-medium">{account.detection_count} violations</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {account.protection.includes("deepfake") && (
                      <Badge variant="outline" className="text-xs">Deepfake</Badge>
                    )}
                    {account.protection.includes("copyright") && (
                      <Badge variant="outline" className="text-xs">Copyright</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Progress value={account.coverage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Coverage: {account.coverage}%</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    disabled={scanningId === account.id}
                    onClick={() => runScan(account.id)}
                  >
                    {scanningId === account.id ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Scanning...</>
                    ) : (
                      <><RefreshCw className="w-3 h-3 mr-1" />Scan Now</>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
              {account.last_scan_at && (
                <p className="text-xs text-muted-foreground">
                  Last scan: {new Date(account.last_scan_at).toLocaleString()}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-6">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No accounts configured yet</p>
            <p className="text-xs">Add your social media accounts to start real monitoring</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformCoverage;
