import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LegalMessage {
  id: string;
  case_id: string;
  sender_id: string;
  sender_type: 'client' | 'professional' | 'system';
  message_type: 'text' | 'file' | 'status_update' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

interface LegalCase {
  id: string;
  user_id: string;
  professional_id: string;
  case_type: string;
  jurisdiction: string;
  status: string;
  priority: string;
  title: string;
  description?: string;
  estimated_cost?: number;
  estimated_timeline?: string;
  created_at: string;
}

interface ConnectionStatus {
  connected: boolean;
  case_id?: string;
  error?: string;
}

export const useLegalRealtimeMessaging = (caseId?: string) => {
  const [messages, setMessages] = useState<LegalMessage[]>([]);
  const [currentCase, setCurrentCase] = useState<LegalCase | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Load case data and messages
  const loadCaseData = useCallback(async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Load case details
      const { data: caseData, error: caseError } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (caseError) {
        console.error('Error loading case:', caseError);
        return;
      }

      setCurrentCase(caseData);

      // Load existing messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('legal_messages')
        .select('*')
        .eq('case_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return;
      }

      setMessages((messagesData || []) as LegalMessage[]);
    } catch (error) {
      console.error('Error loading case data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConnectionStatus({ connected: false, error: 'Not authenticated' });
        return;
      }

      // Determine user type
      let userType = 'client';
      try {
        const { data: professional } = await supabase
          .from('legal_professionals')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (professional) {
          userType = 'professional';
        }
      } catch (error) {
        // User is not a professional, continue as client
      }

      const wsUrl = `wss://utneaqmbyjwxaqrrarpc.functions.supabase.co/functions/v1/legal-realtime-messaging`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus({ connected: true, case_id: id });
        reconnectAttempts.current = 0;

        // Join the case
        ws.send(JSON.stringify({
          type: 'join_case',
          metadata: {
            case_id: id,
            user_id: user.id,
            user_type: userType
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          switch (data.type) {
            case 'connection_established':
              console.log('Connection established:', data.connection_id);
              break;

            case 'joined_case':
              console.log('Joined case:', data.case_id);
              break;

            case 'new_message':
              setMessages(prev => [...prev, data.message]);
              break;

            case 'status_updated':
              setCurrentCase(prev => prev ? { ...prev, status: data.status } : null);
              // Add system message for status update
              if (data.message) {
                const systemMessage: LegalMessage = {
                  id: crypto.randomUUID(),
                  case_id: id,
                  sender_id: data.updated_by,
                  sender_type: 'system',
                  message_type: 'status_update',
                  content: data.message,
                  is_read: false,
                  metadata: { status: data.status },
                  created_at: data.timestamp
                };
                setMessages(prev => [...prev, systemMessage]);
              }
              break;

            case 'file_uploaded':
              setMessages(prev => [...prev, data.message]);
              break;

            case 'user_joined':
              setOnlineUsers(prev => [...prev.filter(u => u !== data.user_id), data.user_id]);
              break;

            case 'user_left':
              setOnlineUsers(prev => prev.filter(u => u !== data.user_id));
              break;

            case 'error':
              console.error('WebSocket error:', data.message);
              setConnectionStatus({ connected: false, error: data.message });
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus({ connected: false });
        setOnlineUsers([]);
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          console.log(`Attempting reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket(id);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus({ connected: false, error: 'Connection error' });
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionStatus({ connected: false, error: 'Failed to connect' });
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User disconnected');
      websocketRef.current = null;
    }
    
    setConnectionStatus({ connected: false });
    setOnlineUsers([]);
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, metadata?: any) => {
    if (!websocketRef.current || !caseId) return;

    websocketRef.current.send(JSON.stringify({
      type: 'message',
      case_id: caseId,
      content,
      metadata
    }));
  }, [caseId]);

  // Update case status
  const updateCaseStatus = useCallback((status: string, message?: string) => {
    if (!websocketRef.current || !caseId) return;

    websocketRef.current.send(JSON.stringify({
      type: 'status_update',
      case_id: caseId,
      status,
      content: message,
      metadata: { old_status: currentCase?.status }
    }));
  }, [caseId, currentCase?.status]);

  // Send file
  const sendFile = useCallback((fileUrl: string, fileName: string, metadata?: any) => {
    if (!websocketRef.current || !caseId) return;

    websocketRef.current.send(JSON.stringify({
      type: 'file_upload',
      case_id: caseId,
      file_url: fileUrl,
      file_name: fileName,
      metadata
    }));
  }, [caseId]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    try {
      await supabase
        .from('legal_messages')
        .update({ is_read: true })
        .in('id', messageIds);

      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  // Initialize connection when caseId changes
  useEffect(() => {
    if (caseId) {
      loadCaseData(caseId);
      connectWebSocket(caseId);
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [caseId, loadCaseData, connectWebSocket, disconnect]);

  // Set up real-time subscriptions for database changes
  useEffect(() => {
    if (!caseId) return;

    const messageSubscription = supabase
      .channel(`legal_messages_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'legal_messages',
          filter: `case_id=eq.${caseId}`
        },
        (payload) => {
          console.log('New message from subscription:', payload);
          // WebSocket handles this, but fallback for offline scenarios
          if (!connectionStatus.connected) {
            setMessages(prev => [...prev, payload.new as LegalMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'legal_cases',
          filter: `id=eq.${caseId}`
        },
        (payload) => {
          console.log('Case updated from subscription:', payload);
          if (!connectionStatus.connected) {
            setCurrentCase(payload.new as LegalCase);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [caseId, connectionStatus.connected]);

  return {
    messages,
    currentCase,
    connectionStatus,
    onlineUsers,
    isLoading,
    sendMessage,
    updateCaseStatus,
    sendFile,
    markMessagesAsRead,
    disconnect
  };
};