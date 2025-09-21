import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bug, Clock, User, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorLog {
  id: string;
  error_message: string;
  error_stack?: string;
  user_id?: string;
  request_path?: string;
  severity: string;
  metadata: any;
  created_at: string;
  resolved: boolean;
  ip_address?: any;
  resolved_at?: string;
  resolved_by?: string;
  user_agent?: string;
}

interface ErrorStats {
  total_errors: number;
  critical_errors: number;
  warning_errors: number;
  resolved_errors: number;
  error_rate_24h: number;
}

export const ErrorTracker: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadErrorData();
    // Set up real-time subscription for new errors
    const subscription = supabase
      .channel('error_logs')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'error_logs' 
      }, (payload) => {
        const newError = payload.new as ErrorLog;
        setErrors(prev => [newError, ...prev.slice(0, 49)]); // Keep latest 50
        
        // Show toast for critical errors
        if (newError.severity === 'critical') {
          toast({
            title: "Critical Error Detected",
            description: newError.error_message.substring(0, 100) + "...",
            variant: "destructive",
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const loadErrorData = async () => {
    try {
      setLoading(true);
      
      // Load recent errors
      const { data: errorData, error: errorError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (errorError) throw errorError;

      setErrors(errorData || []);

      // Calculate stats
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentErrors = errorData?.filter(e => 
        new Date(e.created_at) > yesterday
      ) || [];

      const statsData: ErrorStats = {
        total_errors: errorData?.length || 0,
        critical_errors: errorData?.filter(e => e.severity === 'critical').length || 0,
        warning_errors: errorData?.filter(e => e.severity === 'warning').length || 0,
        resolved_errors: errorData?.filter(e => e.resolved).length || 0,
        error_rate_24h: recentErrors.length
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error loading error data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load error tracking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', errorId);

      if (error) throw error;

      setErrors(prev => 
        prev.map(e => 
          e.id === errorId ? { ...e, resolved: true } : e
        )
      );

      toast({
        title: "Error Resolved",
        description: "Error has been marked as resolved",
      });
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast({
        title: "Error",
        description: "Failed to mark error as resolved",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Error Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.total_errors}
                </div>
                <p className="text-sm text-muted-foreground">Total Errors</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.critical_errors}
                </div>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.warning_errors}
                </div>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.resolved_errors}
                </div>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.error_rate_24h}
                </div>
                <p className="text-sm text-muted-foreground">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Errors</CardTitle>
          <Button onClick={loadErrorData} variant="outline" size="sm">
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No errors found. System is running smoothly!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => (
                <Card key={error.id} className={error.resolved ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(error.severity)} className="flex items-center gap-1">
                            {getSeverityIcon(error.severity)}
                            {error.severity.toUpperCase()}
                          </Badge>
                          {error.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              RESOLVED
                            </Badge>
                          )}
                        </div>
                        
                        <div className="font-medium text-sm">
                          {error.error_message}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(error.created_at).toLocaleString()}
                          </div>
                          
                          {error.user_id && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              User ID: {error.user_id.substring(0, 8)}...
                            </div>
                          )}
                          
                          {error.request_path && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {error.request_path}
                            </div>
                          )}
                        </div>
                        
                        {error.error_stack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                              {error.error_stack}
                            </pre>
                          </details>
                        )}
                      </div>
                      
                      {!error.resolved && (
                        <Button
                          onClick={() => markAsResolved(error.id)}
                          variant="outline"
                          size="sm"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};