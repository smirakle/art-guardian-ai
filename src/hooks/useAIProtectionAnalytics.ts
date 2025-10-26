import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_category: 'protection' | 'violation' | 'scan' | 'legal_action' | 'user_action';
  event_data?: Record<string, any>;
  user_id?: string;
}

export const useAIProtectionAnalytics = () => {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to database for analytics
      await supabase.rpc('record_ai_protection_metric', {
        metric_type_param: event.event_category,
        metric_name_param: event.event_name,
        metric_value_param: 1,
        metadata_param: {
          ...event.event_data,
          user_id: user?.id || event.user_id,
          timestamp: new Date().toISOString()
        }
      });

      // Also track in production metrics for monitoring
      await supabase.rpc('log_production_metric', {
        metric_type_param: 'ai_protection_event',
        metric_name_param: event.event_name,
        metric_value_param: 1,
        metadata_param: {
          category: event.event_category,
          ...event.event_data
        }
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - analytics failures shouldn't break functionality
    }
  }, []);

  const trackProtectionCreated = useCallback((protectionLevel: string, fileType: string) => {
    trackEvent({
      event_name: 'protection_created',
      event_category: 'protection',
      event_data: { protectionLevel, fileType }
    });
  }, [trackEvent]);

  const trackViolationDetected = useCallback((
    violationType: string,
    confidence: number,
    source: string
  ) => {
    trackEvent({
      event_name: 'violation_detected',
      event_category: 'violation',
      event_data: { violationType, confidence, source }
    });
  }, [trackEvent]);

  const trackScanCompleted = useCallback((
    scanType: string,
    datasetsScanned: number,
    violationsFound: number,
    duration: number
  ) => {
    trackEvent({
      event_name: 'scan_completed',
      event_category: 'scan',
      event_data: { scanType, datasetsScanned, violationsFound, duration }
    });
  }, [trackEvent]);

  const trackLegalActionTaken = useCallback((
    actionType: string,
    violationId: string,
    automated: boolean
  ) => {
    trackEvent({
      event_name: 'legal_action_taken',
      event_category: 'legal_action',
      event_data: { actionType, violationId, automated }
    });
  }, [trackEvent]);

  const trackUserAction = useCallback((actionName: string, context?: Record<string, any>) => {
    trackEvent({
      event_name: actionName,
      event_category: 'user_action',
      event_data: context
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackProtectionCreated,
    trackViolationDetected,
    trackScanCompleted,
    trackLegalActionTaken,
    trackUserAction
  };
};
