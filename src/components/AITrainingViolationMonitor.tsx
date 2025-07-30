import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  ExternalLink, 
  FileX, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AITrainingViolation {
  id: string;
  violation_type: string;
  confidence_score: number;
  source_url?: string;
  source_domain?: string;
  evidence_data: any;
  status: string;
  detected_at: string;
  artwork_id: string;
  legal_action_taken: boolean;
  dmca_notice_id?: string;
  protection_record_id: string;
}

interface AITrainingViolationMonitorProps {
  userId?: string;
  artworkId?: string;
  className?: string;
}

const AITrainingViolationMonitor: React.FC<AITrainingViolationMonitorProps> = ({ 
  userId, 
  artworkId,
  className = '' 
}) => {
  const [violations, setViolations] = useState<AITrainingViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    resolved: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadViolations();
  }, [userId, artworkId]);

  const loadViolations = async () => {
    try {
      let query = supabase
        .from('ai_training_violations')
        .select(`
          *,
          artwork:artwork_id (
            title,
            description
          ),
          protection_record:protection_record_id (
            protection_level,
            protection_methods
          )
        `)
        .order('detected_at', { ascending: false });

      if (artworkId) {
        query = query.eq('artwork_id', artworkId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setViolations(data || []);
      
      // Calculate stats
      const violationData = data || [];
      setStats({
        total: violationData.length,
        pending: violationData.filter(v => v.status === 'pending').length,
        verified: violationData.filter(v => v.status === 'verified').length,
        resolved: violationData.filter(v => v.status === 'resolved').length
      });

    } catch (error) {
      console.error('Failed to load violations:', error);
      toast({
        title: "Error",
        description: "Failed to load AI training violations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateViolationStatus = async (violationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_violations')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', violationId);

      if (error) throw error;

      await loadViolations();
      
      toast({
        title: "Success",
        description: `Violation marked as ${status}`,
      });

    } catch (error) {
      console.error('Failed to update violation:', error);
      toast({
        title: "Error",
        description: "Failed to update violation status",
        variant: "destructive"
      });
    }
  };

  const getViolationTypeIcon = (type: string) => {
    switch (type) {
      case 'unauthorized_training':
        return <Shield className="h-4 w-4" />;
      case 'metadata_stripping':
        return <FileX className="h-4 w-4" />;
      case 'watermark_removal':
        return <Eye className="h-4 w-4" />;
      case 'adversarial_bypass':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getViolationTypeBadge = (type: string) => {
    const config = {
      unauthorized_training: { label: 'Unauthorized Training', variant: 'destructive' as const },
      metadata_stripping: { label: 'Metadata Stripping', variant: 'secondary' as const },
      watermark_removal: { label: 'Watermark Removal', variant: 'secondary' as const },
      adversarial_bypass: { label: 'Adversarial Bypass', variant: 'destructive' as const }
    };

    const { label, variant } = config[type as keyof typeof config] || 
      { label: type.replace('_', ' '), variant: 'secondary' as const };

    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'false_positive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Training Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          AI Training Violations
        </CardTitle>
        
        {/* Stats Summary */}
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            Total: <span className="font-medium">{stats.total}</span>
          </span>
          <span className="text-yellow-600">
            Pending: <span className="font-medium">{stats.pending}</span>
          </span>
          <span className="text-red-600">
            Verified: <span className="font-medium">{stats.verified}</span>
          </span>
          <span className="text-green-600">
            Resolved: <span className="font-medium">{stats.resolved}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {violations.length === 0 ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              No AI training violations detected. Your content appears to be well protected.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {violations.map((violation) => (
              <div 
                key={violation.id}
                className="border rounded-lg p-4 space-y-3 bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getViolationTypeIcon(violation.violation_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        {getViolationTypeBadge(violation.violation_type)}
                        {getStatusIcon(violation.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Detected {new Date(violation.detected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getConfidenceColor(violation.confidence_score)}`}>
                      {violation.confidence_score.toFixed(1)}% confidence
                    </div>
                    {violation.legal_action_taken && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Legal Action Taken
                      </Badge>
                    )}
                  </div>
                </div>

                {violation.source_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-3 w-3" />
                    <a 
                      href={violation.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-xs"
                    >
                      {violation.source_domain || violation.source_url}
                    </a>
                  </div>
                )}

                {violation.evidence_data && Object.keys(violation.evidence_data).length > 0 && (
                  <div className="text-sm">
                    <details className="cursor-pointer">
                      <summary className="text-muted-foreground hover:text-foreground">
                        View Evidence Details
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(violation.evidence_data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {violation.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateViolationStatus(violation.id, 'verified')}
                    >
                      Mark as Verified
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateViolationStatus(violation.id, 'false_positive')}
                    >
                      False Positive
                    </Button>
                  </div>
                )}

                {violation.status === 'verified' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateViolationStatus(violation.id, 'resolved')}
                    >
                      Mark as Resolved
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITrainingViolationMonitor;