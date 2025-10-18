import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundaryEnhanced extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;

    // Log error to monitoring system
    this.logErrorToMonitoring(error, errorInfo);

    // Increment error count
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // If too many errors, show critical alert
    if (this.state.errorCount >= 3) {
      this.sendCriticalAlert(error);
    }
  }

  logErrorToMonitoring = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('error_logs').insert({
        error_message: error.message,
        error_stack: error.stack,
        severity: 'error',
        user_id: user?.id,
        metadata: {
          componentStack: errorInfo.componentStack,
          errorCount: this.state.errorCount + 1,
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      });

      // Send to monitoring alerts
      await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'send_alert',
          alert: {
            title: 'React Error Boundary Triggered',
            message: error.message,
            severity: 'error',
            source: 'error_boundary',
            metadata: {
              stack: error.stack,
              componentStack: errorInfo.componentStack,
            },
          },
        },
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  sendCriticalAlert = async (error: Error) => {
    try {
      await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'send_alert',
          alert: {
            title: 'Multiple Errors Detected',
            message: `Error boundary triggered ${this.state.errorCount} times. Latest: ${error.message}`,
            severity: 'critical',
            source: 'error_boundary',
            metadata: {
              errorCount: this.state.errorCount,
              latestError: error.message,
            },
          },
        },
      });
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription>
                    We've encountered an unexpected error. Our team has been notified.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Error Details:</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-mono text-destructive">{error.message}</p>
                  </div>
                </div>
              )}

              {errorInfo && process.env.NODE_ENV === 'development' && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Component Stack
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto text-xs">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact support with error ID: {Date.now().toString(36)}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}
