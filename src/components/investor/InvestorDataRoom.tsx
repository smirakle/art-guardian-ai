import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Shield, 
  BarChart3, 
  Users, 
  Briefcase,
  ExternalLink,
  Lock,
  CheckCircle
} from 'lucide-react';

const InvestorDataRoom = () => {
  const [accessGranted, setAccessGranted] = useState(false);

  const documents = {
    financial: [
      { name: 'Financial Model & Projections (3-Year)', type: 'Excel', size: '2.4 MB', status: 'ready' },
      { name: 'Unit Economics Analysis', type: 'PDF', size: '1.8 MB', status: 'ready' },
      { name: 'Revenue Model Deep Dive', type: 'PDF', size: '3.2 MB', status: 'ready' },
      { name: 'CAC/LTV Analysis by Channel', type: 'Excel', size: '1.5 MB', status: 'ready' }
    ],
    legal: [
      { name: 'Patent Portfolio (4 Filed, 12 Pending)', type: 'PDF', size: '15.7 MB', status: 'ready' },
      { name: 'Trademark Registrations', type: 'PDF', size: '5.3 MB', status: 'ready' },
      { name: 'Corporate Structure & Cap Table', type: 'PDF', size: '2.1 MB', status: 'ready' },
      { name: 'Terms of Service & Privacy Policy', type: 'PDF', size: '1.9 MB', status: 'ready' }
    ],
    technical: [
      { name: 'Technical Architecture Overview', type: 'PDF', size: '8.4 MB', status: 'ready' },
      { name: 'AI Training Protection Algorithm', type: 'PDF', size: '12.6 MB', status: 'confidential' },
      { name: 'Security & Compliance Report', type: 'PDF', size: '4.7 MB', status: 'ready' },
      { name: 'Scalability Analysis', type: 'PDF', size: '3.8 MB', status: 'ready' }
    ],
    market: [
      { name: 'Market Research & Sizing', type: 'PDF', size: '6.2 MB', status: 'ready' },
      { name: 'Competitive Analysis Matrix', type: 'Excel', size: '2.9 MB', status: 'ready' },
      { name: 'Customer Research & Testimonials', type: 'PDF', size: '4.1 MB', status: 'ready' },
      { name: 'Go-to-Market Strategy', type: 'PDF', size: '5.5 MB', status: 'ready' }
    ]
  };

  const metrics = {
    mrr: '$200',
    users: '50+',
    artworks: '500+',
    dmcaFiled: '25+',
    churn: '2.5%',
    nps: '72'
  };

  const handleDocumentDownload = (docName: string) => {
    // Generate and download document
    const content = `TSMO - ${docName}
    
This is a comprehensive ${docName.toLowerCase()} for TSMO's investor data room.

Generated: ${new Date().toLocaleDateString()}
Confidential & Proprietary Information

For more information, contact:
shirleena.cunningham@tsmowatch.com
+1 (555) 123-4567

© 2025 TSMO. All rights reserved.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMO-${docName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!accessGranted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">TSMO Investor Data Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Access to this data room is restricted to verified investors only.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => setAccessGranted(true)}
                size="lg"
                className="w-full max-w-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Request Access
              </Button>
              <p className="text-sm text-muted-foreground">
                By requesting access, you agree to maintain confidentiality of all materials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">TSMO Investor Data Room</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive due diligence materials for qualified investors
        </p>
        <Badge variant="secondary" className="text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Access Granted - Confidential Materials
        </Badge>
      </div>

      {/* Key Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.mrr}</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.users}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.artworks}</div>
              <div className="text-sm text-muted-foreground">Protected Artworks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.dmcaFiled}</div>
              <div className="text-sm text-muted-foreground">DMCA Filed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.churn}</div>
              <div className="text-sm text-muted-foreground">Monthly Churn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.nps}</div>
              <div className="text-sm text-muted-foreground">Net Promoter Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Library */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        {Object.entries(documents).map(([category, docs]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'confidential' && (
                          <Badge variant="destructive" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Confidential
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocumentDownload(doc.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Investor Relations Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Primary Contact</h3>
            <p className="text-sm text-muted-foreground mb-1">shirleena.cunningham@tsmowatch.com</p>
            <p className="text-sm text-muted-foreground mb-4">+1 (555) 123-4567</p>
            
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Schedule Due Diligence Call
            </Button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Additional Resources</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Live Product Demo</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Customer Reference Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Technical Deep Dive Sessions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDataRoom;