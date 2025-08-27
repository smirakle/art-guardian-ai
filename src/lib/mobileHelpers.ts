import { supabase } from '@/integrations/supabase/client';

export interface MobileUsageData {
  platform: string;
  app_version?: string;
  features_used?: string[];
  device_info?: any;
  session_duration?: number;
  crash_reports?: any;
}

export const trackMobileUsage = async (usageData: MobileUsageData) => {
  try {
    const { data, error } = await supabase.functions.invoke('mobile-usage-tracker', {
      body: usageData
    });

    if (error) {
      console.error('Failed to track mobile usage:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error tracking mobile usage:', error);
    return { success: false, error };
  }
};

export interface PushNotificationData {
  user_ids: string[];
  title: string;
  body: string;
  data?: any;
  platform?: string;
}

export const sendPushNotification = async (notificationData: PushNotificationData) => {
  try {
    const { data, error } = await supabase.functions.invoke('mobile-push-notifications', {
      body: notificationData
    });

    if (error) {
      console.error('Failed to send push notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
};