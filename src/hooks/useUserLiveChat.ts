import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'bot';
  message: string;
  created_at: string;
  is_read: boolean;
}

export const useUserLiveChat = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Create or get existing conversation
  const initializeConversation = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for existing active conversation
      const { data: existing } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user.id,
          status: 'waiting',
          priority: 'medium',
          subject: 'Chat Support Request'
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(newConv.id);
      return newConv.id;

    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send message
  const sendMessage = useCallback(async (message: string) => {
    if (!conversationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'user',
          message
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  }, [conversationId, toast]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as Message[]);

      // Mark messages as read
      await supabase
        .from('support_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'admin')
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversationId]);

  // Check admin online status
  const checkAdminOnlineStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_online_status')
        .select('*')
        .eq('is_online', true)
        .limit(1);

      if (error) throw error;

      setIsAdminOnline((data && data.length > 0) || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`user-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          
          // Play notification sound for admin messages
          if ((payload.new as Message).sender_type === 'admin') {
            new Audio('/notification.mp3').play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  // Check admin status periodically
  useEffect(() => {
    checkAdminOnlineStatus();
    const interval = setInterval(checkAdminOnlineStatus, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [checkAdminOnlineStatus]);

  return {
    conversationId,
    messages,
    isAdminOnline,
    loading,
    initializeConversation,
    sendMessage,
    fetchMessages
  };
};