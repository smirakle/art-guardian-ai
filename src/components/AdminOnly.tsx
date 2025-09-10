import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, User, AlertTriangle } from 'lucide-react';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  showContactInfo?: boolean;
}

const AdminOnly: React.FC<AdminOnlyProps> = ({ 
  children, 
  fallbackTitle = "Admin Access Required",
  fallbackDescription = "This content is restricted to administrators only.",
  showContactInfo = true
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Lock className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Login Required</h4>
                <p className="text-sm text-amber-700">
                  Please sign in to access this content. This area is restricted to authenticated users.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role !== 'admin') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            {fallbackTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Restricted Access</h4>
                <p className="text-sm text-red-700">
                  {fallbackDescription}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-background border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Access Levels</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Your Current Role:</span>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                  {role || 'User'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Required Role:</span>
                <span className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-medium">
                  Admin
                </span>
              </div>
            </div>
          </div>
          
          {showContactInfo && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Contact an administrator if you need access to this content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // User is authenticated and has admin role - show the content
  return <>{children}</>;
};

export default AdminOnly;