import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ArtworkLimitStatus {
  canUpload: boolean;
  currentCount: number;
  artworkLimit: number;
  remainingSlots: number;
  message: string;
  isLoading: boolean;
}

export const useArtworkLimit = () => {
  const { user } = useAuth();
  const { isAdmin, artworkLimit: subscriptionLimit } = useSubscription();
  const [status, setStatus] = useState<ArtworkLimitStatus>({
    canUpload: false,
    currentCount: 0,
    artworkLimit: 0,
    remainingSlots: 0,
    message: 'Loading...',
    isLoading: true,
  });

  const checkLimit = useCallback(async (filesToUpload: number = 1): Promise<ArtworkLimitStatus> => {
    if (!user) {
      return {
        canUpload: false,
        currentCount: 0,
        artworkLimit: 0,
        remainingSlots: 0,
        message: 'Authentication required',
        isLoading: false,
      };
    }

    // Admin bypass - always allow
    if (isAdmin) {
      return {
        canUpload: true,
        currentCount: 0,
        artworkLimit: -1,
        remainingSlots: 999999,
        message: 'Admin: Unlimited uploads',
        isLoading: false,
      };
    }

    try {
      const { data, error } = await supabase
        .rpc('check_artwork_limit_before_upload', { files_to_upload: filesToUpload });

      if (error) {
        console.error('Error checking artwork limit:', error);
        // Fallback to client-side check
        const { count } = await supabase
          .from('artwork')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        const currentCount = count || 0;
        const remaining = subscriptionLimit - currentCount;
        
        return {
          canUpload: remaining >= filesToUpload,
          currentCount,
          artworkLimit: subscriptionLimit,
          remainingSlots: Math.max(0, remaining),
          message: remaining >= filesToUpload 
            ? `You can upload ${remaining} more artworks`
            : `Upload limit reached. ${currentCount} of ${subscriptionLimit} artworks used.`,
          isLoading: false,
        };
      }

      const result = data?.[0];
      if (!result) {
        return {
          canUpload: false,
          currentCount: 0,
          artworkLimit: 0,
          remainingSlots: 0,
          message: 'Unable to check limit',
          isLoading: false,
        };
      }

      return {
        canUpload: result.can_upload,
        currentCount: Number(result.current_count),
        artworkLimit: result.artwork_limit,
        remainingSlots: Number(result.remaining_slots),
        message: result.message,
        isLoading: false,
      };
    } catch (error) {
      console.error('Error in checkLimit:', error);
      return {
        canUpload: false,
        currentCount: 0,
        artworkLimit: 0,
        remainingSlots: 0,
        message: 'Error checking limit',
        isLoading: false,
      };
    }
  }, [user, isAdmin, subscriptionLimit]);

  const refreshStatus = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    const newStatus = await checkLimit(1);
    setStatus(newStatus);
    return newStatus;
  }, [checkLimit]);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshStatus();
    } else {
      setStatus({
        canUpload: false,
        currentCount: 0,
        artworkLimit: 0,
        remainingSlots: 0,
        message: 'Sign in to upload',
        isLoading: false,
      });
    }
  }, [user, refreshStatus]);

  return {
    ...status,
    checkLimit,
    refreshStatus,
  };
};
