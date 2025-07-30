import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, Search, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileTarget {
  id: string;
  target_name: string;
  target_description: string;
  profile_images: string[];
  target_usernames: string[];
  target_emails: string[];
  platforms_to_monitor: string[];
  monitoring_enabled: boolean;
  last_scan_at: string | null;
  risk_score: number;
  created_at: string;
}

interface Platform {
  id: string;
  platform_name: string;
  platform_category: string;
  is_enabled: boolean;
}

export const ProfileTargetManager: React.FC = () => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<ProfileTarget[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ProfileTarget | null>(null);
  const [formData, setFormData] = useState({
    target_name: '',
    target_description: '',
    profile_images: '',
    target_usernames: '',
    target_emails: '',
    platforms_to_monitor: [] as string[],
    monitoring_enabled: true
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load targets
      const { data: targetsData, error: targetsError } = await supabase
        .from('profile_monitoring_targets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (targetsError) throw targetsError;

      // Load platforms
      const { data: platformsData, error: platformsError } = await supabase
        .from('monitored_platforms')
        .select('*')
        .eq('is_enabled', true)
        .order('platform_name');

      if (platformsError) throw platformsError;

      setTargets(targetsData || []);
      setPlatforms(platformsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load monitoring targets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const targetData = {
        user_id: user?.id,
        target_name: formData.target_name,
        target_description: formData.target_description,
        profile_images: formData.profile_images.split(',').map(img => img.trim()).filter(Boolean),
        target_usernames: formData.target_usernames.split(',').map(username => username.trim()).filter(Boolean),
        target_emails: formData.target_emails.split(',').map(email => email.trim()).filter(Boolean),
        platforms_to_monitor: formData.platforms_to_monitor,
        monitoring_enabled: formData.monitoring_enabled
      };

      if (editingTarget) {
        const { error } = await supabase
          .from('profile_monitoring_targets')
          .update(targetData)
          .eq('id', editingTarget.id);
        
        if (error) throw error;
        toast.success('Monitoring target updated successfully');
      } else {
        const { error } = await supabase
          .from('profile_monitoring_targets')
          .insert(targetData);
        
        if (error) throw error;
        toast.success('Monitoring target created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving target:', error);
      toast.error('Failed to save monitoring target');
    }
  };

  const handleEdit = (target: ProfileTarget) => {
    setEditingTarget(target);
    setFormData({
      target_name: target.target_name,
      target_description: target.target_description || '',
      profile_images: target.profile_images.join(', '),
      target_usernames: target.target_usernames.join(', '),
      target_emails: target.target_emails.join(', '),
      platforms_to_monitor: target.platforms_to_monitor,
      monitoring_enabled: target.monitoring_enabled
    });
    setDialogOpen(true);
  };

  const handleDelete = async (targetId: string) => {
    if (!confirm('Are you sure you want to delete this monitoring target?')) return;

    try {
      const { error } = await supabase
        .from('profile_monitoring_targets')
        .delete()
        .eq('id', targetId);

      if (error) throw error;
      
      toast.success('Monitoring target deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('Failed to delete monitoring target');
    }
  };

  const startScan = async (targetId: string) => {
    try {
      const { error } = await supabase.functions.invoke('comprehensive-profile-monitor', {
        body: { targetId, action: 'manual_scan' }
      });

      if (error) throw error;
      
      toast.success('Profile scan started successfully');
    } catch (error) {
      console.error('Error starting scan:', error);
      toast.error('Failed to start profile scan');
    }
  };

  const resetForm = () => {
    setFormData({
      target_name: '',
      target_description: '',
      profile_images: '',
      target_usernames: '',
      target_emails: '',
      platforms_to_monitor: [],
      monitoring_enabled: true
    });
    setEditingTarget(null);
  };

  const handlePlatformToggle = (platformName: string) => {
    setFormData(prev => ({
      ...prev,
      platforms_to_monitor: prev.platforms_to_monitor.includes(platformName)
        ? prev.platforms_to_monitor.filter(p => p !== platformName)
        : [...prev.platforms_to_monitor, platformName]
    }));
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'default';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Targets</h2>
          <p className="text-muted-foreground">Manage profiles you want to monitor for impersonation</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTarget ? 'Edit Monitoring Target' : 'Add Monitoring Target'}
              </DialogTitle>
              <DialogDescription>
                Configure a profile or identity to monitor across multiple platforms
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target_name">Target Name</Label>
                <Input
                  id="target_name"
                  value={formData.target_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_name: e.target.value }))}
                  placeholder="e.g., John Doe, Brand Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_description">Description</Label>
                <Textarea
                  id="target_description"
                  value={formData.target_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_description: e.target.value }))}
                  placeholder="Additional details about this monitoring target"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_usernames">Usernames (comma-separated)</Label>
                <Input
                  id="target_usernames"
                  value={formData.target_usernames}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_usernames: e.target.value }))}
                  placeholder="johndoe, john.doe, john_doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_emails">Email Addresses (comma-separated)</Label>
                <Input
                  id="target_emails"
                  value={formData.target_emails}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_emails: e.target.value }))}
                  placeholder="john@example.com, contact@brand.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_images">Profile Image URLs (comma-separated)</Label>
                <Input
                  id="profile_images"
                  value={formData.profile_images}
                  onChange={(e) => setFormData(prev => ({ ...prev, profile_images: e.target.value }))}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Platforms to Monitor</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={platform.platform_name}
                        checked={formData.platforms_to_monitor.includes(platform.platform_name)}
                        onChange={() => handlePlatformToggle(platform.platform_name)}
                      />
                      <Label htmlFor={platform.platform_name} className="text-sm">
                        {platform.platform_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="monitoring_enabled"
                  checked={formData.monitoring_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, monitoring_enabled: checked }))}
                />
                <Label htmlFor="monitoring_enabled">Enable monitoring</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTarget ? 'Update Target' : 'Create Target'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Targets List */}
      <div className="space-y-4">
        {targets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No monitoring targets configured</p>
              <p className="text-sm text-muted-foreground">Add your first target to start monitoring</p>
            </CardContent>
          </Card>
        ) : (
          targets.map((target) => (
            <Card key={target.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {target.target_name}
                      <Badge variant={getRiskBadgeVariant(target.risk_score)}>
                        Risk: {target.risk_score}%
                      </Badge>
                      {!target.monitoring_enabled && (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{target.target_description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => startScan(target.id)}>
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(target)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(target.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Usernames:</strong> {target.target_usernames.join(', ') || 'None'}
                  </div>
                  <div>
                    <strong>Platforms:</strong> {target.platforms_to_monitor.join(', ') || 'None'}
                  </div>
                  <div>
                    <strong>Last Scan:</strong> {
                      target.last_scan_at 
                        ? new Date(target.last_scan_at).toLocaleDateString()
                        : 'Never'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};