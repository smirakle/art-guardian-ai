import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = useCallback(async (event: string, properties?: Record<string, any>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        pathname: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      userId: user?.id,
      sessionId: sessionStorage.getItem('tsmo-session-id') || crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    // Store session ID
    if (!sessionStorage.getItem('tsmo-session-id')) {
      sessionStorage.setItem('tsmo-session-id', analyticsEvent.sessionId!);
    }

    try {
      // Send to analytics service
      await supabase.functions.invoke('production-optimization', {
        body: {
          action: 'track_event',
          ...analyticsEvent
        }
      });

      // Google Analytics 4 (if available)
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', event, {
          user_id: user?.id,
          ...properties
        });
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [user]);

  const trackPageView = useCallback((page?: string) => {
    track('page_view', {
      page: page || window.location.pathname,
      title: document.title
    });
  }, [track]);

  const trackConversion = useCallback((type: string, value?: number, currency?: string) => {
    track('conversion', {
      conversion_type: type,
      value,
      currency: currency || 'USD'
    });
  }, [track]);

  const trackUserEngagement = useCallback((action: string, element?: string) => {
    track('user_engagement', {
      engagement_action: action,
      element
    });
  }, [track]);

  const trackFeatureUsage = useCallback((feature: string, context?: Record<string, any>) => {
    track('feature_usage', {
      feature,
      ...context
    });
  }, [track]);

  // Auto-track page views on route changes
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  return {
    track,
    trackPageView,
    trackConversion,
    trackUserEngagement,
    trackFeatureUsage
  };
};