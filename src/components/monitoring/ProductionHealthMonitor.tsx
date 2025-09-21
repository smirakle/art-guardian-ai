import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useProductionHealth } from '@/hooks/useProductionHealth';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export const ProductionHealthMonitor: React.FC = () => {
  const { 
    healthStatus, 
    performanceMetrics, 
    loading, 
    runHealthCheck,
    isHealthy,
    hasCriticalIssues,
    hasWarnings
  } = useProductionHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' ? 'default' : 
                   status === 'warning' ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">System Health Overview</CardTitle>
          {getStatusBadge(healthStatus?.status || 'unknown')}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : healthStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {healthStatus.summary.healthy_services}
                    </div>
                    <p className="text-sm text-muted-foreground">Healthy Services</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {healthStatus.summary.warning_services}
                    </div>
                    <p className="text-sm text-muted-foreground">Warning Services</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {healthStatus.summary.critical_services}
                    </div>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {healthStatus.summary.total_services}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                  </CardContent>
                </Card>
              </div>

              {/* System Statistics */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">System Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {healthStatus.system_stats.total_users.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {healthStatus.system_stats.active_subscriptions.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {healthStatus.system_stats.total_artwork.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Protected Artwork</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {healthStatus.system_stats.total_matches.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Matches Detected</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {healthStatus.system_stats.daily_uploads.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Daily Uploads</p>
                  </div>
                </div>
              </div>

              {/* Service Health Details */}
              {healthStatus.health_checks && healthStatus.health_checks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Service Details</h3>
                  <div className="space-y-2">
                    {healthStatus.health_checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.service}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {check.response_time_ms}ms
                          </span>
                          {getStatusBadge(check.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unable to load health status. Click refresh to try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {performanceMetrics.avg_response_time}ms
                </div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performanceMetrics.performance_summary.excellent}%
                </div>
                <p className="text-sm text-muted-foreground">Excellent</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {performanceMetrics.performance_summary.good}%
                </div>
                <p className="text-sm text-muted-foreground">Good</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {performanceMetrics.performance_summary.poor}%
                </div>
                <p className="text-sm text-muted-foreground">Poor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {hasCriticalIssues && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Critical system issues detected. Please review the service details above and contact support if needed.
          </AlertDescription>
        </Alert>
      )}

      {hasWarnings && !hasCriticalIssues && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some services are showing warnings. Monitor performance and consider optimization.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};