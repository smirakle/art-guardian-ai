import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MFAStatus {
  enabled: boolean;
  method: string | null;
  last_verified: string | null;
}

const AdminMFAEnforcement: React.FC = () => {
  const { user, role } = useAuth();
  const [mfaStatus, setMfaStatus] = useState<MFAStatus>({ enabled: false, method: null, last_verified: null });
  const [totpCode, setTotpCode] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && role === 'admin') {
      checkMFAStatus();
    }
  }, [user, role]);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const activeFactor = data?.totp?.find(factor => factor.status === 'verified');
      setMfaStatus({
        enabled: !!activeFactor,
        method: activeFactor ? 'TOTP' : null,
        last_verified: activeFactor?.created_at || null
      });
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const enrollMFA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin Security Token'
      });
      
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      toast.success('MFA enrollment initiated. Scan the QR code with your authenticator app.');
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      toast.error('Failed to enroll MFA');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!totpCode) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: 'totp',
        code: totpCode
      });
      
      if (error) throw error;
      
      await checkMFAStatus();
      setQrCode(null);
      setTotpCode('');
      toast.success('MFA successfully verified!');
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Multi-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mfaStatus.enabled ? (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Warning:</strong> Multi-factor authentication is required for all admin accounts. 
              Please enable MFA immediately to maintain system security compliance.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              MFA is enabled and active. Last verified: {new Date(mfaStatus.last_verified!).toLocaleDateString()}
            </AlertDescription>
          </Alert>
        )}

        {!mfaStatus.enabled && (
          <div className="space-y-4">
            {!qrCode ? (
              <Button 
                onClick={enrollMFA} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up MFA...' : 'Enable Multi-Factor Authentication'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <img src={qrCode} alt="MFA QR Code" className="mx-auto border rounded" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code from authenticator app"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button 
                    onClick={verifyMFA} 
                    disabled={loading || totpCode.length !== 6}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify and Enable MFA'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Security Notice:</strong> This system implements government-grade security standards.</p>
          <p>• MFA is mandatory for all administrative access</p>
          <p>• Sessions are logged and monitored</p>
          <p>• Unauthorized access attempts are tracked</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMFAEnforcement;