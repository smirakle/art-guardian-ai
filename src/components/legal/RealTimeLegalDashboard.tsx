import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLegalRealtimeMessaging } from '@/hooks/useLegalRealtimeMessaging';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Scale, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Send,
  Paperclip,
  Video,
  Phone,
  Calendar,
  FileText,
  Gavel,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface LegalCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  jurisdiction: string;
  created_at: string;
  updated_at: string;
  estimated_cost?: number;
  professional_id?: string;
  professional?: {
    full_name: string;
    specialties: string[];
    rating?: number;
  };
}

export const RealTimeLegalDashboard: React.FC = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    case_type: '',
    jurisdiction: '',
    priority: 'normal'
  });

  const {
    messages,
    currentCase,
    connectionStatus,
    onlineUsers,
    sendMessage,
    updateCaseStatus,
    markMessagesAsRead
  } = useLegalRealtimeMessaging(selectedCaseId || undefined);

  // Load user's cases
  useEffect(() => {
    const loadCases = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('legal_cases')
          .select(`
            *,
            legal_professionals (
              full_name,
              specialties,
              rating
            )
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading cases:', error);
          return;
        }

        setCases(data || []);
        
        // Auto-select first case if none selected
        if (!selectedCaseId && data && data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      } catch (error) {
        console.error('Error loading cases:', error);
      }
    };

    loadCases();

    // Set up real-time subscription for case updates
    const subscription = supabase
      .channel('legal_cases_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_cases'
        },
        () => {
          loadCases(); // Reload cases on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedCaseId]);

  const createNewCase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('legal_cases')
        .insert({
          ...newCase,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        toast.error('Failed to create case');
        return;
      }

      toast.success('Case created successfully');
      setIsCreatingCase(false);
      setNewCase({
        title: '',
        description: '',
        case_type: '',
        jurisdiction: '',
        priority: 'normal'
      });
      
      // Add to cases list and select it
      setCases(prev => [data, ...prev]);
      setSelectedCaseId(data.id);

    } catch (error) {
      console.error('Error creating case:', error);
      toast.error('Failed to create case');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateCaseStatus(newStatus, `Case status updated to: ${newStatus}`);
    toast.success(`Case status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'waiting_client': return 'bg-orange-500';
      case 'waiting_documents': return 'bg-purple-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Scale className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Real-Time Legal Network</h1>
          <Badge className="bg-green-500">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Your Cases
                </CardTitle>
                <Button 
                  onClick={() => setIsCreatingCase(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  New Case
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {cases.map((legalCase) => (
                    <div
                      key={legalCase.id}
                      onClick={() => setSelectedCaseId(legalCase.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedCaseId === legalCase.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm truncate">{legalCase.title}</h3>
                        <Badge className={`text-xs ${getPriorityColor(legalCase.priority)}`}>
                          {legalCase.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {legalCase.case_type}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(legalCase.status)}`}>
                          {legalCase.status}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(legalCase.created_at))} ago
                      </p>
                    </div>
                  ))}
                  
                  {cases.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No cases yet</p>
                      <Button 
                        onClick={() => setIsCreatingCase(true)}
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Create your first case
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCaseId && currentCase ? (
              <>
                {/* Case Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold">{currentCase.title}</h2>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-600">
                              {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(currentCase.status)}>
                            {currentCase.status}
                          </Badge>
                          <Badge className={getPriorityColor(currentCase.priority)}>
                            {currentCase.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {currentCase.case_type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Video Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Jurisdiction</p>
                        <p className="text-gray-600">{currentCase.jurisdiction}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-gray-600">
                          {formatDistanceToNow(new Date(currentCase.created_at))} ago
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Online Users</p>
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{onlineUsers.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Case Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Select onValueChange={handleStatusUpdate}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting_client">Waiting for Client</SelectItem>
                          <SelectItem value="waiting_documents">Waiting for Documents</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Request Evidence
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Real-Time Communication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 border rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_type === 'system' 
                                ? 'justify-center' 
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                message.sender_type === 'system'
                                  ? 'bg-gray-100 text-gray-700 text-sm'
                                  : message.sender_type === 'professional'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {message.sender_type}
                                </span>
                                <span className="text-xs opacity-70">
                                  {formatDistanceToNow(new Date(message.created_at))} ago
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              
                              {message.file_url && (
                                <div className="mt-2 p-2 bg-white/20 rounded">
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="text-xs">{message.file_name}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {messages.length === 0 && (
                          <div className="text-center text-gray-500 py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <div className="flex items-center gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={!connectionStatus.connected}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || !connectionStatus.connected}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Scale className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Case</h3>
                  <p>Choose a case from the sidebar to start communicating</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Create New Case Modal */}
        {isCreatingCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Legal Case</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Case Title"
                  value={newCase.title}
                  onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                />
                
                <Textarea
                  placeholder="Case Description"
                  value={newCase.description}
                  onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                />
                
                <Select onValueChange={(value) => setNewCase(prev => ({ ...prev, case_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Case Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copyright">Copyright</SelectItem>
                    <SelectItem value="trademark">Trademark</SelectItem>
                    <SelectItem value="patent">Patent</SelectItem>
                    <SelectItem value="trade_secret">Trade Secret</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="dmca">DMCA</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Jurisdiction (e.g., California, USA)"
                  value={newCase.jurisdiction}
                  onChange={(e) => setNewCase(prev => ({ ...prev, jurisdiction: e.target.value }))}
                />
                
                <Select onValueChange={(value) => setNewCase(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button onClick={createNewCase} className="flex-1">
                    Create Case
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingCase(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeLegalDashboard;