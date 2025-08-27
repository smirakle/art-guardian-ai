import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StorageUsage {
  storage_used_bytes: number;
  storage_limit_bytes: number;
  artwork_count: number;
  storage_used_gb: string;
  storage_limit_gb: string;
  usage_percentage: number;
  active_addons: any[];
  is_near_limit: boolean;
  is_over_limit: boolean;
  last_calculated_at: string;
}

export const useStorageData = () => {
  const [storageData, setStorageData] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStorageData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-user-storage');
      
      if (error) throw error;
      
      setStorageData(data);
    } catch (error) {
      console.error('Error fetching storage data:', error);
      toast({
        title: "Error",
        description: "Failed to load storage information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStorageData = () => {
    setLoading(true);
    fetchStorageData();
  };

  useEffect(() => {
    fetchStorageData();

    // Set up real-time subscription to storage updates
    const channel = supabase
      .channel('storage-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_storage_usage'
        },
        () => {
          console.log('Storage usage updated, refreshing data...');
          fetchStorageData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'storage_addons'
        },
        () => {
          console.log('Storage addons updated, refreshing data...');
          fetchStorageData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    storageData,
    loading,
    refreshStorageData
  };
};