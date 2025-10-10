import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DMCATakedown {
  id: string;
  violation_id: string;
  user_id: string;
  filed_at: string;
  status: string;
  platform: string;
  takedown_url?: string;
  reference_number?: string;
  response_received_at?: string;
  compliance_confirmed_at?: string;
  notes?: string;
  metadata?: any;
}

export const useAutomatedDMCA = () => {
  const [takedowns, setTakedowns] = useState<DMCATakedown[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTakedowns();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('dmca-takedowns')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_protection_dmca_notices' },
        () => {
          loadTakedowns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTakedowns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_protection_dmca_notices')
        .select('*')
        .eq('user_id', user.id)
        .order('filed_at', { ascending: false });

      if (error) throw error;
      setTakedowns(data || []);
    } catch (error) {
      console.error('Error loading DMCA takedowns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load DMCA takedowns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateTakedown = async (violationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call edge function to automate DMCA generation and sending
      const { data, error } = await supabase.functions.invoke('dmca-automation', {
        body: { action: 'initiate', violationId, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: 'DMCA Takedown Initiated',
        description: 'Automated DMCA notice has been generated and sent',
      });

      await loadTakedowns();
      return data;
    } catch (error) {
      console.error('Error initiating takedown:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate DMCA takedown',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTakedownStatus = async (takedownId: string, status: string, responseDetails?: any) => {
    try {
      const { error } = await supabase
        .from('ai_protection_dmca_notices')
        .update({ 
          status,
          notes: responseDetails ? JSON.stringify(responseDetails) : undefined,
          response_received_at: status === 'acknowledged' || status === 'responded' ? new Date().toISOString() : undefined,
          compliance_confirmed_at: status === 'complied' ? new Date().toISOString() : undefined
        })
        .eq('id', takedownId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `DMCA takedown status updated to ${status}`,
      });

      await loadTakedowns();
    } catch (error) {
      console.error('Error updating takedown status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update takedown status',
        variant: 'destructive',
      });
    }
  };

  const getTakedownStats = () => {
    return {
      total: takedowns.length,
      pending: takedowns.filter(t => t.status === 'pending').length,
      sent: takedowns.filter(t => t.status === 'sent').length,
      complied: takedowns.filter(t => t.status === 'complied').length,
      rejected: takedowns.filter(t => t.status === 'rejected').length,
      complianceRate: takedowns.length > 0 
        ? Math.round((takedowns.filter(t => t.status === 'complied').length / takedowns.length) * 100)
        : 0
    };
  };

  return {
    takedowns,
    loading,
    initiateTakedown,
    updateTakedownStatus,
    getTakedownStats,
    reloadTakedowns: loadTakedowns
  };
};
