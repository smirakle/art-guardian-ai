import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Bot
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface AdminChatConversationProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (conversationId: string, message: string) => Promise<void>;
  onUpdateStatus: (conversationId: string, status: 'waiting' | 'active' | 'resolved' | 'closed') => Promise<void>;
  onClose: () => void;
}

const AdminChatConversation: React.FC<AdminChatConversationProps> = ({
  conversationId,
  messages,
  onSendMessage,
  onUpdateStatus,
  onClose
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(conversationId, newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickResponses = [
    "Thanks for contacting support! I'll help you with that.",
    "Could you provide more details about the issue?",
    "I've escalated this to our technical team.",
    "Your issue has been resolved. Let me know if you need anything else!"
  ];

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Customer Support Chat</h3>
              <p className="text-sm text-muted-foreground">
                Conversation #{conversationId.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(conversationId, 'resolved')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Resolve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(conversationId, 'closed')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.sender_type === 'admin';
              const isBot = msg.sender_type === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback>
                      {isBot ? <Bot className="w-4 h-4" /> : isAdmin ? 'A' : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col gap-1 max-w-[70%] ${isAdmin ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{isAdmin ? 'You' : isBot ? 'Bot' : 'User'}</span>
                      <span>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div
                      className={`rounded-lg p-3 ${
                        isAdmin
                          ? 'bg-primary text-primary-foreground'
                          : isBot
                          ? 'bg-muted'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {!msg.is_read && !isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        Unread
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Quick Responses */}
      <div className="border-t px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {quickResponses.map((response, idx) => (
          <Button
            key={idx}
            size="sm"
            variant="outline"
            onClick={() => setNewMessage(response)}
            className="whitespace-nowrap"
          >
            {response}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <CardFooter className="border-t flex-shrink-0">
        <div className="flex w-full gap-2">
          <Textarea
            placeholder="Type your message... (Shift+Enter for new line)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[60px] max-h-[200px]"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminChatConversation;