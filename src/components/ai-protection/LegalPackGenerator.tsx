import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Gavel, Shield, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Violation {
  id: string;
  violation_type: string;
  source_url: string;
  source_domain: string;
  confidence_score: number;
  status: string;
  detected_at: string;
  evidence_data: any;
}

interface LegalPackGeneratorProps {
  violation: Violation;
  onPackGenerated?: () => void;
}

export default function LegalPackGenerator({ violation, onPackGenerated }: LegalPackGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<{
    id: string;
    documents: string[];
    blockchain_hash?: string;
    timestamp: string;
  } | null>(null);

  const generateLegalPack = async () => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('automated-legal-workflow', {
        body: {
          violation_id: violation.id,
          action: 'generate_legal_pack',
          include_evidence: true,
          blockchain_timestamp: true,
          documents: [
            'cease_desist',
            'dmca_notice',
            'evidence_report',
            'violation_summary'
          ]
        }
      });

      if (error) throw error;

      setLastGenerated({
        id: data.pack_id,
        documents: data.documents_generated,
        blockchain_hash: data.blockchain_hash,
        timestamp: new Date().toISOString()
      });

      toast.success('Legal pack generated and blockchain-timestamped');
      onPackGenerated?.();
      
    } catch (error: any) {
      console.error('Error generating legal pack:', error);
      toast.error(error.message || 'Failed to generate legal pack');
    } finally {
      setGenerating(false);
    }
  };

  const downloadLegalPack = async () => {
    if (!lastGenerated) return;

    try {
      const { data, error } = await supabase.functions.invoke('automated-legal-workflow', {
        body: {
          action: 'download_legal_pack',
          pack_id: lastGenerated.id
        }
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([data.zip_data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal_pack_${violation.id}_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Legal pack downloaded');
    } catch (error: any) {
      console.error('Error downloading legal pack:', error);
      toast.error('Failed to download legal pack');
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-amber-600" />
          Instant Legal Pack Generation
        </CardTitle>
        <CardDescription>
          Generate court-ready legal documents with blockchain evidence notarization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Violation Type:</span>
            <p className="text-muted-foreground">{violation.violation_type}</p>
          </div>
          <div>
            <span className="font-medium">Source:</span>
            <p className="text-muted-foreground">{violation.source_domain}</p>
          </div>
          <div>
            <span className="font-medium">Confidence:</span>
            <p className="text-muted-foreground">{Math.round(violation.confidence_score * 100)}%</p>
          </div>
          <div>
            <span className="font-medium">Detected:</span>
            <p className="text-muted-foreground">{new Date(violation.detected_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-background/60 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Legal Pack Includes:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Cease & Desist Letter
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              DMCA Takedown Notice
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Evidence Report
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Blockchain Timestamp
            </div>
          </div>
        </div>

        {lastGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Pack Generated</p>
                <p className="text-xs text-green-600">
                  {lastGenerated.documents.length} documents • 
                  {lastGenerated.blockchain_hash && ' Blockchain verified • '}
                  {new Date(lastGenerated.timestamp).toLocaleString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadLegalPack}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            {lastGenerated.blockchain_hash && (
              <div className="mt-2 p-2 bg-green-100/50 rounded text-xs">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Blockchain Hash: {lastGenerated.blockchain_hash.slice(0, 16)}...
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={generateLegalPack}
            disabled={generating}
            className="flex-1"
          >
            {generating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Gavel className="h-4 w-4 mr-2" />
                Generate Legal Pack
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>Beta Notice:</strong> Legal pack generation is in testing. Documents are templates and may require lawyer review before filing.
        </div>
      </CardContent>
    </Card>
  );
}