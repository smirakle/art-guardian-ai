import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  title: string;
  message: string;
  severity: AlertSeverity;
  source: string;
  metadata?: Record<string, any>;
}

export const useAlertSystem = () => {
  const { toast } = useToast();
  const shownAlerts = useRef<Set<string>>(new Set());

  const sendAlert = useCallback(async (alert: Alert) => {
    try {
      // Create a unique key for this alert to prevent duplicates
      const alertKey = `${alert.source}-${alert.title}-${alert.message}`;
      
      // Skip if we've already shown this exact alert
      if (shownAlerts.current.has(alertKey)) {
        return true;
      }

      // Mark this alert as shown
      shownAlerts.current.add(alertKey);
      
      // Clear the alert from the set after 5 seconds to allow it to show again later
      setTimeout(() => {
        shownAlerts.current.delete(alertKey);
      }, 5000);

      // Send to monitoring alerts endpoint
      const { error } = await supabase.functions.invoke('monitoring-alerts', {
        body: {
          action: 'send_alert',
          alert: {
            ...alert,
            timestamp: new Date().toISOString(),
            user_id: (await supabase.auth.getUser()).data.user?.id,
          }
        }
      });

      if (error) throw error;

      // Show toast for critical and error alerts
      if (alert.severity === 'critical' || alert.severity === 'error') {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.severity === 'critical' ? 'destructive' : 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to send alert:', error);
      return false;
    }
  }, [toast]);

  const getPerformanceExplanation = (metricName: string, valueMs: number) => {
    const seconds = (valueMs / 1000).toFixed(1);
    const readableTime = valueMs >= 1000 ? `${seconds} seconds` : `${valueMs}ms`;
    
    const explanations: Record<string, { title: string; message: string }> = {
      'Page Load Time': {
        title: 'Your page is loading slowly',
        message: `This page took ${readableTime} to load. Try refreshing or check your internet connection.`
      },
      'Long Task': {
        title: 'App is running slowly',
        message: `Something is slowing down the app (${readableTime}). This usually fixes itself in a moment.`
      },
      'API Call': {
        title: 'Connecting is taking longer',
        message: `We're having trouble connecting to our servers (${readableTime}). This may affect loading your data.`
      },
      'Database Query': {
        title: 'Getting your data is slow',
        message: `Retrieving your information took ${readableTime}. Please wait or try refreshing.`
      }
    };
    
    // Find matching explanation or use a generic one
    const key = Object.keys(explanations).find(k => metricName.toLowerCase().includes(k.toLowerCase()));
    return explanations[key || 'Page Load Time'] || {
      title: 'Performance issue detected',
      message: `Something took ${readableTime} which is longer than expected. Try refreshing.`
    };
  };

  const sendPerformanceAlert = useCallback(async (metricName: string, value: number, threshold: number) => {
    // Only send critical alerts for severe performance issues (2x threshold)
    const severity = value > threshold * 2 ? 'critical' : 'warning';
    
    // Skip sending warning alerts - only log them
    if (severity === 'warning') {
      console.warn(`Performance Warning: ${metricName} is ${value}ms (threshold: ${threshold}ms)`);
      return;
    }
    
    const { title, message } = getPerformanceExplanation(metricName, value);
    
    await sendAlert({
      title,
      message,
      severity,
      source: 'performance_monitor',
      metadata: { metricName, value, threshold }
    });
  }, [sendAlert]);

  const sendErrorAlert = useCallback(async (error: Error, context?: string) => {
    await sendAlert({
      title: 'Application Error',
      message: error.message,
      severity: 'error',
      source: context || 'error_boundary',
      metadata: {
        stack: error.stack,
        name: error.name,
      }
    });
  }, [sendAlert]);

  const sendSystemAlert = useCallback(async (message: string, severity: AlertSeverity = 'info') => {
    await sendAlert({
      title: 'System Alert',
      message,
      severity,
      source: 'system',
    });
  }, [sendAlert]);

  return {
    sendAlert,
    sendPerformanceAlert,
    sendErrorAlert,
    sendSystemAlert,
  };
};
