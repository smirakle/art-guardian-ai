import { toast } from '@/hooks/use-toast';

/**
 * User-friendly error messages for common error types
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'User already registered': 'An account with this email already exists.',
  'Email not confirmed': 'Please verify your email before logging in.',
  'Invalid email': 'Please enter a valid email address.',
  
  // Network errors
  'Failed to fetch': 'Connection error. Please check your internet connection.',
  'Network request failed': 'Unable to connect to server. Please try again.',
  
  // Permission errors
  'Permission denied': 'You don\'t have permission to perform this action.',
  'Unauthorized': 'Please sign in to continue.',
  
  // Payment errors
  'Payment failed': 'Payment could not be processed. Please try again.',
  'Card declined': 'Your card was declined. Please use a different payment method.',
  
  // File upload errors
  'File too large': 'File size exceeds the maximum limit.',
  'Invalid file type': 'This file type is not supported.',
  
  // Generic errors
  'Something went wrong': 'An unexpected error occurred. Please try again.',
};

/**
 * Extracts user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return ERROR_MESSAGES['Something went wrong'];
  
  // Handle string errors
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for known error messages
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (message.includes(key)) {
        return value;
      }
    }
    
    // Return original message if no match found
    return message;
  }
  
  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as any).message);
    return ERROR_MESSAGES[message] || message;
  }
  
  return ERROR_MESSAGES['Something went wrong'];
}

/**
 * Standardized error handler that logs and displays user-friendly errors
 */
export function handleError(
  error: unknown,
  context?: {
    action?: string;
    showToast?: boolean;
    logToConsole?: boolean;
  }
): string {
  const message = getErrorMessage(error);
  const { action, showToast = true, logToConsole = true } = context || {};
  
  // Log to console in development
  if (logToConsole && import.meta.env.DEV) {
    console.error(`[Error${action ? ` - ${action}` : ''}]:`, error);
  }
  
  // Show toast notification
  if (showToast) {
    toast({
      title: action ? `Failed to ${action}` : 'Error',
      description: message,
      variant: 'destructive',
    });
  }
  
  return message;
}

/**
 * Async operation wrapper with error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: {
    action?: string;
    successMessage?: string;
    showSuccessToast?: boolean;
  }
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await operation();
    
    // Show success toast if configured
    if (context?.showSuccessToast && context?.successMessage) {
      toast({
        title: 'Success',
        description: context.successMessage,
      });
    }
    
    return { data };
  } catch (error) {
    const errorMessage = handleError(error, {
      action: context?.action,
      showToast: true,
    });
    
    return { error: errorMessage };
  }
}
