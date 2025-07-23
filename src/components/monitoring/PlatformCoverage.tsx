import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Plus, Settings, Facebook, Instagram, Youtube } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PlatformCoverage = () => {
  const [accounts, setAccounts] = useState([
    { platform: "Instagram", username: "@example_artist", coverage: 98, scans: 1247, protection: ["deepfake", "copyright"] },
    { platform: "Facebook", username: "Artist Page", coverage: 95, scans: 892, protection: ["deepfake", "copyright"] },
    { platform: "TikTok", username: "@artist_creator", coverage: 91, scans: 654, protection: ["deepfake", "copyright"] },
    { platform: "YouTube", username: "Artist Channel", coverage: 88, scans: 423, protection: ["deepfake", "copyright"] }
  ]);
  
  const [newAccount, setNewAccount] = useState({ platform: "", username: "", protection: ["deepfake", "copyright"] });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const platformIcons = {
    Instagram: Instagram,
    Facebook: Facebook,
    TikTok: Globe,
    YouTube: Youtube
  };

  const addAccount = () => {
    if (newAccount.platform && newAccount.username) {
      setAccounts([...accounts, { 
        ...newAccount, 
        coverage: 0, 
        scans: 0 
      }]);
      setNewAccount({ platform: "", username: "", protection: ["deepfake", "copyright"] });
      setIsDialogOpen(false);
      toast({
        title: "Account Added",
        description: `${newAccount.platform} account monitoring has been configured.`,
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform as keyof typeof platformIcons] || Globe;
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
              Monitor your accounts for deepfakes and copyright violations
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
                  Configure monitoring for your social media accounts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <select 
                    id="platform"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newAccount.platform}
                    onChange={(e) => setNewAccount({...newAccount, platform: e.target.value})}
                  >
                    <option value="">Select Platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="username">Username/Handle</Label>
                  <Input
                    id="username"
                    placeholder="@your_username"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
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
        {accounts.map((account, index) => (
          <div key={index} className="space-y-2 p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {getPlatformIcon(account.platform)}
                <div>
                  <span className="text-sm font-medium">{account.platform}</span>
                  <p className="text-xs text-muted-foreground">{account.username}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">{account.scans} scans</span>
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
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        ))}
        
        {accounts.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No accounts configured yet</p>
            <p className="text-xs">Add your social media accounts to start monitoring</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformCoverage;