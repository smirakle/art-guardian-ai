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
      description: 'Fix all critical and high-priority database security warnings',
      category: 'security',
      status: 'pending',
      priority: 'critical',
      estimatedTime: '30 minutes',
      autoCheck: true
    },
    {
      id: 'ssl_certificate',
      title: 'SSL Certificate Setup',
      description: 'Configure SSL/TLS certificate for secure HTTPS connections',
      category: 'security',
      status: 'pending',
      priority: 'critical',
      estimatedTime: '15 minutes',
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
      description: 'Finalize legal documentation and compliance policies',
      category: 'legal',
      status: 'completed',
      priority: 'critical',
      estimatedTime: '60 minutes',
      actionUrl: '/terms-and-privacy',
      autoCheck: false
    },
    {
      id: 'dmca_setup',
      title: 'DMCA Agent Registration',
      description: 'Register DMCA agent with copyright office',
      category: 'legal',
      status: 'pending',
      priority: 'high',
      estimatedTime: '120 minutes',
      autoCheck: false
    },
    {
      id: 'gdpr_compliance',
      title: 'GDPR Compliance',
      description: 'Implement data protection and user consent mechanisms',
      category: 'legal',
      status: 'in_progress',
      priority: 'critical',
      estimatedTime: '90 minutes',
      autoCheck: false
    },

    // Infrastructure Items
    {
      id: 'domain_setup',
      title: 'Production Domain',
      description: 'Configure custom domain and DNS settings',
      category: 'infrastructure',
      status: 'pending',
      priority: 'critical',
      estimatedTime: '45 minutes',
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
      const securityResults = await supabase.functions.invoke('production-health-monitor');
      if (securityResults.data?.security) {
        updateChecklistItem('database_security', 
          securityResults.data.security.score > 85 ? 'completed' : 'failed'
        );
      }

      // Performance checks
      if (typeof window !== 'undefined' && 'performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        updateChecklistItem('performance_optimization', loadTime < 3000 ? 'completed' : 'in_progress');
      }

      setLastCheckRun(new Date());
      toast.success('Automatic checks completed');
    } catch (error) {
      console.error('Error running automatic checks:', error);
      toast.error('Some automatic checks failed');
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
            {overallProgress === 100 ? (
              <>
                <div className="text-6xl">🚀</div>
                <h3 className="text-xl font-bold text-green-600">Ready for Production!</h3>
                <p className="text-muted-foreground">
                  All checklist items have been completed. Your application is ready for production deployment.
                </p>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Deploy to Production
                </Button>
              </>
            ) : criticalIssues.length > 0 ? (
              <>
                <div className="text-6xl">⚠️</div>
                <h3 className="text-xl font-bold text-red-600">Critical Issues Found</h3>
                <p className="text-muted-foreground">
                  Please resolve all critical issues before deploying to production.
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