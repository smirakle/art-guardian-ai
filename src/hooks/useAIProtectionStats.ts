import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIProtectionStats {
  totalProtected: number;
  lightProtected: number;
  standardProtected: number;
  maximumProtected: number;
  recentlyProtected: Array<{
    id: string;
    artworkId: string;
    protectionLevel: string;
    createdAt: string;
  }>;
}

export function useAIProtectionStats() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['ai-protection-stats', user?.id],
    queryFn: async (): Promise<AIProtectionStats> => {
      if (!user) {
        return {
          totalProtected: 0,
          lightProtected: 0,
          standardProtected: 0,
          maximumProtected: 0,
          recentlyProtected: [],
        };
      }

      const { data: records } = await supabase
        .from('ai_protection_records')
        .select('id, artwork_id, protection_level, created_at, metadata')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!records) {
        return {
          totalProtected: 0,
          lightProtected: 0,
          standardProtected: 0,
          maximumProtected: 0,
          recentlyProtected: [],
        };
      }

      // Extract preset from metadata if available
      const getPreset = (record: any): string => {
        if (record.metadata && typeof record.metadata === 'object') {
          return record.metadata.beginner_preset || record.protection_level;
        }
        return record.protection_level;
      };

      const lightProtected = records.filter(r => getPreset(r) === 'light').length;
      const standardProtected = records.filter(r => getPreset(r) === 'standard').length;
      const maximumProtected = records.filter(r => getPreset(r) === 'maximum').length;

      return {
        totalProtected: records.length,
        lightProtected,
        standardProtected,
        maximumProtected,
        recentlyProtected: records.slice(0, 10).map(r => ({
          id: r.id,
          artworkId: r.artwork_id || '',
          protectionLevel: getPreset(r),
          createdAt: r.created_at,
        })),
      };
    },
    enabled: !!user,
  });

  return {
    stats: stats || {
      totalProtected: 0,
      lightProtected: 0,
      standardProtected: 0,
      maximumProtected: 0,
      recentlyProtected: [],
    },
    isLoading,
  };
}
