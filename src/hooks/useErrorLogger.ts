import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ErrorLogData {
  error_type: string;
  error_message: string;
  error_stack?: string;
  request_path?: string;
  request_method?: string;
  metadata?: Record<string, any>;
}

export const useErrorLogger = () => {
  const logError = useCallback(async (errorData: ErrorLogData) => {
    try {
      // Get current user and request info
      const { data: { user } } = await supabase.auth.getUser();
      
      const enrichedErrorData = {
        ...errorData,
        user_id: user?.id,
        request_path: errorData.request_path || window.location.pathname,
        request_method: errorData.request_method || 'GET',
        user_agent: navigator.userAgent,
        metadata: {
          ...errorData.metadata,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          user_plan: user ? 'authenticated' : 'anonymous'
        }
      };

      // Log to production error logger
      const { data, error } = await supabase.functions.invoke('production-error-logger', {
        body: enrichedErrorData
      });

      if (error) {
        console.error('Failed to log error to remote:', error);
        // Fallback to console logging
        console.error('Original error:', enrichedErrorData);
      }

      return data;
    } catch (logError) {
      console.error('Error in error logger:', logError);
      console.error('Original error data:', errorData);
    }
  }, []);

  const logComponentError = useCallback((componentName: string, error: Error, errorInfo?: any) => {
    logError({
      error_type: 'component_error',
      error_message: `${componentName}: ${error.message}`,
      error_stack: error.stack,
      metadata: {
        component: componentName,
        error_info: errorInfo
      }
    });
  }, [logError]);

  const logApiError = useCallback((endpoint: string, method: string, error: any, statusCode?: number) => {
    logError({
      error_type: 'api_error',
      error_message: `API Error: ${endpoint} - ${error.message || error}`,
      request_path: endpoint,
      request_method: method,
      metadata: {
        status_code: statusCode,
        endpoint,
        error_details: error
      }
    });
  }, [logError]);

  const logUserError = useCallback((action: string, error: Error, context?: any) => {
    logError({
      error_type: 'user_error',
      error_message: `User Action Failed: ${action} - ${error.message}`,
      metadata: {
        action,
        context,
        user_agent: navigator.userAgent
      }
    });
  }, [logError]);

  return {
    logError,
    logComponentError,
    logApiError,
    logUserError
  };
};