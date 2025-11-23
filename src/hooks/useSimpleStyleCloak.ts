import { useState } from 'react';
import { cloakImageFromFile, CloakOptions } from '@/lib/styleCloak';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type ProtectionPreset = 'light' | 'standard' | 'maximum';

interface UseSimpleStyleCloakResult {
  processing: boolean;
  resultBlob: Blob | null;
  resultUrl: string | null;
  applyProtection: (file: File, preset: ProtectionPreset) => Promise<void>;
  reset: () => void;
}

const PRESET_CONFIG: Record<ProtectionPreset, CloakOptions> = {
  light: {
    strength: 0.2,
    frequency: 6,
    colorJitter: 0.05,
    useSegmentation: false,
  },
  standard: {
    strength: 0.35,
    frequency: 8,
    colorJitter: 0.1,
    useSegmentation: true,
  },
  maximum: {
    strength: 0.5,
    frequency: 12,
    colorJitter: 0.15,
    useSegmentation: true,
  },
};

export function useSimpleStyleCloak(): UseSimpleStyleCloakResult {
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const applyProtection = async (file: File, preset: ProtectionPreset) => {
    try {
      setProcessing(true);
      
      const options = PRESET_CONFIG[preset];
      
      // Rate limit check
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (userId) {
          const { data: allowed } = await supabase.rpc('check_ai_protection_rate_limit', {
            user_id_param: userId,
            endpoint_param: 'style_cloak',
            max_requests_param: 200,
            window_minutes_param: 60,
          });
          if (allowed === false) {
            toast.error('You\'ve used this feature a lot today. Please try again later.');
            return;
          }
        }
      } catch (e) {
        console.warn('Rate limit check skipped', e);
      }

      toast.info('Adding invisible AI protection...');
      
      const blob = await cloakImageFromFile(file, options);
      
      setResultBlob(blob);
      
      // Create preview URL
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      toast.success('Your art is now protected! 🛡️');
    } catch (error: any) {
      console.error('Protection failed:', error);
      toast.error(error?.message || 'Failed to protect image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(null);
    setResultUrl(null);
  };

  return {
    processing,
    resultBlob,
    resultUrl,
    applyProtection,
    reset,
  };
}
