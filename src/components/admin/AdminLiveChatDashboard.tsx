import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminLiveChat } from '@/hooks/useAdminLiveChat';
import AdminChatConversation from './AdminChatConversation';
import { Search, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminLiveChatDashboard: React.FC = () => {
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    setActiveConversation,
    fetchMessages,
    sendMessage,
    updateConversationStatus,
    refreshConversations
  } = useAdminLiveChat();

  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'waiting' && conv.status === 'waiting') ||
      (filter === 'active' && conv.status === 'active') ||
      (filter === 'resolved' && conv.status === 'resolved');

    const matchesSearch = 
      !searchQuery ||
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const waitingCount = conversations.filter(c => c.status === 'waiting').length;
  const activeCount = conversations.filter(c => c.status === 'active').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'active': return <MessageSquare className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Sidebar - Conversations List */}
      <Card className="lg:col-span-1 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Live Support</h2>
            {waitingCount > 0 && (
              <Badge variant="destructive">{waitingCount}</Badge>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'waiting' ? 'default' : 'outline'}
              onClick={() => setFilter('waiting')}
            >
              Waiting {waitingCount > 0 && `(${waitingCount})`}
            </Button>
            <Button
              size="sm"
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active {activeCount > 0 && `(${activeCount})`}
            </Button>
            <Button
              size="sm"
              variant={filter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    fetchMessages(conv.id);
                  }}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                    activeConversation === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(conv.status)}
                      <span className="font-medium truncate">
                        {conv.user_email}
                      </span>
                    </div>
                    <Badge variant={getPriorityColor(conv.priority)} className="text-xs">
                      {conv.priority}
                    </Badge>
                  </div>

                  {conv.subject && (
                    <p className="text-sm font-medium mb-1 truncate">
                      {conv.subject}
                    </p>
                  )}

                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conv.last_message}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(conv.last_message_at || conv.created_at), {
                        addSuffix: true
                      })}
                    </span>
                    {conv.unread_count! > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Right Panel - Active Conversation */}
      <div className="lg:col-span-2">
        {activeConversation ? (
          <AdminChatConversation
            conversationId={activeConversation}
            messages={messages}
            onSendMessage={sendMessage}
            onUpdateStatus={updateConversationStatus}
            onClose={() => setActiveConversation(null)}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Conversation Selected</p>
              <p className="text-sm">Select a conversation from the list to start chatting</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminLiveChatDashboard;