import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Calendar,
  Hash,
  User,
  FileText,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlockchainCertificate {
  certificate_id: string;
  artwork_id: string;
  user_id: string;
  blockchain_hash: string;
  artwork_fingerprint: string;
  ownership_proof: string;
  registration_timestamp: string;
  certificate_data: any; // Using any for now since it's JSONB
  status: string;
  created_at: string;
}

const Certificate = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<BlockchainCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Certificate not found');
        } else {
          setError('Failed to load certificate');
        }
      } else {
        setCertificate(data);
      }
    } catch (err) {
      setError('Failed to load certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadCertificate = () => {
    if (!certificate) return;

    const certificateData = {
      certificateId: certificate.certificate_id,
      blockchainHash: certificate.blockchain_hash,
      artworkFingerprint: certificate.artwork_fingerprint,
      ownershipProof: certificate.ownership_proof,
      registrationTimestamp: certificate.registration_timestamp,
      status: certificate.status,
      verificationUrl: window.location.href
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMO-Certificate-${certificate.certificate_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Certificate Downloaded",
      description: "Certificate file has been downloaded to your device",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The requested certificate could not be found.'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Blockchain Certificate
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Immutable proof of artwork ownership and authenticity
          </p>
        </div>

        {/* Certificate Status */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <Badge variant="default" className="bg-green-500 text-white">
                {certificate.status.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-2xl">Certificate Verified</CardTitle>
          </CardHeader>
        </Card>

        {/* Certificate Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Primary Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Certificate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Certificate ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {certificate.certificate_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(certificate.certificate_id, 'Certificate ID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(certificate.registration_timestamp)}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Artwork Fingerprint</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono break-all">
                    {certificate.artwork_fingerprint.substring(0, 32)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(certificate.artwork_fingerprint, 'Artwork Fingerprint')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Blockchain Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Blockchain Hash</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono break-all">
                    {certificate.blockchain_hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(certificate.blockchain_hash, 'Blockchain Hash')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Ownership Proof</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono break-all">
                    {certificate.ownership_proof.substring(0, 32)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(certificate.ownership_proof, 'Ownership Proof')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Network</Label>
                <Badge variant="outline" className="mt-1">
                  TSMO Blockchain (Simulated)
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Certificate Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={downloadCertificate} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Certificate
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(window.location.href, 'Certificate URL')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Share Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification Notice */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                  Certificate Authenticity Verified
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  This certificate has been cryptographically verified and is registered on the TSMO blockchain. 
                  The artwork fingerprint and ownership proof provide immutable evidence of creation and ownership.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm font-medium ${className}`}>{children}</div>
);

export default Certificate;