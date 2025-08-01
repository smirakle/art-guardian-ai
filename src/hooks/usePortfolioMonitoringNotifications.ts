import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortfolioMonitoringNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  action_url?: string;
  metadata: any;
  created_at: string;
  expires_at?: string;
}

export const usePortfolioMonitoringNotifications = () => {
  const [notifications, setNotifications] = useState<PortfolioMonitoringNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('portfolio_monitoring_notifications')
        .select('*')
        .eq('user_id', user.user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter out expired notifications
      const activeNotifications = (data || []).filter(notification => 
        !notification.expires_at || new Date(notification.expires_at) > new Date()
      );

      setNotifications(activeNotifications);
      setUnreadCount(activeNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_monitoring_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const unreadNotifications = notifications.filter(n => !n.is_read);
      if (unreadNotifications.length === 0) return;

      const { error } = await supabase
        .from('portfolio_monitoring_notifications')
        .update({ is_read: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  useEffect(() => {
    loadNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('portfolio-monitoring-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_monitoring_notifications'
        },
        (payload) => {
          const newNotification = payload.new as PortfolioMonitoringNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for critical notifications
          if (newNotification.severity === 'critical') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, toast]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadNotifications
  };
};