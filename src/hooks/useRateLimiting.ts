import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstLimit?: number;
  cooldownMs?: number;
}

interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  isThrottled: boolean;
  canMakeRequest: boolean;
}

export const useRateLimiting = (config: RateLimitConfig) => {
  const [status, setStatus] = useState<RateLimitStatus>({
    remaining: config.maxRequests,
    resetTime: Date.now() + config.windowMs,
    isThrottled: false,
    canMakeRequest: true
  });

  const requestTimes = useRef<number[]>([]);
  const lastBurstTime = useRef<number>(0);
  const burstCount = useRef<number>(0);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean old requests
    requestTimes.current = requestTimes.current.filter(time => time > windowStart);
    
    // Check burst protection
    if (config.burstLimit && config.cooldownMs) {
      if (now - lastBurstTime.current < config.cooldownMs) {
        if (burstCount.current >= config.burstLimit) {
          setStatus(prev => ({
            ...prev,
            isThrottled: true,
            canMakeRequest: false,
            remaining: 0
          }));
          return false;
        }
      } else {
        burstCount.current = 0;
        lastBurstTime.current = now;
      }
    }
    
    // Check rate limit
    if (requestTimes.current.length >= config.maxRequests) {
      setStatus(prev => ({
        ...prev,
        isThrottled: true,
        canMakeRequest: false,
        remaining: 0,
        resetTime: requestTimes.current[0] + config.windowMs
      }));
      return false;
    }
    
    // Update status
    const remaining = config.maxRequests - requestTimes.current.length;
    setStatus({
      remaining,
      resetTime: now + config.windowMs,
      isThrottled: false,
      canMakeRequest: true
    });
    
    return true;
  }, [config]);

  const makeRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> => {
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }
    
    const now = Date.now();
    requestTimes.current.push(now);
    
    if (config.burstLimit) {
      burstCount.current++;
    }
    
    try {
      const result = await requestFn();
      
      // Update status after successful request
      setStatus(prev => ({
        ...prev,
        remaining: prev.remaining - 1
      }));
      
      return result;
    } catch (error) {
      // Remove request from tracking on failure
      requestTimes.current.pop();
      if (config.burstLimit) {
        burstCount.current--;
      }
      throw error;
    }
  }, [checkRateLimit, config.burstLimit]);

  const getWaitTime = useCallback((): number => {
    if (!status.isThrottled) return 0;
    return Math.max(0, status.resetTime - Date.now());
  }, [status]);

  const reset = useCallback(() => {
    requestTimes.current = [];
    burstCount.current = 0;
    setStatus({
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      isThrottled: false,
      canMakeRequest: true
    });
  }, [config]);

  return {
    status,
    makeRequest,
    getWaitTime,
    reset,
    checkRateLimit
  };
};