import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
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
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      loadSubscriber();
    }
  }, [token]);

  const loadSubscriber = async () => {
    try {
      // For now, we'll simulate finding a subscriber by the token
      // In a real implementation, this would query the email_subscribers table
      setSubscriberEmail('user@example.com');
    } catch (error) {
      console.error('Error loading subscriber:', error);
      toast({
        title: "Error",
        description: "Invalid unsubscribe link.",
        variant: "destructive",
      });
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid unsubscribe token.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll simulate the unsubscribe process
      // In a real implementation, this would update the email_subscribers table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setIsUnsubscribed(true);
      toast({
        title: "Success",
        description: "You have been successfully unsubscribed.",
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe. Please try again.",
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
              You have been removed from our email list.
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle>Unsubscribe</CardTitle>
          <CardDescription>
            We're sorry to see you go. Click the button below to unsubscribe from our emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscriberEmail && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="font-medium">Email: {subscriberEmail}</p>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              onClick={handleUnsubscribe} 
              disabled={isLoading}
              variant="destructive"
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Unsubscribe'}
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            This action will remove you from all our email communications.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};