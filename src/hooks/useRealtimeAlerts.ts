import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Alert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  delivery_channels: string[];
  delivery_status: any;
  source_data: any;
  is_escalated: boolean;
  escalation_level: number;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useRealtimeAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    unacknowledged: 0,
    unresolved: 0
  });

  const loadAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('advanced_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlerts(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const critical = data?.filter(a => a.severity === 'critical').length || 0;
      const unacknowledged = data?.filter(a => !a.acknowledged_at).length || 0;
      const unresolved = data?.filter(a => !a.resolved_at).length || 0;
      
      setStats({ total, critical, unacknowledged, unresolved });
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('advanced_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id
        })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Alert acknowledged');
      await loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  }, [user, loadAlerts]);

  const resolveAlert = useCallback(async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('advanced_alerts')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Alert resolved');
      await loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  }, [user, loadAlerts]);

  const startMonitoring = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('threat-monitor', {
        body: { action: 'start', userId: user.id }
      });

      if (error) throw error;

      toast.success('Real-time monitoring started');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Failed to start monitoring');
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    loadAlerts();

    const channel = supabase
      .channel('advanced_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'advanced_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Alert update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newAlert = payload.new as Alert;
            setAlerts(prev => [newAlert, ...prev]);
            
            // Show toast for new critical alerts
            if (newAlert.severity === 'critical') {
              toast.error(newAlert.title, {
                description: newAlert.message,
                duration: 10000
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => 
              prev.map(alert => 
                alert.id === payload.new.id ? payload.new as Alert : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => 
              prev.filter(alert => alert.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadAlerts]);

  return {
    alerts,
    loading,
    stats,
    acknowledgeAlert,
    resolveAlert,
    startMonitoring,
    refresh: loadAlerts
  };
};
