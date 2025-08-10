import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Bot,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'support' | 'bot';
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface SupportTicket {
  id: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  created_at: string;
}

const LiveChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Simulate initial bot message
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        message: "Hi! I'm here to help you with any questions about TSMO. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      message: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Send to support system
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.email || 'Anonymous User',
          email: user?.email || 'chat@tsmo.app',
          subject: 'Live Chat Support Request',
          message: `Chat Message: ${newMessage}`,
          type: 'chat_support'
        }
      });

      if (error) throw error;

      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );

      // Simulate bot response based on common queries
      setTimeout(() => {
        const botResponse = generateBotResponse(newMessage);
        const botMessage: ChatMessage = {
          id: crypto.randomUUID(),
          message: botResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Failed to send chat message:', error);
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('pricing') || message.includes('cost') || message.includes('price')) {
      return "Our pricing starts at $7.99/month for the Student plan. You can view all plans and features on our pricing page. Would you like me to connect you with a sales specialist for custom enterprise pricing?";
    }
    
    if (message.includes('how') && message.includes('work')) {
      return "TSMO protects your artwork by continuously monitoring the internet for unauthorized use. We use advanced AI to scan social media, e-commerce sites, and other platforms 24/7. When we detect potential theft, you receive instant alerts with actionable next steps.";
    }
    
    if (message.includes('upload') || message.includes('add')) {
      return "You can upload artwork through our dashboard. We support JPG, PNG, GIF, WebP, SVG images, and MP4, AVI, MOV videos. Simply drag and drop your files or click the upload button. Each file is processed and protected within minutes.";
    }
    
    if (message.includes('cancel') || message.includes('refund')) {
      return "You can cancel your subscription anytime from your account settings. Cancellations take effect at the end of your current billing period. For refund requests, please let me connect you with our billing team who can review your specific situation.";
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! You can also check our Help Center for detailed guides, or I can connect you with a human support agent for more complex issues. What specific area would you like assistance with?";
    }
    
    return "Thank you for your question! Let me connect you with one of our support specialists who can provide detailed assistance. In the meantime, you might find helpful information in our Help Center. Is this urgent, or can someone follow up with you via email?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] space-y-1`}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {message.sender === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span>{message.sender === 'user' ? 'You' : 'Support'}</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  {message.status && message.sender === 'user' && (
                    <div className="flex items-center gap-1">
                      {message.status === 'sending' && <Clock className="w-3 h-3" />}
                      {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                      {message.status === 'delivered' && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted mr-4'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bot className="w-3 h-3" />
                  <span>Support is typing...</span>
                </div>
                <div className="bg-muted p-3 rounded-lg mr-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              className="resize-none"
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
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

        {/* Quick Actions */}
        <div className="p-3 border-t bg-background">
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setNewMessage("How does TSMO work?")}
            >
              How it works
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setNewMessage("What are your pricing plans?")}
            >
              Pricing
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setNewMessage("I need help uploading artwork")}
            >
              Upload help
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveChatWidget;