import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Clock, AlertTriangle, CheckCircle, Building2 } from 'lucide-react';

interface ComplianceNoticeProps {
  serviceType: 'government_filing' | 'dmca_filing' | 'legal_templates';
}

const ComplianceNotice: React.FC<ComplianceNoticeProps> = ({ serviceType }) => {
  const getServiceInfo = () => {
    switch (serviceType) {
      case 'government_filing':
        return {
          title: 'Government Filing Compliance',
          icon: Building2,
          coverage: 'Professional Liability Insurance: $2M',
          compliance: ['SOC 2 Type II', 'GDPR Compliant', 'CCPA Compliant', 'HIPAA Compliant']
        };
      case 'dmca_filing':
        return {
          title: 'DMCA Filing Compliance',
          icon: Shield,
          coverage: 'Errors & Omissions Insurance: $1M',
          compliance: ['DMCA Safe Harbor', 'Copyright Act Compliant', 'Platform TOS Compliant']
        };
      case 'legal_templates':
        return {
          title: 'Legal Templates Compliance',
          icon: FileText,
          coverage: 'Professional Liability Insurance: $1M',
          compliance: ['Bar Association Reviewed', 'State Law Compliant', 'Federal Law Compliant']
        };
      default:
        return {
          title: 'Service Compliance',
          icon: Shield,
          coverage: 'Standard Coverage',
          compliance: ['Industry Standard']
        };
    }
  };

  const serviceInfo = getServiceInfo();
  const IconComponent = serviceInfo.icon;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <IconComponent className="h-5 w-5" />
          {serviceInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insurance Coverage */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Insurance Coverage:</strong> {serviceInfo.coverage}
          </AlertDescription>
        </Alert>

        {/* Compliance Certifications */}
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">Compliance Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {serviceInfo.compliance.map((cert, index) => (
              <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        {/* Service Standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>24/7 Monitoring</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>99.9% Uptime SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Audit Trail Maintained</span>
          </div>
        </div>

        {/* Legal Disclaimers */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-xs">
            <strong>Important:</strong> This service provides administrative assistance only. 
            We are not attorneys and do not provide legal advice. Results are not guaranteed. 
            For complex legal matters, consult with a qualified attorney in your jurisdiction.
          </AlertDescription>
        </Alert>

        {/* Data Security */}
        <div className="text-xs text-blue-700">
          <strong>Data Security:</strong> All documents are encrypted in transit and at rest using AES-256 encryption. 
          Access logs are maintained for compliance audits. Data retention policies comply with applicable regulations.
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceNotice;