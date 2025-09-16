import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Mail, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UnsubscribePageProps {
  token?: string;
}

export const UnsubscribePage: React.FC<UnsubscribePageProps> = ({ token: propToken }) => {
  const [searchParams] = useSearchParams();
  const token = propToken || searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [subscriber, setSubscriber] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [preferences, setPreferences] = useState({
    marketing: true,
    transactional: true,
    newsletter: true,
    updates: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      loadSubscriber();
    }
  }, [token]);

  const loadSubscriber = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('unsubscribe_token', token)
        .single();

      if (error) throw error;
      setSubscriber(data);

      // Load existing preferences if any
      const { data: prefData } = await supabase
        .from('email_unsubscribe_preferences')
        .select('*')
        .eq('subscriber_id', data.id)
        .single();

      if (prefData) {
        setPreferences(prefData.preferences || preferences);
      }

    } catch (error) {
      console.error('Error loading subscriber:', error);
      toast({
        title: "Error",
        description: "Invalid unsubscribe link or subscriber not found.",
        variant: "destructive",
      });
    }
  };

  const handleUnsubscribe = async (type: 'all' | 'preferences') => {
    if (!subscriber) return;

    setIsLoading(true);
    try {
      if (type === 'all') {
        // Unsubscribe from everything
        const { error: updateError } = await supabase
          .from('email_subscribers')
          .update({ status: 'unsubscribed' })
          .eq('id', subscriber.id);

        if (updateError) throw updateError;

        // Record unsubscribe preferences
        const { error: prefError } = await supabase
          .from('email_unsubscribe_preferences')
          .upsert({
            subscriber_id: subscriber.id,
            user_id: subscriber.user_id,
            unsubscribed_from: {
              all: true,
              date: new Date().toISOString()
            },
            preferences: {
              marketing: false,
              transactional: false,
              newsletter: false,
              updates: false
            },
            unsubscribe_reason: reason === 'other' ? customReason : reason
          });

        if (prefError) throw prefError;

      } else {
        // Update preferences only
        const { error: prefError } = await supabase
          .from('email_unsubscribe_preferences')
          .upsert({
            subscriber_id: subscriber.id,
            user_id: subscriber.user_id,
            unsubscribed_from: {
              selective: true,
              date: new Date().toISOString()
            },
            preferences,
            unsubscribe_reason: reason === 'other' ? customReason : reason
          });

        if (prefError) throw prefError;

        // Only unsubscribe completely if all preferences are false
        const allFalse = Object.values(preferences).every(val => !val);
        if (allFalse) {
          const { error: updateError } = await supabase
            .from('email_subscribers')
            .update({ status: 'unsubscribed' })
            .eq('id', subscriber.id);

          if (updateError) throw updateError;
        }
      }

      setIsUnsubscribed(true);
      toast({
        title: "Success",
        description: type === 'all' 
          ? "You have been unsubscribed from all emails." 
          : "Your email preferences have been updated.",
      });

    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This unsubscribe link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <CardTitle>Successfully Unsubscribed</CardTitle>
            <CardDescription>
              Your email preferences have been updated. You can close this page now.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              If you change your mind, you can always resubscribe by visiting our website.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle>Manage Your Email Preferences</CardTitle>
          <CardDescription>
            We're sorry to see you go. You can unsubscribe from all emails or just modify your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Email */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="font-medium">Email: {subscriber.email}</p>
            {subscriber.first_name && (
              <p className="text-sm text-muted-foreground">
                Name: {subscriber.first_name} {subscriber.last_name}
              </p>
            )}
          </div>

          {/* Reason for unsubscribing */}
          <div className="space-y-3">
            <Label>Why are you unsubscribing? (Optional)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="too_many">Too many emails</SelectItem>
                <SelectItem value="not_relevant">Content not relevant</SelectItem>
                <SelectItem value="never_signed_up">I never signed up</SelectItem>
                <SelectItem value="privacy_concerns">Privacy concerns</SelectItem>
                <SelectItem value="technical_issues">Technical issues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {reason === 'other' && (
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please tell us more..."
                rows={3}
              />
            )}
          </div>

          {/* Email Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <Label className="text-base font-medium">Email Preferences</Label>
            </div>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Promotional content and offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Newsletters</p>
                  <p className="text-sm text-muted-foreground">Weekly updates and news</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newsletter}
                  onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product Updates</p>
                  <p className="text-sm text-muted-foreground">New features and improvements</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.updates}
                  onChange={(e) => setPreferences(prev => ({ ...prev, updates: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transactional Emails</p>
                  <p className="text-sm text-muted-foreground">Account and security notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.transactional}
                  onChange={(e) => setPreferences(prev => ({ ...prev, transactional: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleUnsubscribe('preferences')}
              disabled={isLoading}
              className="flex-1"
            >
              Update Preferences
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUnsubscribe('all')}
              disabled={isLoading}
              className="flex-1"
            >
              Unsubscribe from All
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>
              This link will expire in 7 days. If you need help, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};