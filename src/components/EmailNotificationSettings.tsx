import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Clock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationPreferences {
  copyright_alerts_enabled: boolean;
  deepfake_alerts_enabled: boolean;
  high_priority_only: boolean;
  daily_digest_enabled: boolean;
  digest_time: string;
}

interface NotificationLog {
  id: string;
  notification_type: string;
  recipient_email: string;
  status: string;
  sent_at: string;
  error_message?: string;
}

export const EmailNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    copyright_alerts_enabled: true,
    deepfake_alerts_enabled: true,
    high_priority_only: false,
    daily_digest_enabled: true,
    digest_time: '09:00:00'
  });
  const [recentNotifications, setRecentNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotificationPreferences();
      loadRecentNotifications();
    }
  }, [user]);

  const loadNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('email_notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        throw error;
      }

      if (data) {
        setPreferences({
          copyright_alerts_enabled: data.copyright_alerts_enabled,
          deepfake_alerts_enabled: data.deepfake_alerts_enabled,
          high_priority_only: data.high_priority_only,
          daily_digest_enabled: data.daily_digest_enabled,
          digest_time: data.digest_time
        });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_notifications_log')
        .select('*')
        .eq('user_id', user?.id)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;

      toast.success('Email notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const testEmailNotification = async () => {
    try {
      setSaving(true);
      
      // Create a test alert notification
      const { error } = await supabase.functions.invoke('send-alert-notification', {
        body: {
          alertId: 'test-alert-' + Date.now(),
          alertType: 'test_notification',
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.user_metadata?.full_name || 'User'
        }
      });

      if (error) throw error;

      toast.success('Test email notification sent successfully! Check your inbox.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Notifications</h1>
          <p className="text-muted-foreground">
            Configure when and how you receive email alerts about security threats
          </p>
        </div>
      </div>

      {/* Quick Info Alert */}
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Email notifications will be sent to <strong>{user?.email}</strong>. 
          Critical security alerts are always sent regardless of these settings.
        </AlertDescription>
      </Alert>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Alert Preferences
          </CardTitle>
          <CardDescription>
            Choose which types of security alerts you want to receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Copyright Alerts */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="copyright-alerts" className="text-base font-medium">
                Copyright Violation Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when unauthorized use of your content is detected
              </p>
            </div>
            <Switch
              id="copyright-alerts"
              checked={preferences.copyright_alerts_enabled}
              onCheckedChange={(checked) => updatePreference('copyright_alerts_enabled', checked)}
            />
          </div>

          {/* Deepfake Alerts */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="deepfake-alerts" className="text-base font-medium">
                Deepfake Detection Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when AI-generated content using your likeness is found
              </p>
            </div>
            <Switch
              id="deepfake-alerts"
              checked={preferences.deepfake_alerts_enabled}
              onCheckedChange={(checked) => updatePreference('deepfake_alerts_enabled', checked)}
            />
          </div>

          {/* High Priority Only */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="high-priority" className="text-base font-medium">
                High Priority Alerts Only
              </Label>
              <p className="text-sm text-muted-foreground">
                Only receive emails for high-confidence threats (reduces notification volume)
              </p>
            </div>
            <Switch
              id="high-priority"
              checked={preferences.high_priority_only}
              onCheckedChange={(checked) => updatePreference('high_priority_only', checked)}
            />
          </div>

          {/* Daily Digest */}
          <div className="space-y-3">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="daily-digest" className="text-base font-medium">
                  Daily Digest Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive a summary of all security activity once per day
                </p>
              </div>
              <Switch
                id="daily-digest"
                checked={preferences.daily_digest_enabled}
                onCheckedChange={(checked) => updatePreference('daily_digest_enabled', checked)}
              />
            </div>

            {preferences.daily_digest_enabled && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="digest-time" className="text-sm font-medium">
                  Delivery Time
                </Label>
                <Select
                  value={preferences.digest_time}
                  onValueChange={(value) => updatePreference('digest_time', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00:00">6:00 AM</SelectItem>
                    <SelectItem value="09:00:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00:00">12:00 PM</SelectItem>
                    <SelectItem value="15:00:00">3:00 PM</SelectItem>
                    <SelectItem value="18:00:00">6:00 PM</SelectItem>
                    <SelectItem value="21:00:00">9:00 PM</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Currently set to {formatTime(preferences.digest_time)}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" onClick={testEmailNotification} disabled={saving}>
              {saving ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Email Notifications
          </CardTitle>
          <CardDescription>
            History of email notifications sent to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No email notifications sent yet</p>
              <p className="text-sm text-muted-foreground">
                Notifications will appear here when alerts are triggered
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(notification.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {notification.notification_type.replace('_', ' ')} Notification
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sent to {notification.recipient_email}
                      </p>
                      {notification.error_message && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {notification.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(notification.status)}>
                      {notification.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(notification.sent_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};