import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for monitoring system testing and verification
 */

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  error?: string;
}

/**
 * Test database connectivity and performance
 */
export async function testDatabaseConnection(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  
  try {
    const { error, data } = await supabase
      .from('production_metrics')
      .select('count')
      .limit(1);
    
    const responseTime = performance.now() - startTime;
    
    if (error) {
      return {
        service: 'database',
        status: 'down',
        responseTime,
        error: error.message
      };
    }
    
    return {
      service: 'database',
      status: responseTime < 200 ? 'healthy' : 'degraded',
      responseTime
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'down',
      responseTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test Edge Function connectivity
 */
export async function testEdgeFunctionConnection(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  
  try {
    const { error } = await supabase.functions.invoke('monitoring-alerts', {
      body: {
        action: 'log_web_vital',
        metric: {
          name: 'test',
          value: 1,
          rating: 'good',
          delta: 1
        },
        page: '/health-check'
      }
    });
    
    const responseTime = performance.now() - startTime;
    
    if (error) {
      return {
        service: 'edge_functions',
        status: 'down',
        responseTime,
        error: error.message
      };
    }
    
    return {
      service: 'edge_functions',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime
    };
  } catch (error) {
    return {
      service: 'edge_functions',
      status: 'down',
      responseTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test real-time subscriptions
 */
export async function testRealtimeConnection(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      channel.unsubscribe();
      resolve({
        service: 'realtime',
        status: 'down',
        responseTime: performance.now() - startTime,
        error: 'Subscription timeout'
      });
    }, 5000);
    
    const channel = supabase
      .channel('health-check')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'production_metrics'
        },
        () => {
          clearTimeout(timeout);
          const responseTime = performance.now() - startTime;
          channel.unsubscribe();
          resolve({
            service: 'realtime',
            status: responseTime < 2000 ? 'healthy' : 'degraded',
            responseTime
          });
        }
      )
      .subscribe();
    
    // Trigger a test insert
    setTimeout(async () => {
      await supabase.from('production_metrics').insert({
        metric_type: 'health_check',
        metric_name: 'realtime_test',
        metric_value: 1
      });
    }, 100);
  });
}

/**
 * Generate test metrics for performance validation
 */
export async function generateTestMetrics(count: number = 10): Promise<void> {
  const metrics = Array.from({ length: count }, (_, i) => ({
    metric_type: 'test',
    metric_name: `test_metric_${i}`,
    metric_value: Math.random() * 1000,
    metadata: {
      test: true,
      index: i,
      timestamp: Date.now()
    }
  }));
  
  await supabase.from('production_metrics').insert(metrics);
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
  await supabase
    .from('production_metrics')
    .delete()
    .eq('metric_type', 'test');
  
  await supabase
    .from('production_metrics')
    .delete()
    .eq('metric_type', 'health_check');
}

/**
 * Run comprehensive health check
 */
export async function runFullHealthCheck(): Promise<{
  overallStatus: 'healthy' | 'degraded' | 'down';
  checks: HealthCheckResult[];
  timestamp: string;
}> {
  const checks = await Promise.all([
    testDatabaseConnection(),
    testEdgeFunctionConnection(),
    testRealtimeConnection()
  ]);
  
  const downCount = checks.filter(c => c.status === 'down').length;
  const degradedCount = checks.filter(c => c.status === 'degraded').length;
  
  let overallStatus: 'healthy' | 'degraded' | 'down';
  if (downCount > 0) {
    overallStatus = 'down';
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }
  
  return {
    overallStatus,
    checks,
    timestamp: new Date().toISOString()
  };
}

/**
 * Measure function execution time
 */
export async function measureExecution<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;
  
  console.log(`[Performance] ${label}: ${Math.round(duration)}ms`);
  
  return { result, duration };
}

/**
 * Simulate load for stress testing
 */
export async function simulateLoad(
  requests: number,
  concurrency: number = 5
): Promise<{
  totalRequests: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
}> {
  const results: { success: boolean; duration: number }[] = [];
  
  // Process in batches
  for (let i = 0; i < requests; i += concurrency) {
    const batch = Array.from(
      { length: Math.min(concurrency, requests - i) },
      async () => {
        const startTime = performance.now();
        try {
          await supabase.from('production_metrics').select('count').limit(1);
          return {
            success: true,
            duration: performance.now() - startTime
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime
          };
        }
      }
    );
    
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  
  const successCount = results.filter(r => r.success).length;
  const durations = results.map(r => r.duration);
  
  return {
    totalRequests: requests,
    successCount,
    failureCount: results.length - successCount,
    avgResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
    maxResponseTime: Math.max(...durations),
    minResponseTime: Math.min(...durations)
  };
}
