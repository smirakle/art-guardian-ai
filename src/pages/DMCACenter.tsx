import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gavel, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  Bell,
  Send,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Violation {
  id: string;
  artwork_id: string;
  violation_type: string;
  source_url: string;
  source_domain: string;
  confidence_score: number;
  status: string;
  detected_at: string;
  created_at: string;
}

interface DMCANotice {
  id: string;
  violation_id: string;
  platform: string;
  status: string;
  filed_at: string;
  response_status?: string | null;
  response_received_at?: string | null;
  response_data?: any;
  reference_number?: string | null;
  takedown_url?: string | null;
  cost_usd?: number | null;
  deadline_date?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export default function DMCACenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [notices, setNotices] = useState<DMCANotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newAlertCount, setNewAlertCount] = useState(0);

  // Fetch initial data
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch violations
        const { data: violationsData, error: violationsError } = await supabase
          .from('ai_training_violations')
          .select('*')
          .eq('user_id', user.id)
          .order('detected_at', { ascending: false })
          .limit(50);
        
        if (violationsError) throw violationsError;
        setViolations(violationsData || []);

        // Fetch DMCA notices
        const { data: noticesData, error: noticesError } = await supabase
          .from('ai_protection_dmca_notices')
          .select('*')
          .eq('user_id', user.id)
          .order('filed_at', { ascending: false })
          .limit(50);
        
        if (noticesError) throw noticesError;
        setNotices(noticesData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load DMCA data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Real-time subscription for new violations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dmca-violations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_training_violations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New violation detected:', payload);
          const newViolation = payload.new as Violation;
          
          setViolations(prev => [newViolation, ...prev]);
          setNewAlertCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: "🚨 New Violation Detected!",
            description: `${newViolation.violation_type} found on ${newViolation.source_domain}`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_training_violations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Violation updated:', payload);
          const updatedViolation = payload.new as Violation;
          
          setViolations(prev => 
            prev.map(v => v.id === updatedViolation.id ? updatedViolation : v)
          );
          
          toast({
            title: "Violation Updated",
            description: `Status changed to ${updatedViolation.status}`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_protection_dmca_notices',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New DMCA notice:', payload);
          const newNotice = payload.new as DMCANotice;
          
          setNotices(prev => [newNotice, ...prev]);
          
          toast({
            title: "📝 DMCA Notice Filed",
            description: `Notice filed on ${newNotice.platform}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Reset new alert count when viewing alerts
  useEffect(() => {
    if (activeTab === 'alerts') {
      setNewAlertCount(0);
    }
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'filed': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'filed': return <Send className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredViolations = violations.filter(v => {
    const matchesSearch = searchTerm === '' || 
      v.source_domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violation_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalViolations: violations.length,
    pendingViolations: violations.filter(v => v.status === 'pending').length,
    resolvedViolations: violations.filter(v => v.status === 'resolved').length,
    totalNotices: notices.length,
    successRate: violations.length > 0 
      ? Math.round((violations.filter(v => v.status === 'resolved').length / violations.length) * 100)
      : 0
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the DMCA Center
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="relative">
            <Gavel className="w-10 h-10 text-primary" />
            {newAlertCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">{newAlertCount}</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DMCA Center
          </h1>
          <Badge className="bg-green-500 animate-pulse">
            <Eye className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Real-time violation tracking and automated DMCA takedown management
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.totalViolations}</div>
            <p className="text-sm text-muted-foreground">Total Violations</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500 animate-pulse" />
            <div className="text-2xl font-bold">{stats.pendingViolations}</div>
            <p className="text-sm text-muted-foreground">Pending Action</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.resolvedViolations}</div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.totalNotices}</div>
            <p className="text-sm text-muted-foreground">DMCA Notices</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Live Alerts
            {newAlertCount > 0 && (
              <Badge className="ml-2 bg-red-500 animate-bounce">{newAlertCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notices">
            <FileText className="h-4 w-4 mr-2" />
            DMCA Notices
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Live Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search violations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="filed">Filed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Violations List */}
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading violations...</p>
              </CardContent>
            </Card>
          ) : filteredViolations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Violations Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Your content is protected and no violations have been detected'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredViolations.map((violation, index) => (
                <Card 
                  key={violation.id} 
                  className="border-l-4 hover:shadow-lg transition-all animate-fade-in"
                  style={{ 
                    borderLeftColor: violation.confidence_score > 0.8 ? '#ef4444' : violation.confidence_score > 0.6 ? '#f59e0b' : '#10b981',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          violation.confidence_score > 0.8 ? 'bg-red-100 dark:bg-red-950' : 
                          violation.confidence_score > 0.6 ? 'bg-orange-100 dark:bg-orange-950' : 
                          'bg-yellow-100 dark:bg-yellow-950'
                        }`}>
                          <AlertTriangle className={`h-6 w-6 ${
                            violation.confidence_score > 0.8 ? 'text-red-600' : 
                            violation.confidence_score > 0.6 ? 'text-orange-600' : 
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {violation.violation_type}
                          </CardTitle>
                          <CardDescription>
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                {violation.source_domain}
                              </span>
                              <span className="text-xs">
                                Detected {new Date(violation.detected_at).toLocaleString()}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(violation.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(violation.status)}
                            <span className="capitalize">{violation.status}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(violation.confidence_score * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Threat Level</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={violation.confidence_score * 100} 
                            className="w-32 h-2"
                          />
                          <span className="font-medium">
                            {violation.confidence_score > 0.8 ? 'High' : 
                             violation.confidence_score > 0.6 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </div>
                      
                      {violation.source_url && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground truncate flex-1">
                            {violation.source_url}
                          </span>
                          <Button size="sm" variant="outline" asChild>
                            <a href={violation.source_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          File DMCA
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* DMCA Notices Tab */}
        <TabsContent value="notices" className="space-y-6">
          {notices.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No DMCA Notices Filed</h3>
                <p className="text-muted-foreground">
                  File your first DMCA notice from the Live Alerts tab
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notices.map((notice, index) => (
                <Card 
                  key={notice.id}
                  className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">
                          DMCA Notice - {notice.platform}
                        </CardTitle>
                        <CardDescription>
                          Filed {new Date(notice.filed_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(notice.status)}>
                        {getStatusIcon(notice.status)}
                        <span className="capitalize ml-1">{notice.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {notice.response_status && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response:</span>
                          <span className="font-medium">{notice.response_status}</span>
                        </div>
                      )}
                      {notice.response_received_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Date:</span>
                          <span>{new Date(notice.response_received_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Notice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Violation Trends</CardTitle>
                <CardDescription>Detection patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>This Week</span>
                    <Badge>{violations.filter(v => 
                      new Date(v.detected_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>This Month</span>
                    <Badge>{violations.filter(v => 
                      new Date(v.detected_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>All Time</span>
                    <Badge>{violations.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average resolution duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                    <div className="text-3xl font-bold mb-2">2.3 days</div>
                    <p className="text-sm text-muted-foreground">Average Response Time</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold mb-1">1.2 days</div>
                      <p className="text-xs text-muted-foreground">Fastest</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold mb-1">4.8 days</div>
                      <p className="text-xs text-muted-foreground">Slowest</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
