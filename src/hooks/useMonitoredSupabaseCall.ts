import { useCallback } from 'react';
import { usePerformanceBudget } from './usePerformanceBudget';
import { useAlertSystem } from './useAlertSystem';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for monitoring Supabase function invocations with performance tracking and alerting
 */
export const useMonitoredSupabaseCall = () => {
  const { measureApiCall } = usePerformanceBudget();
  const { sendErrorAlert } = useAlertSystem();

  const invokeFunction = useCallback(
    async <T = any,>(
      functionName: string,
      body?: Record<string, any>
    ): Promise<{ data: T | null; error: any }> => {
      try {
        const result = await measureApiCall(
          () => supabase.functions.invoke<T>(functionName, { body }),
          `supabase-function:${functionName}`
        );

        if (result.error) {
          await sendErrorAlert(
            new Error(`Supabase function error: ${result.error.message}`),
            functionName
          );
        }

        return result;
      } catch (error) {
        await sendErrorAlert(
          error instanceof Error ? error : new Error(String(error)),
          functionName
        );
        throw error;
      }
    },
    [measureApiCall, sendErrorAlert]
  );

  const query = useCallback(
    async <T = any,>(
      queryFunction: () => Promise<{ data: T | null; error: any }>,
      queryName: string
    ): Promise<{ data: T | null; error: any }> => {
      try {
        const { measureDatabaseQuery } = usePerformanceBudget();
        const result = await measureDatabaseQuery(queryFunction, queryName);

        if (result.error) {
          await sendErrorAlert(
            new Error(`Database query error: ${result.error.message}`),
            queryName
          );
        }

        return result;
      } catch (error) {
        await sendErrorAlert(
          error instanceof Error ? error : new Error(String(error)),
          queryName
        );
        throw error;
      }
    },
    [sendErrorAlert]
  );

  return {
    invokeFunction,
    query,
  };
};
