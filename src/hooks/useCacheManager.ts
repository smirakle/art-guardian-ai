import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheStats {
  total_entries: number;
  total_hits: number;
  total_misses: number;
  hit_rate: string;
  total_size_bytes: number;
  entries: Array<{
    cache_key: string;
    hit_count: number;
    miss_count: number;
    size_bytes: number;
    ttl_seconds: number;
    last_accessed: string;
  }>;
}

export const useCacheManager = () => {
  const invalidateCache = useCallback(async (keyOrPattern: string, isPattern: boolean = false) => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: {
          action: 'invalidate',
          [isPattern ? 'pattern' : 'cache_key']: keyOrPattern
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw error;
    }
  }, []);

  const getCacheStats = useCallback(async (): Promise<CacheStats> => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'get_stats' }
      });

      if (error) throw error;
      return data.stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      throw error;
    }
  }, []);

  const updateMetrics = useCallback(async (metrics: Array<{
    cache_key: string;
    hit_count: number;
    miss_count: number;
    size_bytes: number;
    ttl_seconds: number;
    last_accessed: string;
  }>) => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: {
          action: 'update_metrics',
          metrics
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cache metrics:', error);
      throw error;
    }
  }, []);

  const warmCache = useCallback(async (keys: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: {
          action: 'warm_cache',
          keys
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error warming cache:', error);
      throw error;
    }
  }, []);

  const cleanupExpired = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'cleanup_expired' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
      throw error;
    }
  }, []);

  return {
    invalidateCache,
    getCacheStats,
    updateMetrics,
    warmCache,
    cleanupExpired
  };
};
