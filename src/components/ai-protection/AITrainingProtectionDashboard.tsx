import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Upload, Download, Eye, Lock, BarChart3, Bell, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAIProtectionRateLimit } from '@/hooks/useAIProtectionRateLimit';
import { useEnhancedCaching } from '@/hooks/useEnhancedCaching';
import AIProtectionMetrics from './AIProtectionMetrics';
import AIProtectionNotificationCenter from './AIProtectionNotificationCenter';
import AIProtectionAuditLog from './AIProtectionAuditLog';

interface ProtectionRecord {
  id: string;
  protection_id: string;
  original_filename: string;
  protection_level: string;
  protection_methods: any;
  is_active: boolean;
  created_at: string;
  artwork_id?: string;
  file_fingerprint: string;
  protected_file_path?: string;
  applied_at: string;
  metadata: any;
  user_id: string;
}

interface Violation {
  id: string;
  violation_type: string;
  source_url: string;
  source_domain: string;
  confidence_score: number;
  status: string;
  detected_at: string;
  legal_action_taken: boolean;
}

const AITrainingProtectionDashboard = () => {
  const { user } = useAuth();
  const { checkRateLimit } = useAIProtectionRateLimit();
  const cache = useEnhancedCaching({ maxSize: 100, defaultTTL: 300000, enablePersistence: true });
  const [protectionRecords, setProtectionRecords] = useState<ProtectionRecord[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProtected: 0,
    activeViolations: 0,
    protectionLevel: 85,
    lastScan: new Date()
  });

  useEffect(() => {
    if (user) {
      loadProtectionData();
      loadViolations();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadProtectionData = async () => {
    try {
      const { data: records, error } = await supabase
        .from('ai_protection_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtectionRecords(records || []);
      
      setStats(prev => ({
        ...prev,
        totalProtected: records?.length || 0
      }));
    } catch (error) {
      console.error('Error loading protection data:', error);
      toast.error('Failed to load protection records');
    }
  };

  const loadViolations = async () => {
    try {
      const { data: violationData, error } = await supabase
        .from('ai_training_violations')
        .select('*')
        .eq('user_id', user?.id)
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setViolations(violationData || []);
      
      const activeCount = violationData?.filter(v => v.status === 'pending').length || 0;
      setStats(prev => ({
        ...prev,
        activeViolations: activeCount
      }));
    } catch (error) {
      console.error('Error loading violations:', error);
      toast.error('Failed to load violation data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('ai_protection_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_training_violations', filter: `user_id=eq.${user?.id}` },
        () => {
          loadViolations();
          toast.info('New AI training violation detected');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const startProtection = async (fileData: File) => {
    try {
      setLoading(true);
      
      // Upload file to Supabase storage
      const fileExt = fileData.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ai-protected-files')
        .upload(fileName, fileData);

      if (uploadError) throw uploadError;

      // Process with AI protection
      const { data, error } = await supabase.functions.invoke('ai-training-protection-processor', {
        body: {
          action: 'protect_file',
          file_path: uploadData.path,
          original_filename: fileData.name,
          protection_level: 'advanced'
        }
      });

      if (error) throw error;

      toast.success('File protected against AI training');
      loadProtectionData();
    } catch (error) {
      console.error('Error protecting file:', error);
      toast.error('Failed to protect file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      startProtection(file);
    }
  };

  const downloadProtectedFile = async (protectionId: string, filename: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-training-protection-processor', {
        body: {
          action: 'download_protected',
          protection_id: protectionId
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.file_data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `protected_${filename}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Protected file downloaded');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download protected file');
    }
  };

  const startRealTimeScanning = async (protectionId: string) => {
    try {
      const canProceed = await checkRateLimit('ai-training-scan', 50, 60);
      if (!canProceed) {
        toast.error('Rate limit exceeded. Please try again later.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-training-protection-monitor', {
        body: {
          protectionRecordId: protectionId,
          enableRealTimeScanning: true,
          scanType: 'comprehensive'
        }
      });

      if (error) throw error;
      
      toast.success(`Real-time scanning initiated: ${data.violations_detected} threats detected`);
      loadViolations();
    } catch (error) {
      console.error('Error starting real-time scan:', error);
      toast.error('Failed to start real-time scanning');
    }
  };

  const takeAction = async (violationId: string, action: string) => {
    try {
      const { error } = await supabase.functions.invoke('ai-training-protection-processor', {
        body: {
          action: 'handle_violation',
          violation_id: violationId,
          response_action: action
        }
      });

      if (error) throw error;
      
      toast.success(`${action} action initiated`);
      loadViolations();
    } catch (error) {
      console.error('Error taking action:', error);
      toast.error('Failed to take action');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Training Protection</h1>
          <p className="text-muted-foreground">Protect your content from unauthorized AI training</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadProtectionData()}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Protect File
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Files</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProtected}</div>
            <p className="text-xs text-muted-foreground">Files under protection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.activeViolations}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Level</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.protectionLevel}%</div>
            <Progress value={stats.protectionLevel} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="protected" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="protected">Protected Files</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="metrics"><BarChart3 className="h-4 w-4 mr-2" />Metrics</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="protected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protected Files</CardTitle>
              <CardDescription>Files currently protected against AI training</CardDescription>
            </CardHeader>
            <CardContent>
              {protectionRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No protected files yet</p>
                  <p className="text-sm text-muted-foreground">Upload files to start protecting them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {protectionRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{record.original_filename}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{record.protection_level}</Badge>
                            <Badge variant={record.is_active ? "default" : "destructive"}>
                              {record.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                       <div className="flex gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => startRealTimeScanning(record.id)}
                         >
                           <Eye className="h-4 w-4 mr-2" />
                           Scan Now
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => downloadProtectedFile(record.protection_id, record.original_filename)}
                         >
                           <Download className="h-4 w-4 mr-2" />
                           Download
                         </Button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Training Violations</CardTitle>
              <CardDescription>Detected unauthorized use in AI training</CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No violations detected</p>
                  <p className="text-sm text-muted-foreground">Your content is secure</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <Alert key={violation.id} className="border-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{violation.violation_type}</p>
                            <p className="text-sm text-muted-foreground">
                              Found on: {violation.source_domain}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {Math.round(violation.confidence_score * 100)}%
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={violation.status === 'pending' ? 'destructive' : 'secondary'}>
                                {violation.status}
                              </Badge>
                              {violation.legal_action_taken && (
                                <Badge variant="outline">Legal Action Taken</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => takeAction(violation.id, 'send_notice')}
                            >
                              Send Notice
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => takeAction(violation.id, 'legal_action')}
                            >
                              Legal Action
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <AIProtectionMetrics />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <AIProtectionNotificationCenter />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AIProtectionAuditLog />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Settings</CardTitle>
              <CardDescription>Enterprise-grade AI training protection configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">Current: 10 uploads per hour</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Performance Cache</h4>
                  <p className="text-sm text-muted-foreground">Hit rate: {cache.stats.hitRate.toFixed(1)}%</p>
                </div>
                <Button variant="outline" size="sm" onClick={cache.clear}>Clear Cache</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Critical violations auto-notify</p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITrainingProtectionDashboard;