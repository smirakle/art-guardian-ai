// Production error handling utilities
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLogEntry {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logProductionError = async (error: ErrorLogEntry) => {
  try {
    // Log to Supabase error_logs table
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert({
        error_message: error.message,
        error_stack: error.stack || null,
        severity: error.severity,
        metadata: error.context || {},
      });

    if (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  } catch (e) {
    // Fail silently - don't break app due to logging failure
    console.error('Error logging failed:', e);
  }
};

export const handleGlobalError = (event: ErrorEvent) => {
  const errorEntry: ErrorLogEntry = {
    message: event.message,
    stack: event.error?.stack,
    context: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
    severity: 'high',
  };

  logProductionError(errorEntry);
};

export const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  const errorEntry: ErrorLogEntry = {
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack,
    severity: 'high',
  };

  logProductionError(errorEntry);
};

// Initialize global error handlers
export const initializeErrorHandlers = () => {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
};

// Cleanup function
export const cleanupErrorHandlers = () => {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
};
