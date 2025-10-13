import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enablePersistence?: boolean;
  compressionThreshold?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed?: boolean;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  maxSize: number;
  evictions: number;
}

export const useEnhancedCaching = <T = any>(config: CacheConfig) => {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const metricsBuffer = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    cacheSize: 0,
    maxSize: config.maxSize,
    evictions: 0
  });

  // Load from persistent storage on mount
  useEffect(() => {
    if (config.enablePersistence) {
      loadFromPersistentStorage();
    }
  }, [config.enablePersistence]);

  const calculateSize = useCallback((data: T): number => {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Default size if calculation fails
    }
  }, []);

  const compressData = useCallback((data: T): { data: T; compressed: boolean } => {
    if (!config.compressionThreshold) return { data, compressed: false };
    
    const size = calculateSize(data);
    if (size < config.compressionThreshold) return { data, compressed: false };
    
    // Simple compression simulation - in real app, use actual compression
    return { data, compressed: true };
  }, [config.compressionThreshold, calculateSize]);

  const evictLRU = useCallback(() => {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of cache.current) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      cache.current.delete(oldestKey);
      setStats(prev => ({ ...prev, evictions: prev.evictions + 1 }));
    }
  }, []);

  const enforceSizeLimit = useCallback(() => {
    let totalSize = 0;
    for (const entry of cache.current.values()) {
      totalSize += entry.size;
    }
    
    while (totalSize > config.maxSize && cache.current.size > 0) {
      evictLRU();
      totalSize = 0;
      for (const entry of cache.current.values()) {
        totalSize += entry.size;
      }
    }
  }, [config.maxSize, evictLRU]);

  const set = useCallback((key: string, data: T, customTTL?: number) => {
    const now = Date.now();
    const ttl = customTTL || config.defaultTTL;
    const { data: processedData, compressed } = compressData(data);
    const size = calculateSize(processedData);
    
    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      size,
      compressed
    };
    
    cache.current.set(key, entry);
    enforceSizeLimit();
    
    if (config.enablePersistence) {
      saveToPersistentStorage();
    }
    
    updateStats();
  }, [config.defaultTTL, config.enablePersistence, compressData, calculateSize, enforceSizeLimit]);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    const now = Date.now();
    
    setStats(prev => ({ ...prev, totalRequests: prev.totalRequests + 1 }));
    
    if (!entry) {
      setStats(prev => ({ 
        ...prev, 
        missRate: (prev.totalRequests * prev.missRate + 1) / (prev.totalRequests + 1)
      }));
      return null;
    }
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      setStats(prev => ({ 
        ...prev, 
        missRate: (prev.totalRequests * prev.missRate + 1) / (prev.totalRequests + 1)
      }));
      return null;
    }
    
    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    
    setStats(prev => ({ 
      ...prev, 
      hitRate: (prev.totalRequests * prev.hitRate + 1) / (prev.totalRequests + 1)
    }));
    
    return entry.data;
  }, []);

  const invalidate = useCallback((keyPattern?: string) => {
    if (!keyPattern) {
      cache.current.clear();
    } else {
      const regex = new RegExp(keyPattern);
      for (const key of cache.current.keys()) {
        if (regex.test(key)) {
          cache.current.delete(key);
        }
      }
    }
    
    updateStats();
    
    if (config.enablePersistence) {
      saveToPersistentStorage();
    }
  }, [config.enablePersistence]);

  const getOrFetch = useCallback(async (
    key: string,
    fetchFn: () => Promise<T>,
    customTTL?: number
  ): Promise<T> => {
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await fetchFn();
    set(key, data, customTTL);
    return data;
  }, [get, set]);

  const updateStats = useCallback(() => {
    let totalSize = 0;
    for (const entry of cache.current.values()) {
      totalSize += entry.size;
    }
    
    setStats(prev => ({ ...prev, cacheSize: totalSize }));
    
    // Buffer metrics for batch sync to backend
    for (const [key, entry] of cache.current) {
      metricsBuffer.current.set(key, entry);
    }
  }, []);

  const saveToPersistentStorage = useCallback(() => {
    try {
      const serialized = JSON.stringify(Array.from(cache.current.entries()));
      localStorage.setItem('enhanced-cache', serialized);
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }, []);

  const loadFromPersistentStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('enhanced-cache');
      if (stored) {
        const entries = JSON.parse(stored);
        cache.current = new Map(entries);
        updateStats();
      }
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }, [updateStats]);

  // Cleanup expired entries and sync metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;
      
      for (const [key, entry] of cache.current) {
        if (now - entry.timestamp > entry.ttl) {
          cache.current.delete(key);
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        updateStats();
        if (config.enablePersistence) {
          saveToPersistentStorage();
        }
      }
    }, 60000); // Check every minute
    
    // Sync metrics to backend every 5 minutes
    const metricsInterval = setInterval(() => {
      if (metricsBuffer.current.size > 0) {
        const metrics = Array.from(metricsBuffer.current.entries()).map(([key, entry]) => ({
          cache_key: key,
          hit_count: entry.accessCount,
          miss_count: 0,
          size_bytes: entry.size,
          ttl_seconds: Math.floor(entry.ttl / 1000),
          last_accessed: new Date(entry.lastAccessed).toISOString()
        }));
        
        // Send to backend cache manager
        fetch('https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/cache-manager', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          },
          body: JSON.stringify({
            action: 'update_metrics',
            metrics
          })
        }).catch(err => console.warn('Failed to sync cache metrics:', err));
        
        metricsBuffer.current.clear();
      }
    }, 300000); // Sync every 5 minutes
    
    return () => {
      clearInterval(interval);
      clearInterval(metricsInterval);
    };
  }, [config.enablePersistence, updateStats, saveToPersistentStorage]);

  return {
    set,
    get,
    invalidate,
    getOrFetch,
    stats,
    clear: () => invalidate(),
    size: cache.current.size
  };
};