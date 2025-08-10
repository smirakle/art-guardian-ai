import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Key,
  Eye,
  Clock,
  Globe,
  Users,
  Database,
  Server
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  lastChecked: string;
  details?: string;
}

interface SecurityLog {
  id: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: string;
  details: any;
}

const SecurityCenter: React.FC = () => {
  const { user } = useAuth();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Mock security checks - replace with real security monitoring
      const checks: SecurityCheck[] = [
        {
          id: '1',
          name: 'SSL/TLS Certificate',
          status: 'pass',
          description: 'Valid SSL certificate with proper encryption',
          lastChecked: new Date().toISOString(),
          details: 'Certificate expires in 89 days'
        },
        {
          id: '2',
          name: 'Database Security',
          status: 'pass',
          description: 'Row Level Security enabled and properly configured',
          lastChecked: new Date().toISOString(),
          details: 'All RLS policies active'
        },
        {
          id: '3',
          name: 'API Rate Limiting',
          status: 'pass',
          description: 'Rate limiting active on all public endpoints',
          lastChecked: new Date().toISOString(),
          details: '100 requests/minute per IP'
        },
        {
          id: '4',
          name: 'Authentication Security',
          status: 'warning',
          description: 'Strong password policies recommended',
          lastChecked: new Date().toISOString(),
          details: 'Consider enabling 2FA for all users'
        },
        {
          id: '5',
          name: 'Data Encryption',
          status: 'pass',
          description: 'All sensitive data encrypted at rest and in transit',
          lastChecked: new Date().toISOString(),
          details: 'AES-256 encryption'
        },
        {
          id: '6',
          name: 'Backup Security',
          status: 'pass',
          description: 'Automated backups with encryption',
          lastChecked: new Date().toISOString(),
          details: 'Daily backups, 30-day retention'
        }
      ];

      // Mock security logs
      const logs: SecurityLog[] = [
        {
          id: '1',
          event: 'Failed login attempt',
          severity: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          source: '192.168.1.100',
          details: { attempts: 3, blocked: true }
        },
        {
          id: '2',
          event: 'Rate limit exceeded',
          severity: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          source: '10.0.0.45',
          details: { endpoint: '/api/upload', requests: 150 }
        },
        {
          id: '3',
          event: 'Security scan completed',
          severity: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          source: 'system',
          details: { vulnerabilities: 0, warnings: 1 }
        },
        {
          id: '4',
          event: 'SSL certificate renewed',
          severity: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          source: 'automation',
          details: { expires: '2025-03-15', issuer: 'Let\'s Encrypt' }
        }
      ];

      setSecurityChecks(checks);
      setSecurityLogs(logs);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    try {
      setLoading(true);
      
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data
      await loadSecurityData();
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const securityScore = Math.round(
    (securityChecks.filter(check => check.status === 'pass').length / securityChecks.length) * 100
  );

  if (loading && securityChecks.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">
            Monitor and manage platform security
          </p>
        </div>
        <Button onClick={runSecurityScan} disabled={loading}>
          {loading ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Security Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                securityScore >= 90 ? 'bg-green-100' : 
                securityScore >= 70 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-8 h-8 ${
                  securityScore >= 90 ? 'text-green-600' : 
                  securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{securityScore}%</h3>
            <p className="text-muted-foreground">Security Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{securityLogs.length}</h3>
            <p className="text-muted-foreground">Recent Events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">0</h3>
            <p className="text-muted-foreground">Active Threats</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Checks & Logs */}
      <Tabs defaultValue="checks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">Security Checks</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <h3 className="font-semibold">{check.name}</h3>
                    </div>
                    <Badge variant={
                      check.status === 'pass' ? 'default' :
                      check.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {check.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    {check.description}
                  </p>
                  {check.details && (
                    <p className="text-xs text-muted-foreground">
                      {check.details}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Last checked: {new Date(check.lastChecked).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(log.severity)} mt-2`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{log.event}</h4>
                        <Badge variant="outline" className="text-xs">
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Source: {log.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.details && (
                        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data encryption</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Right to deletion</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data portability</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consent management</span>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  SOC 2 Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security controls</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Availability monitoring</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processing integrity</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidentiality</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Regular compliance audits are recommended every 6 months. 
              Next audit scheduled for March 2024.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityCenter;