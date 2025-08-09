import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DownloadCloud, Briefcase, Shield, Building2 } from 'lucide-react';
import { generateB2BSalesPackagePDF } from '@/lib/salesPackagePdf';

const B2BSalesPackageDownload: React.FC = () => {
  const handleDownload = () => {
    generateB2BSalesPackagePDF();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">B2B Sales Package</CardTitle>
        </div>
        <CardDescription>
          Comprehensive PDF for enterprise buyers: product, security, SLAs, pricing, ROI, and next steps
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">Enterprise Ready</Badge>
          <Badge variant="secondary" className="text-xs">API & White‑Label</Badge>
          <Badge variant="secondary" className="text-xs">SLA 99.9%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5" />
            Executive summary, four‑layer defense, modules, and architecture
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-primary mt-0.5" />
            Security, compliance, integrations, SLAs, pricing, ROI, case studies
          </li>
        </ul>

        <Button onClick={handleDownload} size="lg" className="w-full">
          <DownloadCloud className="h-5 w-5 mr-2" />
          Download Sales Package (PDF)
        </Button>
      </CardContent>
    </Card>
  );
};

export default B2BSalesPackageDownload;
