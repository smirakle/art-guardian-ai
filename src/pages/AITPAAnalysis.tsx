import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Search, Filter, ChevronDown, ChevronUp, RefreshCw, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ThreatDetection {
  id: string;
  created_at: string;
  detected_at: string;
  threat_type: string;
  threat_level: string;
  confidence_score: number;
  source_url: string;
  threat_data: any;
  platform: string;
  status: string;
  user_id: string;
  agent_id: string;
}

type Severity = 'low' | 'medium' | 'high' | 'critical';
type ThreatStatus = 'new' | 'reviewing' | 'resolved' | 'dismissed';

const AITPAAnalysis = () => {
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<ThreatDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'confidence'>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetection | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'resolve' | 'dismiss' | null }>({ open: false, action: null });

  useEffect(() => {
    fetchThreats();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('threat-detections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_threat_detections'
        },
        (payload) => {
          console.log('Real-time threat update:', payload);
          fetchThreats();
          if (payload.eventType === 'INSERT') {
            toast.info('New threat detected!', {
              description: `${payload.new.threat_type} on ${payload.new.platform}`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [threats, searchTerm, severityFilter, typeFilter, statusFilter, platformFilter, sortBy]);

  const fetchThreats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to view threat analysis');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_threat_detections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setThreats(data || []);
      
      if (showRefreshing && data) {
        toast.success(`Refreshed - ${data.length} threats loaded`);
      }
    } catch (error) {
      console.error('Error fetching threats:', error);
      toast.error('Failed to load threat detections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateThreatStatus = async (threatId: string, status: ThreatStatus) => {
    try {
      const { error } = await supabase
        .from('ai_threat_detections')
        .update({ status })
        .eq('id', threatId);

      if (error) throw error;

      setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status } : t));
      toast.success(`Threat marked as ${status}`);
    } catch (error) {
      console.error('Error updating threat:', error);
      toast.error('Failed to update threat status');
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...threats];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(threat =>
        threat.threat_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.source_url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(threat => mapThreatLevelToSeverity(threat.threat_level) === severityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(threat => threat.status === statusFilter);
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(threat => threat.platform === platformFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(threat => threat.threat_type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          const aSev = mapThreatLevelToSeverity(a.threat_level);
          const bSev = mapThreatLevelToSeverity(b.threat_level);
          return severityOrder[bSev] - severityOrder[aSev];
        case 'confidence':
          return b.confidence_score - a.confidence_score;
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredThreats(filtered);
  };

  const mapThreatLevelToSeverity = (level: string): Severity => {
    const normalized = level.toLowerCase();
    if (normalized.includes('critical')) return 'critical';
    if (normalized.includes('high')) return 'high';
    if (normalized.includes('medium') || normalized.includes('moderate')) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    const mapped = mapThreatLevelToSeverity(severity);
    switch (mapped) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getThreatTypeIcon = (type: string) => {
    if (type.includes('deepfake')) return '🎭';
    if (type.includes('unauthorized')) return '⚠️';
    if (type.includes('style')) return '🎨';
    if (type.includes('nft')) return '🪙';
    return '🔍';
  };

  const uniqueTypes = Array.from(new Set(threats.map(t => t.threat_type)));
  const uniquePlatforms = Array.from(new Set(threats.map(t => t.platform)));

  const stats = {
    total: threats.length,
    critical: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'critical').length,
    high: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'high').length,
    medium: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'medium').length,
    low: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'low').length,
    new: threats.filter(t => t.status === 'new').length,
    resolved: threats.filter(t => t.status === 'resolved').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AITPA Threat Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time comprehensive threat detection and analysis
          </p>
        </div>
        <Button 
          onClick={() => fetchThreats(true)} 
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.low}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {uniquePlatforms.map(platform => (
                  <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredThreats.length} of {threats.length} threats</span>
            {filteredThreats.length < threats.length && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setPlatformFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Threat List */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-4">
        {filteredThreats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No threats detected</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || severityFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your content is currently safe'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredThreats.map((threat) => (
            <Collapsible
              key={threat.id}
              open={expandedId === threat.id}
              onOpenChange={(open) => setExpandedId(open ? threat.id : null)}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl">{getThreatTypeIcon(threat.threat_type)}</div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 flex-wrap">
                            {threat.threat_type.replace(/_/g, ' ').toUpperCase()}
                            <Badge className={getSeverityColor(threat.threat_level)}>
                              {mapThreatLevelToSeverity(threat.threat_level).toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{threat.platform}</Badge>
                            <Badge className={getStatusColor(threat.status)}>
                              {threat.status.toUpperCase()}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Confidence:</span>
                              <span className="text-foreground">
                                {(threat.confidence_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Detected:</span>
                              <span className="text-foreground">
                                {new Date(threat.detected_at || threat.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Status:</span>
                              <Badge variant="outline">{threat.status}</Badge>
                            </div>
                            {threat.source_url && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Source:</span>
                                <a
                                  href={threat.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {threat.source_url.substring(0, 50)}...
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                            {threat.threat_data?.detection_method && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Method:</span>
                                <span className="text-foreground capitalize">
                                  {threat.threat_data.detection_method.replace(/_/g, ' ')}
                                </span>
                              </div>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedId === threat.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Detection Details</h4>
                        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Platform: </span>
                            <span>{threat.platform}</span>
                          </div>
                          <div>
                            <span className="font-medium">Threat Level: </span>
                            <span className="capitalize">{threat.threat_level}</span>
                          </div>
                          <div>
                            <span className="font-medium">Agent ID: </span>
                            <span className="font-mono text-xs">{threat.agent_id}</span>
                          </div>
                          {threat.threat_data?.risk_factors && (
                            <div>
                              <span className="font-medium">Risk Factors: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {threat.threat_data.risk_factors.map((factor: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {factor.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {threat.threat_data && (
                        <div>
                          <h4 className="font-semibold mb-2">Threat Data</h4>
                          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64">
                            {JSON.stringify(threat.threat_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {threat.status === 'new' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateThreatStatus(threat.id, 'reviewing')}
                            >
                              Start Review
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="gap-1"
                              onClick={() => {
                                setSelectedThreat(threat);
                                setActionDialog({ open: true, action: 'resolve' });
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Resolved
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="gap-1"
                              onClick={() => {
                                setSelectedThreat(threat);
                                setActionDialog({ open: true, action: 'dismiss' });
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                              Dismiss
                            </Button>
                          </>
                        )}
                        {threat.status === 'reviewing' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="gap-1"
                              onClick={() => updateThreatStatus(threat.id, 'resolved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Resolved
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateThreatStatus(threat.id, 'dismissed')}
                            >
                              Dismiss
                            </Button>
                          </>
                        )}
                        {(threat.status === 'resolved' || threat.status === 'dismissed') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateThreatStatus(threat.id, 'new')}
                          >
                            Reopen
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(threat.source_url, '_blank')}
                          className="gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Source
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'resolve' ? 'Resolve Threat?' : 'Dismiss Threat?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'resolve' 
                ? 'Mark this threat as resolved. This action can be reversed later.'
                : 'Dismiss this threat. This indicates it is a false positive or not actionable.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedThreat && actionDialog.action) {
                  updateThreatStatus(
                    selectedThreat.id, 
                    actionDialog.action === 'resolve' ? 'resolved' : 'dismissed'
                  );
                  setActionDialog({ open: false, action: null });
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AITPAAnalysis;
