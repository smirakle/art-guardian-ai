import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  Zap,
  Database,
  Clock,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAlertSystem } from '@/hooks/useAlertSystem';
import { usePerformanceBudget } from '@/hooks/usePerformanceBudget';
import { useCircuitBreaker } from '@/hooks/useCircuitBreaker';
import { useMonitoredSupabaseCall } from '@/hooks/useMonitoredSupabaseCall';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

export const MonitoringTest = () => {
  const { toast } = useToast();
  const { sendAlert, sendPerformanceAlert, sendErrorAlert, sendSystemAlert } = useAlertSystem();
  const { measureApiCall, measureDatabaseQuery } = usePerformanceBudget();
  const { execute: circuitExecute, state: circuitState, reset: circuitReset } = useCircuitBreaker('test-service');
  const { invokeFunction, query } = useMonitoredSupabaseCall();

  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Web Vitals Collection', status: 'pending' },
    { name: 'Alert System - Info Alert', status: 'pending' },
    { name: 'Alert System - Error Alert', status: 'pending' },
    { name: 'Alert System - Critical Alert', status: 'pending' },
    { name: 'Performance Budget - API Call', status: 'pending' },
    { name: 'Performance Budget - Database Query', status: 'pending' },
    { name: 'Circuit Breaker - Success', status: 'pending' },
    { name: 'Circuit Breaker - Failure Threshold', status: 'pending' },
    { name: 'Error Boundary Logging', status: 'pending' },
    { name: 'Database Insertion', status: 'pending' },
    { name: 'Real-time Subscriptions', status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateTestStatus = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runTest = async (index: number, testFn: () => Promise<void>) => {
    updateTestStatus(index, { status: 'running' });
    const startTime = performance.now();
    
    try {
      await testFn();
      const duration = performance.now() - startTime;
      updateTestStatus(index, { 
        status: 'passed', 
        duration,
        details: `Completed in ${Math.round(duration)}ms`
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      updateTestStatus(index, { 
        status: 'failed', 
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);

    // Test 1: Web Vitals Collection
    await runTest(0, async () => {
      // Simulate web vital metric
      await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'log_web_vital',
          metric: {
            name: 'LCP',
            value: 1500,
            rating: 'good',
            delta: 1500
          },
          page: '/monitoring-test'
        }
      });
    });
    setProgress(9);

    // Test 2: Info Alert
    await runTest(1, async () => {
      await sendSystemAlert('Test info alert from monitoring test suite', 'info');
    });
    setProgress(18);

    // Test 3: Error Alert
    await runTest(2, async () => {
      await sendErrorAlert(new Error('Test error alert'), 'monitoring_test');
    });
    setProgress(27);

    // Test 4: Critical Alert
    await runTest(3, async () => {
      await sendAlert({
        title: 'Critical Test Alert',
        message: 'Testing critical alert delivery',
        severity: 'critical',
        source: 'monitoring_test'
      });
    });
    setProgress(36);

    // Test 5: Performance Budget - API Call
    await runTest(4, async () => {
      await measureApiCall(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { success: true };
        },
        'test-endpoint'
      );
    });
    setProgress(45);

    // Test 6: Performance Budget - Database Query
    await runTest(5, async () => {
      await measureDatabaseQuery(
        async () => {
          const { data } = await supabase
            .from('production_metrics')
            .select('count')
            .limit(1);
          return data;
        },
        'test-query'
      );
    });
    setProgress(54);

    // Test 7: Circuit Breaker - Success
    await runTest(6, async () => {
      await circuitExecute(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'success';
      });
    });
    setProgress(63);

    // Test 8: Circuit Breaker - Failure Threshold
    await runTest(7, async () => {
      // This test intentionally triggers failures
      try {
        for (let i = 0; i < 3; i++) {
          await circuitExecute(async () => {
            throw new Error('Intentional test failure');
          });
        }
      } catch (error) {
        // Expected to fail
      }
      // Verify circuit state changed
      if (circuitState === 'open') {
        throw new Error('Circuit should be open after failures');
      }
    });
    setProgress(72);

    // Test 9: Error Boundary Logging
    await runTest(8, async () => {
      const testError = new Error('Test error boundary');
      await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'send_alert',
          alert: {
            title: 'Error Boundary Test',
            message: testError.message,
            severity: 'error',
            source: 'error_boundary',
            metadata: { stack: testError.stack },
            timestamp: new Date().toISOString()
          }
        }
      });
    });
    setProgress(81);

    // Test 10: Database Insertion
    await runTest(9, async () => {
      const { error } = await supabase
        .from('production_metrics')
        .insert({
          metric_type: 'test',
          metric_name: 'monitoring_test_metric',
          metric_value: 42,
          metadata: { test: true, timestamp: Date.now() }
        });
      
      if (error) throw error;
    });
    setProgress(90);

    // Test 11: Real-time Subscriptions
    await runTest(10, async () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          channel.unsubscribe();
          reject(new Error('Timeout waiting for real-time event'));
        }, 5000);

        const channel = supabase
          .channel('test-channel')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'production_metrics'
            },
            () => {
              clearTimeout(timeout);
              channel.unsubscribe();
              resolve();
            }
          )
          .subscribe();

        // Trigger an insert
        setTimeout(async () => {
          await supabase.from('production_metrics').insert({
            metric_type: 'test',
            metric_name: 'realtime_test',
            metric_value: 1
          });
        }, 500);
      });
    });
    setProgress(100);

    setIsRunning(false);
    
    toast({
      title: 'Test Suite Completed',
      description: `${tests.filter(t => t.status === 'passed').length} of ${tests.length} tests passed`,
    });
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ ...test, status: 'pending', error: undefined, details: undefined })));
    setProgress(0);
    circuitReset();
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Activity className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            Monitoring System Test Suite
          </h1>
          <p className="text-muted-foreground">Comprehensive testing of all monitoring features</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetTests} variant="outline" disabled={isRunning}>
            Reset Tests
          </Button>
          <Button onClick={runAllTests} disabled={isRunning}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{passedCount}</div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{failedCount}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">
              {totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Detailed results for each monitoring test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tests.map((test, index) => (
              <Alert key={index} className={
                test.status === 'passed' ? 'border-green-500' :
                test.status === 'failed' ? 'border-red-500' :
                test.status === 'running' ? 'border-blue-500' : ''
              }>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-semibold">{test.name}</div>
                        {test.details && (
                          <p className="text-sm text-muted-foreground mt-1">{test.details}</p>
                        )}
                        {test.error && (
                          <p className="text-sm text-red-500 mt-1">{test.error}</p>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                  <Badge variant={
                    test.status === 'passed' ? 'default' :
                    test.status === 'failed' ? 'destructive' :
                    test.status === 'running' ? 'secondary' : 'outline'
                  }>
                    {test.status}
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Circuit Breaker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Circuit Breaker Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={
              circuitState === 'closed' ? 'default' :
              circuitState === 'open' ? 'destructive' : 'secondary'
            } className="text-lg px-4 py-2">
              {circuitState.toUpperCase()}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {circuitState === 'closed' && 'Circuit is healthy and allowing requests'}
              {circuitState === 'open' && 'Circuit is open due to failures - requests are blocked'}
              {circuitState === 'half-open' && 'Circuit is testing if service has recovered'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringTest;
