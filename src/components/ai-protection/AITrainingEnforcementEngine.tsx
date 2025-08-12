import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  FileText, 
  Gavel, 
  Clock,
  Link2,
  Award,
  Bot
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface EnforcementWorkflow {
  id: string;
  protection_record_id: string;
  violation_id?: string;
  status: 'initiated' | 'scanning' | 'violation_detected' | 'legal_action' | 'resolved' | 'certified';
  steps_completed: string[];
  certificate_hash?: string;
  created_at: string;
  metadata: any;
}

interface AITrainingEnforcementEngineProps {
  protectionRecordId?: string;
  onWorkflowComplete?: (certificateHash: string) => void;
}

export default function AITrainingEnforcementEngine({ 
  protectionRecordId, 
  onWorkflowComplete 
}: AITrainingEnforcementEngineProps) {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<EnforcementWorkflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<EnforcementWorkflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeEnforcements: 0,
    certificatesIssued: 0,
    violationsResolved: 0
  });

  useEffect(() => {
    if (user) {
      loadEnforcementWorkflows();
      setupRealtimeUpdates();
    }
  }, [user]);

  const loadEnforcementWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_training_enforcement_workflows')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setWorkflows(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(w => ['scanning', 'violation_detected', 'legal_action'].includes(w.status)).length || 0;
      const certified = data?.filter(w => w.status === 'certified').length || 0;
      const resolved = data?.filter(w => w.status === 'resolved').length || 0;
      
      setStats({
        totalWorkflows: total,
        activeEnforcements: active,
        certificatesIssued: certified,
        violationsResolved: resolved
      });
    } catch (error) {
      console.error('Error loading enforcement workflows:', error);
      toast.error('Failed to load enforcement data');
    }
  };

  const setupRealtimeUpdates = () => {
    const subscription = supabase
      .channel('enforcement_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_training_enforcement_workflows', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          loadEnforcementWorkflows();
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'certified') {
            toast.success('Protection certificate issued with blockchain verification');
            onWorkflowComplete?.(payload.new.certificate_hash);
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const initiateEnforcementWorkflow = async () => {
    if (!protectionRecordId) {
      toast.error('No protection record selected');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('aitpa-core-engine', {
        body: {
          action: 'initiate_enforcement_workflow',
          protection_record_id: protectionRecordId,
          enforcement_level: 'comprehensive',
          auto_legal_action: true,
          certificate_issuance: true
        }
      });

      if (error) throw error;

      setActiveWorkflow(data.workflow);
      toast.success('Closed-loop enforcement initiated');
      loadEnforcementWorkflows();
      
    } catch (error: any) {
      console.error('Error initiating enforcement:', error);
      toast.error(error.message || 'Failed to initiate enforcement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initiated': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'scanning': return <Bot className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'violation_detected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'legal_action': return <Gavel className="h-4 w-4 text-orange-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'certified': return <Award className="h-4 w-4 text-purple-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'initiated': return 10;
      case 'scanning': return 30;
      case 'violation_detected': return 50;
      case 'legal_action': return 75;
      case 'resolved': return 90;
      case 'certified': return 100;
      default: return 0;
    }
  };

  const getStepDescription = (status: string) => {
    switch (status) {
      case 'initiated': return 'Workflow started - preparing AI training scan';
      case 'scanning': return 'Scanning web for unauthorized AI training usage';
      case 'violation_detected': return 'Violations found - preparing legal response';
      case 'legal_action': return 'Legal notices sent - monitoring compliance';
      case 'resolved': return 'Violations resolved - generating certificate';
      case 'certified': return 'Protection certificate issued with blockchain proof';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-purple-600" />
            Closed-loop AI Training Enforcement Engine
          </CardTitle>
          <CardDescription>
            Automated end-to-end protection: Detection → Legal Action → Blockchain Certification
          </CardDescription>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Fully Automated
            </Badge>
            <Badge variant="outline">
              Blockchain Verified
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalWorkflows}</div>
              <div className="text-xs text-muted-foreground">Total Workflows</div>
            </div>
            <div className="text-center p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.activeEnforcements}</div>
              <div className="text-xs text-muted-foreground">Active Enforcements</div>
            </div>
            <div className="text-center p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.violationsResolved}</div>
              <div className="text-xs text-muted-foreground">Violations Resolved</div>
            </div>
            <div className="text-center p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.certificatesIssued}</div>
              <div className="text-xs text-muted-foreground">Certificates Issued</div>
            </div>
          </div>

          {/* Initiate Workflow */}
          {protectionRecordId && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Start Closed-Loop Enforcement
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatically scan for AI training violations, send legal notices, and issue blockchain-verified protection certificates.
              </p>
              <Button 
                onClick={initiateEnforcementWorkflow} 
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Initiating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Initiate Full Enforcement
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Active Workflow Status */}
          {activeWorkflow && (
            <Alert className="border-blue-200 bg-blue-50">
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Active Enforcement Workflow</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activeWorkflow.status)}
                      <span className="text-sm capitalize">{activeWorkflow.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <Progress value={getStatusProgress(activeWorkflow.status)} />
                  <p className="text-sm text-muted-foreground">
                    {getStepDescription(activeWorkflow.status)}
                  </p>
                  {activeWorkflow.certificate_hash && (
                    <div className="bg-purple-100 p-2 rounded text-xs">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Certificate Hash: {activeWorkflow.certificate_hash.slice(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Workflow History */}
          {workflows.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Enforcement Workflows
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <div className="text-sm font-medium capitalize">
                          {workflow.status.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(workflow.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={getStatusProgress(workflow.status)} 
                        className="w-20 h-2" 
                      />
                      {workflow.certificate_hash && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">How the Closed-Loop Works:</h4>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Bot className="h-3 w-3 text-blue-500" />
                  1. AI Detection
                </div>
                <p className="text-muted-foreground">
                  AITPA engine scans for unauthorized AI training usage across the web
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Gavel className="h-3 w-3 text-orange-500" />
                  2. Auto Legal Action
                </div>
                <p className="text-muted-foreground">
                  Automatic DMCA notices and cease & desist letters sent to violators
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Award className="h-3 w-3 text-purple-500" />
                  3. Blockchain Certificate
                </div>
                <p className="text-muted-foreground">
                  Protection certificate issued with immutable blockchain timestamp
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <strong>Beta Notice:</strong> The Closed-Loop AI Training Enforcement Engine is in testing. 
            Legal actions are template-based and may require review. Blockchain certificates are issued on testnet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}