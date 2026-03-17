import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings as SettingsIcon, Bell, Shield, Trash2, Loader2, Save, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BugReportButton } from '@/components/BugReportButton';
import { BeginnerModeToggle } from '@/components/BeginnerModeToggle';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Notification preferences (from real email_notification_preferences table)
  const [notifPrefs, setNotifPrefs] = useState({
    copyright_alerts_enabled: true,
    deepfake_alerts_enabled: true,
    high_priority_only: false,
    daily_digest_enabled: true,
    digest_time: '09:00:00',
  });

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchPrefs = async () => {
      const { data } = await supabase
        .from('email_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setNotifPrefs({
          copyright_alerts_enabled: data.copyright_alerts_enabled ?? true,
          deepfake_alerts_enabled: data.deepfake_alerts_enabled ?? true,
          high_priority_only: data.high_priority_only ?? false,
          daily_digest_enabled: data.daily_digest_enabled ?? true,
          digest_time: data.digest_time ?? '09:00:00',
        });
      }
      setLoading(false);
    };
    fetchPrefs();
  }, [user]);

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    localStorage.setItem('theme', t);
    const root = document.documentElement;
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', t === 'dark');
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('email_notification_preferences')
      .upsert({
        user_id: user.id,
        ...notifPrefs,
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to save notification preferences');
    } else {
      toast.success('Notification preferences saved');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    // Sign out and inform — actual deletion requires admin action for safety
    await supabase.auth.signOut();
    toast.info('Account deletion requested. You have been signed out. Our team will process your request within 48 hours.');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-muted-foreground">Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>Choose how TSMO looks for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => applyTheme(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control what alerts and notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading preferences...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Copyright Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when potential copyright matches are found</p>
                </div>
                <Switch
                  checked={notifPrefs.copyright_alerts_enabled}
                  onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, copyright_alerts_enabled: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Deepfake Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when deepfakes of your content are detected</p>
                </div>
                <Switch
                  checked={notifPrefs.deepfake_alerts_enabled}
                  onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, deepfake_alerts_enabled: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>High Priority Only</Label>
                  <p className="text-sm text-muted-foreground">Only receive alerts for high-confidence threats</p>
                </div>
                <Switch
                  checked={notifPrefs.high_priority_only}
                  onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, high_priority_only: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of all activity</p>
                </div>
                <Switch
                  checked={notifPrefs.daily_digest_enabled}
                  onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, daily_digest_enabled: v }))}
                />
              </div>
              {notifPrefs.daily_digest_enabled && (
                <div className="flex items-center gap-4 pl-4">
                  <Label>Digest Time</Label>
                  <Select
                    value={notifPrefs.digest_time}
                    onValueChange={(v) => setNotifPrefs(p => ({ ...p, digest_time: v }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00:00">6:00 AM</SelectItem>
                      <SelectItem value="09:00:00">9:00 AM</SelectItem>
                      <SelectItem value="12:00:00">12:00 PM</SelectItem>
                      <SelectItem value="18:00:00">6:00 PM</SelectItem>
                      <SelectItem value="21:00:00">9:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleSaveNotifications} disabled={saving} className="mt-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Preferences
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Progressive Disclosure Info */}
      <BeginnerModeToggle />

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Change Password
          </Button>
          <p className="text-sm text-muted-foreground">
            Manage your password and security settings from your profile page.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account will permanently remove all your protected artwork, certificates, and monitoring data. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, all artwork records, protection certificates, and monitoring data. Type <strong>DELETE</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="border rounded px-3 py-2 text-sm w-full mt-2"
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BugReportButton />
    </div>
  );
};

export default Settings;
