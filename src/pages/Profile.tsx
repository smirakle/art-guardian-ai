import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, Mail, CreditCard, Key, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityLogging } from '@/hooks/useSecurityLogging';
import { useAnalytics } from '@/hooks/useAnalytics';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().max(100, 'Name must be less than 100 characters').optional(),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters').optional(),
});

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { subscription } = useSubscription();
  const { logSecurityEvent } = useSecurityLogging();
  const { track } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate input
    const validation = profileSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        await logSecurityEvent({
          event_type: 'config_change',
          severity: 'low',
          description: `Failed profile update attempt: ${error.message}`,
          metadata: { error: error.message }
        });
        throw error;
      }

      await logSecurityEvent({
        event_type: 'config_change',
        severity: 'low',
        description: 'Profile updated successfully',
        metadata: { fields_updated: Object.keys(formData) }
      });

      track('profile_updated', { fields: Object.keys(formData) });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate passwords
    const validation = passwordSchema.safeParse({ 
      password: newPassword, 
      confirmPassword 
    });
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setShowPasswordConfirm(true);
  };

  const handleChangePassword = async () => {
    setIsPasswordLoading(true);
    setShowPasswordConfirm(false);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        await logSecurityEvent({
          event_type: 'config_change',
          severity: 'medium',
          description: `Failed password change attempt: ${error.message}`,
          metadata: { error: error.message }
        });
        throw error;
      }

      await logSecurityEvent({
        event_type: 'config_change',
        severity: 'medium',
        description: 'Password changed successfully',
      });

      track('password_changed');
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await logSecurityEvent({
        event_type: 'data_access',
        severity: 'low',
        description: 'Accessing Stripe customer portal',
      });

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {},
      });

      if (error) {
        await logSecurityEvent({
          event_type: 'data_access',
          severity: 'medium',
          description: `Failed to access customer portal: ${error.message}`,
          metadata: { error: error.message }
        });
        throw error;
      }

      if (data?.url) {
        track('subscription_manage_clicked');
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open subscription management');
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and subscription</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
                {validationErrors.full_name && (
                  <p className="text-sm text-destructive">{validationErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                />
                {validationErrors.username && (
                  <p className="text-sm text-destructive">{validationErrors.username}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>
              <CreditCard className="w-5 h-5 inline mr-2" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <Badge variant="secondary" className="mt-1">
                      {subscription.plan_id?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <Button onClick={handleManageSubscription} variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription in Stripe
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Button onClick={() => window.location.href = '/pricing'}>
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Key className="w-5 h-5 inline mr-2" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChangeRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                />
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" disabled={isPasswordLoading || !newPassword || !confirmPassword}>
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showPasswordConfirm} onOpenChange={setShowPasswordConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your password? You will remain logged in on this device, but may need to log in again on other devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangePassword}>
              Change Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
