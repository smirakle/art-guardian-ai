import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignedUrlResult {
  signedUrl: string;
  expiresAt: string;
}

interface SignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: Date;
  };
}

// Cache signed URLs to avoid unnecessary requests
const urlCache: SignedUrlCache = {};

export const useSignedUrl = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCacheKey = (bucket: string, path: string) => `${bucket}:${path}`;

  const getSignedUrl = useCallback(async (
    bucket: string,
    path: string,
    expiresIn: number = 3600 // Default 1 hour
  ): Promise<string | null> => {
    const cacheKey = getCacheKey(bucket, path);
    
    // Check cache first
    const cached = urlCache[cacheKey];
    if (cached && cached.expiresAt > new Date(Date.now() + 60000)) {
      // Return cached if more than 1 minute until expiry
      return cached.url;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-signed-url', {
        body: { bucket, path, expiresIn }
      });

      if (fnError || !data?.signedUrl) {
        const errorMsg = data?.error || fnError?.message || 'Failed to get signed URL';
        console.error('[useSignedUrl] Error:', errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        return null;
      }

      // Cache the result
      urlCache[cacheKey] = {
        url: data.signedUrl,
        expiresAt: new Date(data.expiresAt)
      };

      setIsLoading(false);
      return data.signedUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useSignedUrl] Error:', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  }, []);

  const getMultipleSignedUrls = useCallback(async (
    files: Array<{ bucket: string; path: string; expiresIn?: number }>
  ): Promise<Map<string, string>> => {
    const results = new Map<string, string>();
    
    // Process in parallel
    await Promise.all(
      files.map(async ({ bucket, path, expiresIn }) => {
        const url = await getSignedUrl(bucket, path, expiresIn);
        if (url) {
          results.set(`${bucket}:${path}`, url);
        }
      })
    );

    return results;
  }, [getSignedUrl]);

  const clearCache = useCallback((bucket?: string, path?: string) => {
    if (bucket && path) {
      delete urlCache[getCacheKey(bucket, path)];
    } else if (bucket) {
      Object.keys(urlCache).forEach(key => {
        if (key.startsWith(`${bucket}:`)) {
          delete urlCache[key];
        }
      });
    } else {
      Object.keys(urlCache).forEach(key => delete urlCache[key]);
    }
  }, []);

  return {
    getSignedUrl,
    getMultipleSignedUrls,
    clearCache,
    isLoading,
    error
  };
};

// Helper component for displaying images from private buckets
export const useSecureImage = (bucket: string, path: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { getSignedUrl, isLoading, error } = useSignedUrl();

  const loadImage = useCallback(async () => {
    if (!bucket || !path) return;
    const url = await getSignedUrl(bucket, path);
    setImageUrl(url);
  }, [bucket, path, getSignedUrl]);

  return {
    imageUrl,
    loadImage,
    isLoading,
    error
  };
};
