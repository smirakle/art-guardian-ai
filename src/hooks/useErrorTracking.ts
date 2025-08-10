import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogger } from './useErrorLogger';

interface ErrorEvent {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  timestamp: string;
}

export const useErrorTracking = () => {
  const { logError } = useErrorLogger();

  const trackError = useCallback(async (error: Error, context?: Record<string, any>) => {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...context
    };

    // Log to our internal system
    await logError({
      error_type: 'client_error',
      error_message: error.message,
      error_stack: error.stack,
      metadata: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });

    // Track performance impact
    if (window.performance && window.performance.now) {
      const perfData = {
        timeOrigin: performance.timeOrigin,
        now: performance.now(),
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length
      };
      
      console.warn('Error occurred with performance context:', {
        error: error.message,
        performance: perfData
      });
    }

    return errorEvent;
  }, [logError]);

  const trackUserAction = useCallback(async (action: string, details?: Record<string, any>) => {
    try {
      await supabase.functions.invoke('production-error-logger', {
        body: {
          error_type: 'user_action',
          error_message: `User action: ${action}`,
          metadata: {
            action,
            ...details,
            timestamp: new Date().toISOString(),
            url: window.location.href
          }
        }
      });
    } catch (error) {
      console.warn('Failed to track user action:', error);
    }
  }, []);

  const trackPerformanceIssue = useCallback(async (metric: string, value: number, threshold: number) => {
    if (value > threshold) {
      await trackError(new Error(`Performance issue: ${metric}`), {
        metric,
        value,
        threshold,
        severity: 'performance'
      });
    }
  }, [trackError]);

  return {
    trackError,
    trackUserAction,
    trackPerformanceIssue
  };
};