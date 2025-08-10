import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Toaster } from '@/components/ui/sonner';
import UserFeedbackWidget from '@/components/UserFeedbackWidget';
import LiveChatWidget from '@/components/support/LiveChatWidget';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { useAnalytics } from '@/hooks/useAnalytics';

const ProductionLayout: React.FC = () => {
  const { trackError } = useErrorTracking();
  const { trackUserEngagement } = useAnalytics();

  // Global error handler
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error('Unhandled Promise Rejection'), {
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  // Track user engagement
  React.useEffect(() => {
    const trackClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        trackUserEngagement('click', target.textContent || target.className);
      }
    };

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        trackUserEngagement('scroll', `${scrollPercent}%`);
      }
    };

    document.addEventListener('click', trackClick);
    window.addEventListener('scroll', trackScroll);

    return () => {
      document.removeEventListener('click', trackClick);
      window.removeEventListener('scroll', trackScroll);
    };
  }, [trackUserEngagement]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <Outlet />
      </main>
      
      {/* Production widgets */}
      <UserFeedbackWidget />
      <LiveChatWidget />
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
};

export default ProductionLayout;