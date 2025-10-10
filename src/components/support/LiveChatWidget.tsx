import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLiveChat } from '@/hooks/useUserLiveChat';
import { formatDistanceToNow } from 'date-fns';

const LiveChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    conversationId,
    messages,
    isAdminOnline,
    loading,
    initializeConversation,
    sendMessage,
    fetchMessages
  } = useUserLiveChat();

  // Initialize conversation when chat opens
  useEffect(() => {
    if (isOpen && user && !conversationId) {
      initializeConversation();
    }
  }, [isOpen, user, conversationId, initializeConversation]);

  // Fetch messages when conversation is ready
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;
    
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Support
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-sm">{isAdminOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {loading && messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Connecting to support...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Start a conversation with our support team</p>
              <p className="text-xs mt-2">
                {isAdminOnline ? 'An agent is available now!' : 'We\'ll respond as soon as possible'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender_type === 'user';
              const isBot = msg.sender_type === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] space-y-1`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isUser ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                      <span>{isUser ? 'You' : isBot ? 'Bot' : 'Support'}</span>
                      <span>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        isUser
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted mr-4'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Textarea
              placeholder={conversationId ? "Type your message..." : "Connecting..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={2}
              className="resize-none"
              disabled={!conversationId || loading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !conversationId || loading}
              size="sm"
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveChatWidget;