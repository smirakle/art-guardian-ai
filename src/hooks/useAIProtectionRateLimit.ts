import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RateLimitResponse {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
}

export const useAIProtectionRateLimit = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = useCallback(async (
    endpoint: string,
    maxRequests: number = 100,
    windowMinutes: number = 60
  ): Promise<RateLimitResponse> => {
    setIsChecking(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { allowed: false };
      }

      const { data, error } = await supabase.rpc('check_ai_protection_rate_limit', {
        user_id_param: user.user.id,
        endpoint_param: endpoint,
        max_requests_param: maxRequests,
        window_minutes_param: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: false };
      }

      if (!data) {
        toast({
          title: "Rate Limit Exceeded",
          description: `You've exceeded the rate limit for ${endpoint}. Please try again later.`,
          variant: "destructive",
        });
        return { allowed: false };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: false };
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  return {
    checkRateLimit,
    isChecking
  };
};