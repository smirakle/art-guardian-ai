import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type PlanId = 'student' | 'starter' | 'professional';

interface Subscription {
  plan_id: PlanId;
  status: string;
  social_media_addon: boolean;
  deepfake_addon: boolean;
  is_active: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  hasFeature: (feature: string) => boolean;
  artworkLimit: number;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [artworkLimit, setArtworkLimit] = useState(0);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setArtworkLimit(0);
      setLoading(false);
      return;
    }

    try {
      // Get user subscription
      const { data: subData, error: subError } = await supabase
        .rpc('get_user_subscription');

      if (subError) {
        console.error('Error fetching subscription:', subError);
        setSubscription(null);
      } else if (subData && subData.length > 0) {
        const sub = subData[0];
        setSubscription({
          plan_id: sub.plan_id as PlanId,
          status: sub.status,
          social_media_addon: sub.social_media_addon,
          deepfake_addon: sub.deepfake_addon,
          is_active: sub.is_active
        });
      } else {
        setSubscription(null);
      }

      // Get artwork limit
      const { data: limitData, error: limitError } = await supabase
        .rpc('get_artwork_limit');

      if (limitError) {
        console.error('Error fetching artwork limit:', limitError);
        setArtworkLimit(0);
      } else {
        setArtworkLimit(limitData || 0);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setSubscription(null);
      setArtworkLimit(0);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!subscription?.is_active) return false;

    switch (feature) {
      case 'basic_monitoring':
      case 'visual_recognition':
        return true; // All plans

      case 'blockchain_verification':
      case 'real_time_monitoring':
      case 'automated_dmca':
      case 'advanced_ai':
      case 'priority_support':
        return subscription.plan_id === 'professional';

      case 'social_media_monitoring':
        return subscription.social_media_addon;

      case 'deepfake_detection':
        return subscription.plan_id === 'professional' || subscription.deepfake_addon;

      default:
        return false;
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const value = {
    subscription,
    loading,
    hasFeature,
    artworkLimit,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};