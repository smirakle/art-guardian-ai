import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

export const useRealUserMonitoring = () => {
  useEffect(() => {
    const sendToAnalytics = async (metric: Metric) => {
      const rating = getRating(metric.name, metric.value);
      
      const webVital: WebVitalsMetric = {
        name: metric.name,
        value: metric.value,
        rating,
        delta: metric.delta,
      };

      // Log to production metrics
      try {
        await supabase.functions.invoke('monitoring-alerts', {
          body: {
            action: 'log_web_vital',
            metric: webVital,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
          }
        });
      } catch (error) {
        console.error('Failed to log web vital:', error);
      }

      // Console log for development
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating,
        page: window.location.pathname,
      });
    };

    // Track all Core Web Vitals
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    // Track page load performance
    if (window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      // Log page load directly without Metric type
      supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'log_web_vital',
          metric: {
            name: 'page_load',
            value: pageLoadTime,
            rating: getRating('page_load', pageLoadTime),
            delta: pageLoadTime,
          },
          page: window.location.pathname,
        }
      }).catch(console.error);
    }
  }, []);

  const trackUserAction = async (action: string, metadata?: Record<string, any>) => {
    try {
      await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'log_user_action',
          userAction: action,
          metadata,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
        }
      });
    } catch (error) {
      console.error('Failed to track user action:', error);
    }
  };

  return { trackUserAction };
};

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: [0.1, 0.25],
    INP: [200, 500],
    LCP: [2500, 4000],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
    page_load: [2000, 4000],
  };

  const [good, poor] = thresholds[metricName as keyof typeof thresholds] || [1000, 3000];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}
