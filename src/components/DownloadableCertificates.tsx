import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Shield, Gavel } from "lucide-react";
import { WatermarkProofGenerator, WatermarkProofData } from "@/lib/watermarkProof";
import { toast } from "sonner";

interface CertificateData {
  fileName?: string;
  artworkId?: string;
  userId?: string;
  watermarkId?: string;
  confidence?: number;
  scanType?: string;
  blockchainHash?: string;
  certificateId?: string;
}

interface DownloadableCertificatesProps {
  hasWatermarkDetection: boolean;
  hasBlockchainRegistration: boolean;
  certificateData: CertificateData;
}

const DownloadableCertificates = ({ 
  hasWatermarkDetection, 
  hasBlockchainRegistration, 
  certificateData 
}: DownloadableCertificatesProps) => {
  
  const downloadWatermarkProof = (format: 'pdf' | 'txt' = 'pdf') => {
    if (!hasWatermarkDetection || !certificateData.watermarkId) return;
    
    const proofData: WatermarkProofData = {
      fileName: certificateData.fileName || 'unknown_file',
      watermarkId: certificateData.watermarkId,
      detectionTimestamp: new Date(),
      confidence: certificateData.confidence || 0,
      userId: certificateData.userId,
      artworkId: certificateData.artworkId,
      scanType: certificateData.scanType || 'analysis'
    };

    const blob = format === 'pdf' 
      ? WatermarkProofGenerator.generateProofCertificate(proofData)
      : WatermarkProofGenerator.generateTextProof(proofData);
    
    WatermarkProofGenerator.downloadProof(blob, certificateData.fileName || 'watermark_detection', format);
    toast.success(`Watermark proof ${format.toUpperCase()} downloaded successfully!`);
  };

  const downloadBlockchainCertificate = () => {
    if (!hasBlockchainRegistration || !certificateData.certificateId) return;

    const blockchainData = {
      certificateId: certificateData.certificateId,
      blockchainHash: certificateData.blockchainHash,
      artworkId: certificateData.artworkId,
      downloadTimestamp: new Date().toISOString(),
      verificationUrl: `${window.location.origin}/certificate/${certificateData.certificateId}`
    };

    const blob = new Blob([JSON.stringify(blockchainData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMO-Blockchain-Certificate-${certificateData.certificateId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Blockchain certificate downloaded successfully!');
  };

  const openCertificatePage = () => {
    if (certificateData.certificateId) {
      window.open(`/certificate/${certificateData.certificateId}`, '_blank');
    }
  };

  // Don't render if no certificates are available
  if (!hasWatermarkDetection && !hasBlockchainRegistration) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-primary" />
          Downloadable Certificates for Court Evidence
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Legally recognized proof documents for intellectual property protection
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Watermark Detection Certificates */}
        {hasWatermarkDetection && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Watermark Detection Proof</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Cryptographic proof of watermark presence in your artwork, admissible in court proceedings
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => downloadWatermarkProof('pdf')}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-1" />
                PDF Certificate
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => downloadWatermarkProof('txt')}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Text Evidence
              </Button>
            </div>
          </div>
        )}

        {/* Blockchain Registration Certificates */}
        {hasBlockchainRegistration && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Blockchain Ownership Certificate</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Immutable blockchain record proving ownership and creation timestamp
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={downloadBlockchainCertificate}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Download JSON
              </Button>
              <Button 
                size="sm" 
                variant="default" 
                onClick={openCertificatePage}
                className="flex-1"
              >
                <FileText className="w-3 h-3 mr-1" />
                View Certificate
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
          <strong>Legal Notice:</strong> These certificates provide cryptographic proof of artwork ownership and watermark detection. 
          They are designed to be admissible as evidence in intellectual property disputes and copyright infringement cases.
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadableCertificates;