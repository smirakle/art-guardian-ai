import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Shield, 
  Webhook, 
  Code, 
  Zap, 
  Globe, 
  FileText, 
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Users,
  Database
} from 'lucide-react';

interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'complete' | 'in-progress' | 'planned';
  lastUpdated: string;
  readTime: string;
  audience: string[];
  category: 'api' | 'security' | 'integration' | 'compliance';
}

const documentationSections: DocumentationSection[] = [
  {
    id: 'realtime-api',
    title: 'Enterprise Real-time API',
    description: 'Complete WebSocket API documentation with authentication, event types, and enterprise-grade monitoring capabilities.',
    icon: Zap,
    status: 'complete',
    lastUpdated: '2024-01-15',
    readTime: '25 min',
    audience: ['Developers', 'Solutions Architects'],
    category: 'api'
  },
  {
    id: 'webhook-system',
    title: 'Enterprise Webhook System',
    description: 'Comprehensive webhook setup, security, retry logic, monitoring, and enterprise orchestration features.',
    icon: Webhook,
    status: 'complete',
    lastUpdated: '2024-01-15',
    readTime: '30 min',
    audience: ['Developers', 'DevOps Engineers'],
    category: 'api'
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance Framework',
    description: 'SOC 2, GDPR, enterprise security standards, compliance certifications, and audit procedures.',
    icon: Shield,
    status: 'complete',
    lastUpdated: '2024-01-15',
    readTime: '45 min',
    audience: ['Security Teams', 'Compliance Officers', 'C-Suite'],
    category: 'security'
  },
  {
    id: 'integration-guides',
    title: 'Enterprise Integration Guides',
    description: 'Step-by-step integration examples, enterprise workflow patterns, and platform-specific implementations.',
    icon: Code,
    status: 'complete',
    lastUpdated: '2024-01-15',
    readTime: '35 min',
    audience: ['Developers', 'Solutions Architects', 'IT Teams'],
    category: 'integration'
  },
  {
    id: 'sla-disaster-recovery',
    title: 'SLA & Disaster Recovery',
    description: 'Service level agreements, disaster recovery procedures, business continuity planning, and failover strategies.',
    icon: Database,
    status: 'in-progress',
    lastUpdated: '2024-01-10',
    readTime: '20 min',
    audience: ['IT Operations', 'Business Continuity', 'Executive Teams'],
    category: 'compliance'
  },
  {
    id: 'sdk-libraries',
    title: 'Enterprise SDK Documentation',
    description: 'Client libraries for major programming languages with advanced features and enterprise patterns.',
    icon: FileText,
    status: 'in-progress',
    lastUpdated: '2024-01-08',
    readTime: '40 min',
    audience: ['Developers', 'Technical Leads'],
    category: 'integration'
  },
  {
    id: 'multi-tenancy',
    title: 'Multi-tenancy & White-label',
    description: 'Custom branding, tenant isolation, partnership features, and white-label deployment guides.',
    icon: Users,
    status: 'planned',
    lastUpdated: '2024-01-05',
    readTime: '30 min',
    audience: ['Partners', 'Enterprise Customers', 'Business Development'],
    category: 'integration'
  },
  {
    id: 'advanced-use-cases',
    title: 'Advanced Enterprise Use Cases',
    description: 'Real-world implementation examples, best practices, and complex enterprise workflow patterns.',
    icon: Globe,
    status: 'planned',
    lastUpdated: '2024-01-05',
    readTime: '50 min',
    audience: ['Solutions Architects', 'Technical Consultants'],
    category: 'integration'
  }
];

const EnterpriseDocumentationViewer = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSections = selectedCategory === 'all' 
    ? documentationSections 
    : documentationSections.filter(section => section.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'planned':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'planned':
        return <Badge variant="outline">Planned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Documentation</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive enterprise-ready documentation for real-time APIs, webhooks, security compliance, 
          and integration guides. Built for Fortune 500 companies and enterprise deployments.
        </p>
        
        {/* Key Stats */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Complete Guides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">2</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">150+</div>
            <div className="text-sm text-muted-foreground">Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">SLA Uptime</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Documentation</TabsTrigger>
          <TabsTrigger value="api">APIs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((section) => (
              <Card key={section.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(section.status)}
                        {getStatusBadge(section.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {section.description}
                </p>

                {/* Metadata */}
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(section.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Read Time:</span>
                    <span>{section.readTime}</span>
                  </div>
                  <div>
                    <span className="block mb-1">Target Audience:</span>
                    <div className="flex flex-wrap gap-1">
                      {section.audience.map((audience) => (
                        <Badge key={audience} variant="outline" className="text-xs">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Actions */}
                <div className="flex gap-2">
                  {section.status === 'complete' ? (
                    <>
                      <Button size="sm" className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read Documentation
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </>
                  ) : section.status === 'in-progress' ? (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Preview Draft
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enterprise Features Highlight */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Enterprise-Ready Features</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">Security & Compliance</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• SOC 2 Type II Certified</li>
              <li>• GDPR & CCPA Compliant</li>
              <li>• Enterprise SSO Integration</li>
              <li>• Advanced Encryption (AES-256)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Performance & Scale</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 99.95% Uptime SLA</li>
              <li>• Global CDN & Edge Computing</li>
              <li>• Auto-scaling Infrastructure</li>
              <li>• Sub-100ms API Response Times</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Integration & Support</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• RESTful APIs & WebSockets</li>
              <li>• Enterprise Webhooks</li>
              <li>• 24/7 Enterprise Support</li>
              <li>• Dedicated Success Manager</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Contact Enterprise Sales
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Download Enterprise Datasheet
          </Button>
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links & Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Code className="h-5 w-5" />
            <span className="font-medium">API Reference</span>
            <span className="text-xs text-muted-foreground">Complete API docs</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">SDK Downloads</span>
            <span className="text-xs text-muted-foreground">Client libraries</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">Developer Forum</span>
            <span className="text-xs text-muted-foreground">Community support</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <ExternalLink className="h-5 w-5" />
            <span className="font-medium">Status Page</span>
            <span className="text-xs text-muted-foreground">System status</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EnterpriseDocumentationViewer;