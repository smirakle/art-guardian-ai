import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Download, Share, QrCode, CheckCircle } from 'lucide-react';

interface CertificateProps {
  certificate: {
    certificate_id: string;
    protected_file: string;
    protection_level: string;
    methods_applied: string[];
    issued_at: string;
    valid_until: string;
    blockchain_hash: string;
    issuer: string;
  };
}

const AIProtectionCertificate: React.FC<CertificateProps> = ({ certificate }) => {
  const downloadCertificate = () => {
    const certData = {
      ...certificate,
      verification_url: `https://tsmowatch.com/verify/${certificate.certificate_id}`,
      qr_code: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" dy="0.3em">${certificate.certificate_id}</text></svg>`)}`
    };
    
    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-protection-certificate-${certificate.certificate_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCertificate = () => {
    const shareUrl = `https://tsmowatch.com/verify/${certificate.certificate_id}`;
    if (navigator.share) {
      navigator.share({
        title: 'AI Training Protection Certificate',
        text: `This content is protected against unauthorized AI training`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-primary">
      <CardHeader className="text-center bg-primary/5">
        <div className="flex justify-center mb-4">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          AI Training Protection Certificate
        </CardTitle>
        <p className="text-muted-foreground">
          Official certification of content protection
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Certificate ID */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Certificate ID</p>
          <p className="font-mono text-lg font-semibold">{certificate.certificate_id}</p>
        </div>

        {/* Protected File Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Protected File</p>
            <p className="font-medium">{certificate.protected_file}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Protection Level</p>
            <Badge variant="secondary" className="mt-1">
              {certificate.protection_level.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Protection Methods */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Protection Methods Applied</p>
          <div className="flex flex-wrap gap-2">
            {certificate.methods_applied.map((method, index) => (
              <Badge key={index} variant="outline">
                <CheckCircle className="h-3 w-3 mr-1" />
                {method.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Issued</p>
            <p className="font-medium">
              {new Date(certificate.issued_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valid Until</p>
            <p className="font-medium">
              {new Date(certificate.valid_until).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="bg-secondary/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="font-medium">Blockchain Verified</p>
          </div>
          <p className="text-sm text-muted-foreground">Hash:</p>
          <p className="font-mono text-xs break-all">{certificate.blockchain_hash}</p>
        </div>

        {/* Issuer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Issued by</p>
          <p className="font-semibold text-primary">{certificate.issuer}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center pt-4">
          <Button variant="outline" onClick={downloadCertificate}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={shareCertificate}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </div>

        {/* Verification Notice */}
        <div className="text-center text-xs text-muted-foreground">
          <p>This certificate can be verified at:</p>
          <p className="font-mono">https://tsmowatch.com/verify/{certificate.certificate_id}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProtectionCertificate;