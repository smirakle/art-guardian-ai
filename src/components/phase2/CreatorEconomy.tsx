import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Link2, Globe, Star, TrendingUp, Shield } from 'lucide-react';

interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  website: string | null;
  social_links: any;
  revenue_split_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow additional properties from the database
}

export function CreatorEconomy() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    website: '',
    social_links: {
      instagram: '',
      twitter: '',
      tiktok: '',
      onlyfans: '',
      patreon: ''
    },
    revenue_split_percent: 5
  });

  useEffect(() => {
    fetchCreatorProfile();
  }, []);

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('creator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name,
          bio: data.bio || '',
          website: data.website || '',
          social_links: data.social_links || {
            instagram: '',
            twitter: '',
            tiktok: '',
            onlyfans: '',
            patreon: ''
          },
          revenue_split_percent: data.revenue_split_percent
        });
      }
    } catch (error) {
      console.error('Failed to fetch creator profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profileData = {
        user_id: user.id,
        display_name: formData.display_name,
        bio: formData.bio,
        website: formData.website,
        social_links: formData.social_links,
        revenue_split_percent: formData.revenue_split_percent,
        is_active: true
      };

      const { data, error } = await (supabase as any)
        .from('creator_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setEditing(false);
      toast.success('Creator profile saved successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save creator profile');
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { name: 'OnlyFans', key: 'onlyfans', icon: '🔥' },
    { name: 'Patreon', key: 'patreon', icon: '💎' },
    { name: 'Instagram', key: 'instagram', icon: '📸' },
    { name: 'TikTok', key: 'tiktok', icon: '🎵' },
    { name: 'Twitter', key: 'twitter', icon: '🐦' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Creator Economy Integration
          </CardTitle>
          <CardDescription>
            Protect your content across all creator platforms with automated monitoring and enforcement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Connected Platforms</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-emerald-500">{profile?.revenue_split_percent || 0}%</div>
              <div className="text-sm text-muted-foreground">Revenue Share</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!profile && !editing ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Create Your Creator Profile</h3>
            <p className="text-muted-foreground mb-4">
              Set up your creator profile to start protecting your content across all platforms
            </p>
            <Button onClick={() => setEditing(true)}>
              Create Creator Profile
            </Button>
          </CardContent>
        </Card>
      ) : editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Creator Profile Setup</CardTitle>
            <CardDescription>
              Configure your creator profile and platform integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Display Name *</label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your creator name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your creative work..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Platform Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div key={platform.key}>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{platform.icon}</span>
                      {platform.name}
                    </label>
                    <Input
                      value={formData.social_links[platform.key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          [platform.key]: e.target.value
                        }
                      })}
                      placeholder={`Your ${platform.name} profile URL`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Revenue Share Percentage</label>
              <Input
                type="number"
                min="0"
                max="15"
                value={formData.revenue_split_percent}
                onChange={(e) => setFormData({ ...formData, revenue_split_percent: parseInt(e.target.value) || 0 })}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of recovered revenue shared with TSMO (0-15%)
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={loading || !formData.display_name}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {profile?.display_name}
                </CardTitle>
                <CardDescription>{profile?.bio}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-emerald-500">Active Creator</Badge>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Connected Platforms
                </h4>
                <div className="space-y-2">
                  {platforms.map((platform) => {
                    const hasLink = profile?.social_links?.[platform.key];
                    return (
                      <div key={platform.key} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span>{platform.icon}</span>
                          <span className="text-sm">{platform.name}</span>
                        </div>
                        <Badge variant={hasLink ? "default" : "secondary"}>
                          {hasLink ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Protection Features
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Content Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Revenue Protection</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Automated DMCA</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Cross-Platform Sync</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenue Protection Settings
              </h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Revenue Share</span>
                  <span className="text-lg font-bold">{profile?.revenue_split_percent}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Protection Level</span>
                  <Badge variant="default">Maximum</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm font-medium">&lt; 1 hour</span>
                </div>
              </div>
            </div>

            {profile?.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}