import { useCallback } from 'react';
import { usePerformanceBudget } from './usePerformanceBudget';
import { useCircuitBreaker } from './useCircuitBreaker';
import { useAlertSystem } from './useAlertSystem';

/**
 * Enhanced hook that combines circuit breaker, performance monitoring, and alerting
 * for API calls to external services
 */
export const useMonitoredApiCall = (serviceName: string) => {
  const { measureApiCall } = usePerformanceBudget();
  const { execute, state, failureCount } = useCircuitBreaker(serviceName, {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  });
  const { sendErrorAlert, sendSystemAlert } = useAlertSystem();

  const callApi = useCallback(
    async <T,>(
      apiFunction: () => Promise<T>,
      endpoint: string
    ): Promise<T> => {
      try {
        // Wrap with performance monitoring
        const result = await measureApiCall(
          // Wrap with circuit breaker
          () => execute(apiFunction),
          endpoint
        );

        // Alert if circuit breaker is recovering
        if (state === 'half-open') {
          await sendSystemAlert(
            `${serviceName} service recovering (${endpoint})`,
            'info'
          );
        }

        return result;
      } catch (error) {
        // Send error alert
        await sendErrorAlert(
          error instanceof Error ? error : new Error(String(error)),
          `${serviceName}:${endpoint}`
        );

        // Alert if circuit is opening
        if (state === 'open') {
          await sendSystemAlert(
            `${serviceName} circuit breaker opened after ${failureCount} failures`,
            'critical'
          );
        }

        throw error;
      }
    },
    [measureApiCall, execute, state, failureCount, sendErrorAlert, sendSystemAlert, serviceName]
  );

  return {
    callApi,
    circuitState: state,
    failureCount,
  };
};
