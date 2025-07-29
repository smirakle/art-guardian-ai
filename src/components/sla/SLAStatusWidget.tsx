import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Clock, TrendingUp, Shield } from "lucide-react";

interface SLAStatus {
  metric: string;
  current: number;
  target: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
  description: string;
}

interface SLAStatusWidgetProps {
  plan: 'professional' | 'enterprise';
  compact?: boolean;
}

export const SLAStatusWidget = ({ plan, compact = false }: SLAStatusWidgetProps) => {
  const [slaData, setSlaData] = useState<SLAStatus[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    // Simulate real-time SLA data
    const generateSLAData = (): SLAStatus[] => {
      const baseData = [
        {
          metric: "Service Uptime",
          current: plan === 'enterprise' ? 99.95 : 99.7,
          target: plan === 'enterprise' ? 99.9 : 99.5,
          unit: "%",
          description: "Current month uptime percentage"
        },
        {
          metric: "Avg Response Time",
          current: plan === 'enterprise' ? 45 : 180,
          target: plan === 'enterprise' ? 60 : 240,
          unit: "min",
          description: "Average support response time (24h)"
        },
        {
          metric: "Scan Completion",
          current: plan === 'enterprise' ? 25 : 85,
          target: plan === 'enterprise' ? 30 : 120,
          unit: "min",
          description: "Average scan processing time"
        },
        {
          metric: "API Response",
          current: plan === 'enterprise' ? 150 : 420,
          target: plan === 'enterprise' ? 200 : 500,
          unit: "ms",
          description: "95th percentile API response time"
        }
      ];

      return baseData.map(item => {
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        
        if (item.unit === '%') {
          if (item.current < item.target * 0.95) status = 'critical';
          else if (item.current < item.target * 0.98) status = 'warning';
        } else {
          if (item.current > item.target * 1.2) status = 'critical';
          else if (item.current > item.target * 1.1) status = 'warning';
        }

        return { ...item, status };
      });
    };

    const updateData = () => {
      const data = generateSLAData();
      setSlaData(data);
      
      // Calculate overall health
      const criticalCount = data.filter(d => d.status === 'critical').length;
      const warningCount = data.filter(d => d.status === 'warning').length;
      
      if (criticalCount > 0) {
        setOverallHealth('critical');
      } else if (warningCount > 0) {
        setOverallHealth('warning');
      } else {
        setOverallHealth('healthy');
      }
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [plan]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const calculateProgress = (current: number, target: number, unit: string) => {
    if (unit === '%') {
      return Math.min(100, (current / target) * 100);
    } else {
      // For time-based metrics, lower is better
      const score = Math.max(0, 100 - ((current - target) / target) * 100);
      return Math.max(0, Math.min(100, score));
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              SLA Status
            </div>
            <Badge variant="outline" className={getStatusColor(overallHealth)}>
              {overallHealth}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {slaData.slice(0, 2).map((item) => (
              <div key={item.metric} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="truncate">{item.metric}</span>
                </div>
                <span className="font-mono">
                  {item.current}{item.unit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            SLA Performance Dashboard
          </div>
          <Badge variant="outline" className={getStatusColor(overallHealth)}>
            Overall: {overallHealth}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {slaData.map((item) => {
            const progress = calculateProgress(item.current, item.target, item.unit);
            
            return (
              <div key={item.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="font-medium">{item.metric}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {item.current}{item.unit} / {item.target}{item.unit}
                    </span>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};