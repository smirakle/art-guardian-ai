import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Daily capacity limits (realistic for current API tier)
export const DAILY_LIMITS = {
  full_scan: 100,      // Full image scans with all APIs
  monitoring: 2000,    // Simple monitoring checks
  ai_analysis: 5000    // AI-only analysis
} as const;

export type ServiceType = keyof typeof DAILY_LIMITS;

interface DailyUsageResponse {
  allowed: boolean;
  current_usage?: number;
  daily_limit?: number;
  remaining?: number;
  reset_time?: string;
}

export const useDailyApiLimit = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkDailyLimit = useCallback(async (
    serviceType: ServiceType
  ): Promise<boolean> => {
    setIsChecking(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to use this feature.",
          variant: "destructive",
        });
        return false;
      }

      const dailyLimit = DAILY_LIMITS[serviceType];

      const { data, error } = await supabase.rpc('check_daily_api_limit', {
        p_user_id: user.user.id,
        p_service_type: serviceType,
        p_daily_limit: dailyLimit
      });

      if (error) {
        console.error('Daily limit check error:', error);
        toast({
          title: "Error Checking Limit",
          description: "Unable to verify daily usage. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      const response = data as unknown as DailyUsageResponse;

      if (!response.allowed) {
        const resetDate = response.reset_time ? new Date(response.reset_time) : new Date();
        toast({
          title: "Daily Limit Reached",
          description: `You've reached your daily limit of ${response.daily_limit} ${serviceType} requests. Limit resets at ${format(resetDate, 'h:mm a')} tomorrow.`,
          variant: "destructive",
        });
        return false;
      }

      // Show warning when approaching limit
      if (response.remaining && response.remaining < 10) {
        toast({
          title: "Approaching Daily Limit",
          description: `You have ${response.remaining} ${serviceType} requests remaining today.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Daily limit check failed:', error);
      toast({
        title: "System Error",
        description: "Unable to process request. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  const getDailyUsageStats = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase.rpc('get_daily_usage_stats', {
        p_user_id: user.user.id
      });

      if (error) {
        console.error('Failed to get usage stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return null;
    }
  }, []);

  return {
    checkDailyLimit,
    getDailyUsageStats,
    isChecking,
    DAILY_LIMITS
  };
};
