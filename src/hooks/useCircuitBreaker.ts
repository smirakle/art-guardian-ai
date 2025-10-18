import { useState, useCallback, useRef } from 'react';
import { useAlertSystem } from './useAlertSystem';

interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes to close circuit
  timeout: number; // Time in ms before attempting to close circuit
}

type CircuitState = 'closed' | 'open' | 'half-open';

export const useCircuitBreaker = (
  serviceName: string,
  config: Partial<CircuitBreakerConfig> = {}
) => {
  const { sendSystemAlert } = useAlertSystem();
  
  const defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
    ...config,
  };

  const [state, setState] = useState<CircuitState>('closed');
  const failureCount = useRef(0);
  const successCount = useRef(0);
  const nextAttempt = useRef<number>(0);

  const reset = useCallback(() => {
    failureCount.current = 0;
    successCount.current = 0;
    setState('closed');
  }, []);

  const recordSuccess = useCallback(() => {
    failureCount.current = 0;

    if (state === 'half-open') {
      successCount.current++;

      if (successCount.current >= defaultConfig.successThreshold) {
        setState('closed');
        successCount.current = 0;
        sendSystemAlert(
          `Circuit breaker for ${serviceName} closed after recovery`,
          'info'
        );
      }
    }
  }, [state, defaultConfig.successThreshold, serviceName, sendSystemAlert]);

  const recordFailure = useCallback(() => {
    failureCount.current++;

    if (state === 'half-open') {
      setState('open');
      nextAttempt.current = Date.now() + defaultConfig.timeout;
      sendSystemAlert(
        `Circuit breaker for ${serviceName} re-opened after failure in half-open state`,
        'warning'
      );
    } else if (failureCount.current >= defaultConfig.failureThreshold) {
      setState('open');
      nextAttempt.current = Date.now() + defaultConfig.timeout;
      sendSystemAlert(
        `Circuit breaker for ${serviceName} opened after ${failureCount.current} failures`,
        'critical'
      );
    }
  }, [state, defaultConfig.failureThreshold, defaultConfig.timeout, serviceName, sendSystemAlert]);

  const execute = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      if (state === 'open') {
        if (Date.now() < nextAttempt.current) {
          throw new Error(`Circuit breaker is OPEN for ${serviceName}`);
        }
        setState('half-open');
        sendSystemAlert(
          `Circuit breaker for ${serviceName} entering half-open state`,
          'info'
        );
      }

      try {
        const result = await fn();
        recordSuccess();
        return result;
      } catch (error) {
        recordFailure();
        throw error;
      }
    },
    [state, serviceName, recordSuccess, recordFailure, sendSystemAlert]
  );

  return {
    execute,
    state,
    reset,
    failureCount: failureCount.current,
  };
};
