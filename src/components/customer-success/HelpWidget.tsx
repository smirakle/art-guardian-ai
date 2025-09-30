import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Book, 
  Video, 
  Mail,
  HelpCircle,
  ExternalLink,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: Date;
}

export const HelpWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState<'menu' | 'chat' | 'contact'>('menu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();
  const { user } = useAuth();

  const quickHelp = [
    { icon: Book, label: 'Documentation', url: '/faq', color: 'text-blue-500' },
    { icon: Video, label: 'Video Tutorials', url: '#tutorials', color: 'text-purple-500' },
    { icon: HelpCircle, label: 'FAQ', url: '/faq', color: 'text-green-500' },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        text: 'Thank you for reaching out! Our team will respond shortly. In the meantime, check our FAQ for quick answers.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 1000);
  };

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // For now, just show success message
      // TODO: Create support_tickets table in database
      console.log('Support ticket submission:', contactForm);

      toast({
        title: 'Message sent!',
        description: 'Our support team will contact you within 24 hours.'
      });

      setContactForm({ name: '', email: '', message: '' });
      setView('menu');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 shadow-2xl z-50 transition-all ${
      isMinimized ? 'w-64 h-14' : 'w-96 h-[600px]'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <CardTitle className="text-lg">Help & Support</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 h-[calc(100%-60px)]">
          {view === 'menu' && (
            <div className="p-4 space-y-4 h-full overflow-y-auto">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Quick Actions</div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => setView('chat')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">Live Chat</div>
                      <div className="text-xs text-muted-foreground">Get instant help</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => setView('contact')}
                  >
                    <Mail className="h-4 w-4 mr-2 text-purple-500" />
                    <div className="text-left">
                      <div className="font-medium">Email Support</div>
                      <div className="text-xs text-muted-foreground">Response within 24h</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Resources</div>
                <div className="grid grid-cols-1 gap-2">
                  {quickHelp.map((item) => (
                    <Button
                      key={item.label}
                      variant="outline"
                      className="justify-start"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <item.icon className={`h-4 w-4 mr-2 ${item.color}`} />
                      {item.label}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="font-medium text-sm">Need urgent help?</div>
                <div className="text-xs text-muted-foreground">
                  Enterprise customers can call our 24/7 hotline
                </div>
                <Badge variant="secondary" className="mt-2">
                  +1 (800) TSMO-HELP
                </Badge>
              </div>
            </div>
          )}

          {view === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 p-3 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('menu')}
                  className="h-8 w-8 p-0"
                >
                  ←
                </Button>
                <div className="text-sm font-medium">Live Chat</div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Start a conversation with our support team
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm">{msg.text}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {view === 'contact' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 p-3 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('menu')}
                  className="h-8 w-8 p-0"
                >
                  ←
                </Button>
                <div className="text-sm font-medium">Email Support</div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue..."
                    rows={6}
                  />
                </div>
              </div>

              <div className="p-3 border-t">
                <Button onClick={handleContactSubmit} className="w-full">
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
