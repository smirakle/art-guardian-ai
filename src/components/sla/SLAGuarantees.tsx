import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Zap, Shield, Users, AlertTriangle } from "lucide-react";

interface SLAMetric {
  name: string;
  professional: string;
  enterprise: string;
  icon: React.ComponentType<any>;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const slaMetrics: SLAMetric[] = [
  {
    name: "Service Uptime",
    professional: "99.5%",
    enterprise: "99.9%",
    icon: Shield,
    description: "Guaranteed service availability with automatic failover",
    priority: 'high'
  },
  {
    name: "Support Response Time",
    professional: "4 hours",
    enterprise: "1 hour",
    icon: Clock,
    description: "Maximum time to first response for support tickets",
    priority: 'high'
  },
  {
    name: "Critical Issue Resolution",
    professional: "24 hours",
    enterprise: "8 hours",
    icon: AlertTriangle,
    description: "Time to resolve critical system issues affecting your service",
    priority: 'high'
  },
  {
    name: "Scan Completion Time",
    professional: "≤ 2 hours",
    enterprise: "≤ 30 minutes",
    icon: Zap,
    description: "Maximum time for monitoring scans to complete processing",
    priority: 'medium'
  },
  {
    name: "API Response Time",
    professional: "≤ 500ms",
    enterprise: "≤ 200ms",
    icon: Zap,
    description: "Average response time for API calls (95th percentile)",
    priority: 'medium'
  },
  {
    name: "Data Backup Recovery",
    professional: "24 hours",
    enterprise: "4 hours",
    icon: Shield,
    description: "Maximum time to restore data from backups if needed",
    priority: 'low'
  }
];

interface SLAGuaranteesProps {
  showComparison?: boolean;
  plan?: 'professional' | 'enterprise';
}

export const SLAGuarantees = ({ showComparison = true, plan }: SLAGuaranteesProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!showComparison && plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            SLA Guarantees - {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </CardTitle>
          <CardDescription>
            Our service level commitments for your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slaMetrics.map((metric) => {
              const IconComponent = metric.icon;
              const value = metric[plan];
              
              return (
                <div key={metric.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">{metric.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(metric.priority)}>
                      {metric.priority}
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      {value}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Service Level Agreement (SLA) Guarantees
        </CardTitle>
        <CardDescription>
          Committed performance standards for Professional and Enterprise plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Metric</th>
                <th className="text-center py-3 px-2 font-medium">Professional</th>
                <th className="text-center py-3 px-2 font-medium">Enterprise</th>
                <th className="text-center py-3 px-2 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {slaMetrics.map((metric) => {
                const IconComponent = metric.icon;
                
                return (
                  <tr key={metric.name} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-sm text-muted-foreground">{metric.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <Badge variant="outline" className="font-mono">
                        {metric.professional}
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-2">
                      <Badge variant="secondary" className="font-mono">
                        {metric.enterprise}
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-2">
                      <Badge variant="outline" className={getPriorityColor(metric.priority)}>
                        {metric.priority}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">SLA Guarantees Include:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Monthly service credits for any SLA breaches</li>
                <li>• 24/7 system monitoring and alerting</li>
                <li>• Automatic incident notifications</li>
                <li>• Detailed monthly SLA compliance reports</li>
                <li>• Escalation procedures for critical issues</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};