import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize Sentry in production and if DSN is configured
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (import.meta.env.PROD && sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions in beta
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || "1.0.0",
      
      // Before send hook to filter sensitive data
      beforeSend(event, hint) {
        // Filter out sensitive information
        if (event.request) {
          delete event.request.cookies;
        }
        return event;
      },
    });
    
    console.log('[Sentry] Initialized successfully');
  } else if (!sentryDsn) {
    console.log('[Sentry] DSN not configured - error tracking disabled');
  } else {
    console.log('[Sentry] Development mode - error tracking disabled');
  }
};

// Helper to capture exceptions manually
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Helper to set user context
export const setUserContext = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

// Helper to clear user context (on logout)
export const clearUserContext = () => {
  Sentry.setUser(null);
};
