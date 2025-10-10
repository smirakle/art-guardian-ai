import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  user_id: string;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  metadata: any;
  unread_count?: number;
  last_message?: string;
  user_email?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'bot';
  message: string;
  attachments: any[];
  is_read: boolean;
  created_at: string;
}

export const useAdminLiveChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Update admin online status
  const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('admin_online_status')
      .upsert({
        admin_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async (status?: string) => {
    try {
      let query = supabase
        .from('support_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Fetch user emails and unread counts
      const enrichedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', conv.user_id)
            .single();

          const { count } = await supabase
            .from('support_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .eq('sender_type', 'user');

          const { data: lastMsg } = await supabase
            .from('support_messages')
            .select('message')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            user_email: userData?.full_name || 'Unknown User',
            unread_count: count || 0,
            last_message: lastMsg?.message || ''
          };
        })
      );

      setConversations(enrichedConversations as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as Message[]);

      // Mark admin messages as read
      await supabase
        .from('support_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'user')
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId: string, message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'admin',
          message
        });

      if (error) throw error;

      // Update conversation status to active if waiting
      await supabase
        .from('support_conversations')
        .update({ 
          status: 'active',
          assigned_to: user.id
        })
        .eq('id', conversationId)
        .eq('status', 'waiting');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Update conversation status
  const updateConversationStatus = useCallback(async (
    conversationId: string, 
    status: 'waiting' | 'active' | 'resolved' | 'closed'
  ) => {
    try {
      const { error } = await supabase
        .from('support_conversations')
        .update({ status })
        .eq('id', conversationId);

      if (error) throw error;

      await fetchConversations();
      
      toast({
        title: 'Success',
        description: `Conversation marked as ${status}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update conversation status',
        variant: 'destructive'
      });
    }
  }, [fetchConversations, toast]);

  // Assign conversation
  const assignConversation = useCallback(async (conversationId: string, adminId: string) => {
    try {
      const { error } = await supabase
        .from('support_conversations')
        .update({ assigned_to: adminId, status: 'active' })
        .eq('id', conversationId);

      if (error) throw error;

      await fetchConversations();
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  }, [fetchConversations]);

  // Subscribe to real-time updates
  useEffect(() => {
    updateOnlineStatus(true);

    // Subscribe to new conversations
    const conversationChannel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to messages in active conversation
    let messageChannel: any;
    if (activeConversation) {
      messageChannel = supabase
        .channel(`messages-${activeConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `conversation_id=eq.${activeConversation}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
            
            // Play notification sound if message from user
            if ((payload.new as Message).sender_type === 'user') {
              new Audio('/notification.mp3').play().catch(() => {});
            }
          }
        )
        .subscribe();
    }

    return () => {
      updateOnlineStatus(false);
      conversationChannel.unsubscribe();
      messageChannel?.unsubscribe();
    };
  }, [activeConversation, fetchConversations, updateOnlineStatus]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    isTyping,
    loading,
    setActiveConversation,
    fetchMessages,
    sendMessage,
    updateConversationStatus,
    assignConversation,
    refreshConversations: fetchConversations
  };
};