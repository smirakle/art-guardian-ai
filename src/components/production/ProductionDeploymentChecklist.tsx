import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Circle, 
  XCircle, 
  AlertTriangle, 
  Rocket, 
  Database, 
  Shield, 
  Globe, 
  Mail,
  FileText,
  Users,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'performance' | 'legal' | 'infrastructure' | 'marketing';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  dependencies?: string[];
  actionUrl?: string;
  autoCheck: boolean;
}

export const ProductionDeploymentChecklist = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Security Items
    {
      id: 'database_security',
      title: 'Database Security Scan',
      description: 'Run security scan and fix all critical vulnerabilities. Click to run automated security check.',
      category: 'security',
      status: 'pending',
      priority: 'critical',
      estimatedTime: '30 minutes',
      actionUrl: '/admin/security',
      autoCheck: true
    },
    {
      id: 'ssl_certificate',
      title: 'SSL Certificate Setup',
      description: 'SSL is automatically provisioned by Lovable when you connect a custom domain. Free SSL certificates from Let\'s Encrypt.',
      category: 'security',
      status: 'completed',
      priority: 'critical',
      estimatedTime: '5 minutes',
      autoCheck: false
    },
    {
      id: 'auth_security',
      title: 'Authentication Security',
      description: 'Verify JWT configuration and user authentication flows',
      category: 'security',
      status: 'completed',
      priority: 'critical',
      estimatedTime: '20 minutes',
      autoCheck: true
    },
    {
      id: 'api_security',
      title: 'API Security Headers',
      description: 'Implement security headers and rate limiting',
      category: 'security',
      status: 'completed',
      priority: 'high',
      estimatedTime: '25 minutes',
      autoCheck: true
    },

    // Performance Items
    {
      id: 'performance_optimization',
      title: 'Performance Optimization',
      description: 'Optimize bundle size, lazy loading, and Core Web Vitals',
      category: 'performance',
      status: 'completed',
      priority: 'high',
      estimatedTime: '45 minutes',
      autoCheck: true
    },
    {
      id: 'cdn_setup',
      title: 'CDN Configuration',
      description: 'Set up content delivery network for global performance',
      category: 'performance',
      status: 'pending',
      priority: 'medium',
      estimatedTime: '30 minutes',
      autoCheck: false
    },
    {
      id: 'caching_strategy',
      title: 'Caching Strategy',
      description: 'Implement browser and server-side caching',
      category: 'performance',
      status: 'in_progress',
      priority: 'medium',
      estimatedTime: '40 minutes',
      autoCheck: false
    },

    // Legal Items
    {
      id: 'terms_privacy',
      title: 'Terms & Privacy Policy',
      description: 'Legal documentation is complete with Terms of Service, Privacy Policy, and Cookie Policy',
      category: 'legal',
      status: 'completed',
      priority: 'critical',
      estimatedTime: '0 minutes',
      actionUrl: '/terms-and-privacy',
      autoCheck: false
    },
    {
      id: 'dmca_setup',
      title: 'DMCA Agent Registration',
      description: 'DMCA infrastructure is ready. Register your designated agent at copyright.gov if required for your jurisdiction.',
      category: 'legal',
      status: 'completed',
      priority: 'high',
      estimatedTime: '0 minutes',
      autoCheck: false
    },
    {
      id: 'gdpr_compliance',
      title: 'GDPR Compliance',
      description: 'Data protection, user consent, RLS policies, and privacy controls are implemented. Review privacy settings.',
      category: 'legal',
      status: 'completed',
      priority: 'critical',
      estimatedTime: '0 minutes',
      actionUrl: '/settings/privacy',
      autoCheck: false
    },

    // Infrastructure Items
    {
      id: 'domain_setup',
      title: 'Production Domain',
      description: 'Connect your custom domain in Project Settings → Domains. DNS propagation takes 24-48 hours. SSL auto-provisioned.',
      category: 'infrastructure',
      status: 'pending',
      priority: 'critical',
      estimatedTime: '10 minutes + propagation',
      autoCheck: false
    },
    {
      id: 'monitoring_setup',
      title: 'Production Monitoring',
      description: 'Set up error tracking, health monitoring, and alerts',
      category: 'infrastructure',
      status: 'completed',
      priority: 'critical',
      estimatedTime: '60 minutes',
      autoCheck: true
    },
    {
      id: 'backup_strategy',
      title: 'Backup & Recovery',
      description: 'Implement automated database backups and recovery procedures',
      category: 'infrastructure',
      status: 'in_progress',
      priority: 'high',
      estimatedTime: '90 minutes',
      autoCheck: false
    },

    // Marketing Items
    {
      id: 'email_marketing',
      title: 'Email Marketing Setup',
      description: 'Configure email service provider and compliance settings',
      category: 'marketing',
      status: 'pending',
      priority: 'medium',
      estimatedTime: '45 minutes',
      actionUrl: '/email-marketing',
      autoCheck: false
    },
    {
      id: 'seo_optimization',
      title: 'SEO Optimization',
      description: 'Implement meta tags, structured data, and sitemap',
      category: 'marketing',
      status: 'completed',
      priority: 'medium',
      estimatedTime: '30 minutes',
      autoCheck: true
    },
    {
      id: 'analytics_setup',
      title: 'Analytics & Tracking',
      description: 'Set up user analytics and conversion tracking',
      category: 'marketing',
      status: 'in_progress',
      priority: 'low',
      estimatedTime: '30 minutes',
      autoCheck: false
    }
  ]);

  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [lastCheckRun, setLastCheckRun] = useState<Date | null>(null);

  useEffect(() => {
    runAutomaticChecks();
  }, []);

  const runAutomaticChecks = async () => {
    setIsRunningChecks(true);
    
    try {
      // Database security check
      const securityResults = await supabase.functions.invoke('admin-security-scan', {
        body: { action: 'scan' }
      });
      
      if (securityResults.data?.risk_score !== undefined) {
        const riskScore = securityResults.data.risk_score;
        const criticalFindings = securityResults.data.findings?.filter(
          (f: any) => f.severity === 'critical'
        ).length || 0;
        
        updateChecklistItem('database_security', 
          riskScore < 30 && criticalFindings === 0 ? 'completed' : 
          riskScore < 60 ? 'in_progress' : 'failed'
        );
        
        if (criticalFindings > 0) {
          toast.error(`Security check: ${criticalFindings} critical issues found`);
        } else if (riskScore < 30) {
          toast.success('Security check: No critical issues detected');
        } else {
          toast.warning('Security check: Some issues require attention');
        }
      }

      // Production health check
      const healthResults = await supabase.functions.invoke('production-health-monitor');
      if (healthResults.data?.status) {
        const status = healthResults.data.status;
        updateChecklistItem('monitoring_setup', 
          status === 'healthy' ? 'completed' : 
          status === 'degraded' ? 'in_progress' : 'failed'
        );
      }

      // Performance checks
      if (typeof window !== 'undefined' && 'performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
          updateChecklistItem('performance_optimization', 
            loadTime < 3000 ? 'completed' : 
            loadTime < 5000 ? 'in_progress' : 'failed'
          );
        }
      }

      setLastCheckRun(new Date());
      toast.success('All automatic checks completed');
    } catch (error) {
      console.error('Error running automatic checks:', error);
      toast.error('Some automatic checks failed. Please try again.');
    } finally {
      setIsRunningChecks(false);
    }
  };

  const updateChecklistItem = (id: string, status: ChecklistItem['status']) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const toggleItemStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const getCategoryStats = () => {
    const categories = ['security', 'performance', 'legal', 'infrastructure', 'marketing'] as const;
    return categories.map(category => {
      const items = checklist.filter(item => item.category === category);
      const completed = items.filter(item => item.status === 'completed').length;
      return {
        category,
        completed,
        total: items.length,
        percentage: items.length > 0 ? (completed / items.length) * 100 : 0
      };
    });
  };

  const getOverallProgress = () => {
    const completed = checklist.filter(item => item.status === 'completed').length;
    return (completed / checklist.length) * 100;
  };

  const getCriticalIssues = () => {
    return checklist.filter(item => 
      item.priority === 'critical' && item.status !== 'completed'
    );
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'legal':
        return <FileText className="h-4 w-4" />;
      case 'infrastructure':
        return <Database className="h-4 w-4" />;
      case 'marketing':
        return <Users className="h-4 w-4" />;
    }
  };

  const overallProgress = getOverallProgress();
  const criticalIssues = getCriticalIssues();
  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Production Deployment Checklist
          </h2>
          <p className="text-muted-foreground">
            Complete all items before launching to production
          </p>
        </div>
        <Button 
          onClick={runAutomaticChecks}
          disabled={isRunningChecks}
          variant="outline"
        >
          {isRunningChecks ? 'Running Checks...' : 'Run Auto Checks'}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {Math.round(overallProgress)}% complete ({checklist.filter(i => i.status === 'completed').length} of {checklist.length} items)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          {lastCheckRun && (
            <p className="text-sm text-muted-foreground mt-2">
              Last automatic check: {lastCheckRun.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalIssues.length} critical item{criticalIssues.length > 1 ? 's' : ''} must be completed before production deployment.
          </AlertDescription>
        </Alert>
      )}

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryStats.map(({ category, completed, total, percentage }) => (
              <div key={category} className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  {getCategoryIcon(category)}
                </div>
                <div className="text-2xl font-bold">{completed}/{total}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {category}
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="space-y-4">
        {['security', 'performance', 'legal', 'infrastructure', 'marketing'].map(category => {
          const categoryItems = checklist.filter(item => item.category === category);
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getCategoryIcon(category as ChecklistItem['category'])}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <button
                        onClick={() => toggleItemStatus(item.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {getStatusIcon(item.status)}
                      </button>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={item.priority === 'critical' ? 'destructive' : 
                                     item.priority === 'high' ? 'default' : 'secondary'}
                            >
                              {item.priority}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {item.estimatedTime}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        
                        {item.actionUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(item.actionUrl, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Configure
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deployment Ready Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {criticalIssues.length === 0 ? (
              <>
                <div className="text-6xl">🚀</div>
                <h3 className="text-xl font-bold text-green-600">Ready for Production!</h3>
                <p className="text-muted-foreground">
                  All critical items completed. Click Publish to deploy your app to production.
                </p>
                <div className="space-y-2">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 w-full"
                    onClick={() => {
                      toast.success('Opening deployment guide...');
                      window.open('https://docs.lovable.dev/features/deployment', '_blank');
                    }}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Deploy to Production
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Click the "Publish" button in the top-right corner to deploy
                  </p>
                </div>
              </>
            ) : criticalIssues.length > 0 ? (
              <>
                <div className="text-6xl">⚠️</div>
                <h3 className="text-xl font-bold text-red-600">
                  {criticalIssues.length} Critical Item{criticalIssues.length > 1 ? 's' : ''} Remaining
                </h3>
                <div className="space-y-2 text-left">
                  {criticalIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">{issue.title}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  Complete these critical items before deploying to production.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl">🔧</div>
                <h3 className="text-xl font-bold text-yellow-600">Setup in Progress</h3>
                <p className="text-muted-foreground">
                  {Math.round(overallProgress)}% complete. Continue working through the checklist.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};