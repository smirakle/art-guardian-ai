import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileTarget {
  id: string;
  target_name: string;
  target_description: string;
  profile_images: string[];
  target_usernames: string[];
  target_emails: string[];
  platforms_to_monitor: string[];
  monitoring_enabled: boolean;
  risk_score: number;
  last_scan_at: string;
  created_at: string;
}

const AVAILABLE_PLATFORMS = [
  'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube',
  'Snapchat', 'Discord', 'Reddit', 'Pinterest', 'Telegram', 'WhatsApp'
];

export function ProfileTargetManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targets, setTargets] = useState<ProfileTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ProfileTarget | null>(null);
  const [formData, setFormData] = useState({
    target_name: '',
    target_description: '',
    target_usernames: '',
    target_emails: '',
    platforms_to_monitor: [] as string[]
  });

  useEffect(() => {
    if (user) {
      loadTargets();
    }
  }, [user]);

  const loadTargets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profile_monitoring_targets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error('Error loading targets:', error);
      toast({
        title: "Error",
        description: "Failed to load monitoring targets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const targetData = {
        user_id: user.id,
        target_name: formData.target_name,
        target_description: formData.target_description,
        target_usernames: formData.target_usernames.split('\n').filter(Boolean),
        target_emails: formData.target_emails.split('\n').filter(Boolean),
        platforms_to_monitor: formData.platforms_to_monitor,
        monitoring_enabled: true
      };

      let error;
      if (editingTarget) {
        const { error: updateError } = await supabase
          .from('profile_monitoring_targets')
          .update(targetData)
          .eq('id', editingTarget.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profile_monitoring_targets')
          .insert([targetData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: editingTarget ? "Target updated successfully" : "Target added successfully"
      });

      resetForm();
      loadTargets();
    } catch (error) {
      console.error('Error saving target:', error);
      toast({
        title: "Error",
        description: "Failed to save target",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      target_name: '',
      target_description: '',
      target_usernames: '',
      target_emails: '',
      platforms_to_monitor: []
    });
    setEditingTarget(null);
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return <div>Loading targets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Profile Targets</h2>
          <p className="text-muted-foreground">
            Manage profiles to monitor for impersonation and identity theft
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTarget ? 'Edit Profile Target' : 'Add Profile Target'}
              </DialogTitle>
              <DialogDescription>
                Configure a profile to monitor for impersonation across social media platforms
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target_name">Target Name</Label>
                <Input
                  id="target_name"
                  value={formData.target_name}
                  onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
                  placeholder="e.g., John Smith, Company CEO"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_description">Description</Label>
                <Textarea
                  id="target_description"
                  value={formData.target_description}
                  onChange={(e) => setFormData({ ...formData, target_description: e.target.value })}
                  placeholder="Brief description of the target profile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_usernames">Known Usernames</Label>
                <Textarea
                  id="target_usernames"
                  value={formData.target_usernames}
                  onChange={(e) => setFormData({ ...formData, target_usernames: e.target.value })}
                  placeholder="One username per line"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_emails">Known Email Addresses</Label>
                <Textarea
                  id="target_emails"
                  value={formData.target_emails}
                  onChange={(e) => setFormData({ ...formData, target_emails: e.target.value })}
                  placeholder="One email per line"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Platforms to Monitor</Label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_PLATFORMS.map((platform) => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.platforms_to_monitor.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              platforms_to_monitor: [...formData.platforms_to_monitor, platform]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              platforms_to_monitor: formData.platforms_to_monitor.filter(p => p !== platform)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTarget ? 'Update Target' : 'Add Target'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map((target) => (
          <Card key={target.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{target.target_name}</CardTitle>
                  <CardDescription>{target.target_description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={target.monitoring_enabled} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risk Score</span>
                <Badge variant="outline">
                  {target.risk_score || 0}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Platforms ({target.platforms_to_monitor?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {target.platforms_to_monitor?.slice(0, 3).map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                  {(target.platforms_to_monitor?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(target.platforms_to_monitor?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Last scan: {target.last_scan_at ? new Date(target.last_scan_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {targets.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Monitoring Targets</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add profiles to monitor for impersonation and identity theft across social media platforms
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Target
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}