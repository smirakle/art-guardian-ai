import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface WebSocketMessage {
  type: 'message' | 'status_update' | 'case_created' | 'file_upload' | 'join_case' | 'leave_case';
  case_id?: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  status?: string;
  metadata?: any;
}

interface ConnectionInfo {
  socket: WebSocket;
  user_id: string;
  case_id?: string;
  user_type: 'client' | 'professional' | 'admin';
}

// Store active connections
const connections = new Map<string, ConnectionInfo>();

console.log("Legal Real-time Messaging service starting...");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();
    let connectionInfo: ConnectionInfo | null = null;

    socket.onopen = () => {
      console.log(`WebSocket connection opened: ${connectionId}`);
      socket.send(JSON.stringify({
        type: 'connection_established',
        connection_id: connectionId,
        timestamp: new Date().toISOString()
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log(`Received message:`, message);

        // Handle authentication and connection setup
        if (message.type === 'join_case') {
          const { case_id, user_id, user_type } = message.metadata || {};
          
          if (!case_id || !user_id || !user_type) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Missing required fields: case_id, user_id, user_type'
            }));
            return;
          }

          // Verify user has access to this case
          const { data: caseData, error: caseError } = await supabase
            .from('legal_cases')
            .select('*')
            .eq('id', case_id)
            .or(`user_id.eq.${user_id},professional_id.in.(select id from legal_professionals where email in (select email from auth.users where id='${user_id}'))`)
            .single();

          if (caseError || !caseData) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Access denied to this case'
            }));
            return;
          }

          connectionInfo = {
            socket,
            user_id,
            case_id,
            user_type: user_type as 'client' | 'professional' | 'admin'
          };

          connections.set(connectionId, connectionInfo);

          socket.send(JSON.stringify({
            type: 'joined_case',
            case_id,
            user_type,
            timestamp: new Date().toISOString()
          }));

          // Notify other participants
          broadcastToCase(case_id, {
            type: 'user_joined',
            user_id,
            user_type,
            timestamp: new Date().toISOString()
          }, [connectionId]);

          return;
        }

        if (!connectionInfo) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Must join a case first'
          }));
          return;
        }

        // Handle different message types
        switch (message.type) {
          case 'message':
            await handleMessage(supabase, connectionInfo, message);
            break;
          case 'status_update':
            await handleStatusUpdate(supabase, connectionInfo, message);
            break;
          case 'file_upload':
            await handleFileUpload(supabase, connectionInfo, message);
            break;
          default:
            socket.send(JSON.stringify({
              type: 'error',
              message: `Unknown message type: ${message.type}`
            }));
        }

      } catch (error) {
        console.error('Error handling message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
      if (connectionInfo) {
        // Notify other participants
        broadcastToCase(connectionInfo.case_id!, {
          type: 'user_left',
          user_id: connectionInfo.user_id,
          user_type: connectionInfo.user_type,
          timestamp: new Date().toISOString()
        }, [connectionId]);
      }
      connections.delete(connectionId);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
    };

    return response;

  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to establish WebSocket connection' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleMessage(supabase: any, connectionInfo: ConnectionInfo, message: WebSocketMessage) {
  const { content, case_id } = message;
  const { user_id, user_type } = connectionInfo;

  if (!content || !case_id) {
    connectionInfo.socket.send(JSON.stringify({
      type: 'error',
      message: 'Message content and case_id are required'
    }));
    return;
  }

  try {
    // Store message in database
    const { data, error } = await supabase
      .from('legal_messages')
      .insert({
        case_id,
        sender_id: user_id,
        sender_type: user_type,
        message_type: 'text',
        content,
        metadata: message.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing message:', error);
      connectionInfo.socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to store message'
      }));
      return;
    }

    // Broadcast to all case participants
    broadcastToCase(case_id, {
      type: 'new_message',
      message: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling message:', error);
    connectionInfo.socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process message'
    }));
  }
}

async function handleStatusUpdate(supabase: any, connectionInfo: ConnectionInfo, message: WebSocketMessage) {
  const { status, case_id, content } = message;
  const { user_id, user_type } = connectionInfo;

  if (!status || !case_id) {
    connectionInfo.socket.send(JSON.stringify({
      type: 'error',
      message: 'Status and case_id are required'
    }));
    return;
  }

  try {
    // Update case status
    const { error: updateError } = await supabase
      .from('legal_cases')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', case_id);

    if (updateError) {
      console.error('Error updating case status:', updateError);
      return;
    }

    // Create system message
    if (content) {
      await supabase
        .from('legal_messages')
        .insert({
          case_id,
          sender_id: user_id,
          sender_type: 'system',
          message_type: 'status_update',
          content: content || `Case status updated to: ${status}`,
          metadata: { old_status: message.metadata?.old_status, new_status: status }
        });
    }

    // Broadcast status update
    broadcastToCase(case_id, {
      type: 'status_updated',
      status,
      updated_by: user_id,
      user_type,
      message: content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling status update:', error);
    connectionInfo.socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to update status'
    }));
  }
}

async function handleFileUpload(supabase: any, connectionInfo: ConnectionInfo, message: WebSocketMessage) {
  const { file_url, file_name, case_id } = message;
  const { user_id, user_type } = connectionInfo;

  if (!file_url || !file_name || !case_id) {
    connectionInfo.socket.send(JSON.stringify({
      type: 'error',
      message: 'File URL, name, and case_id are required'
    }));
    return;
  }

  try {
    // Store file message in database
    const { data, error } = await supabase
      .from('legal_messages')
      .insert({
        case_id,
        sender_id: user_id,
        sender_type: user_type,
        message_type: 'file',
        content: `Shared file: ${file_name}`,
        file_url,
        file_name,
        metadata: message.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing file message:', error);
      return;
    }

    // Broadcast file upload
    broadcastToCase(case_id, {
      type: 'file_uploaded',
      message: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling file upload:', error);
    connectionInfo.socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process file upload'
    }));
  }
}

function broadcastToCase(case_id: string, message: any, excludeConnections: string[] = []) {
  for (const [connectionId, conn] of connections.entries()) {
    if (conn.case_id === case_id && !excludeConnections.includes(connectionId)) {
      try {
        conn.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to connection ${connectionId}:`, error);
        connections.delete(connectionId);
      }
    }
  }
}

console.log("Legal Real-time Messaging service ready!");