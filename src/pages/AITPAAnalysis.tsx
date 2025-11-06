import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const AITPAAnalysis = () => {
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<ThreatDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'confidence'>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchThreats();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [threats, searchTerm, severityFilter, typeFilter, sortBy]);

  const fetchThreats = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching threats:', error);
      toast.error('Failed to load threat detections');
    } finally {
      setLoading(false);
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

  const stats = {
    total: threats.length,
    critical: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'critical').length,
    high: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'high').length,
    medium: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'medium').length,
    low: threats.filter(t => mapThreatLevelToSeverity(t.threat_level) === 'low').length,
  };

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
            Comprehensive threat detection and analysis dashboard
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredThreats.length} of {threats.length} threats
          </div>
        </CardContent>
      </Card>

      {/* Threat List */}
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
                          <CardTitle className="flex items-center gap-2">
                            {threat.threat_type}
                            <Badge className={getSeverityColor(threat.threat_level)}>
                              {mapThreatLevelToSeverity(threat.threat_level).toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{threat.platform}</Badge>
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
                                  className="text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {threat.source_url}
                                </a>
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
                          {threat.threat_data?.evidence && (
                            <div>
                              <span className="font-medium">Evidence: </span>
                              <span>{threat.threat_data.evidence}</span>
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

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Full Report
                        </Button>
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                        <Button size="sm" variant="outline">
                          Mark as Resolved
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
    </div>
  );
};

export default AITPAAnalysis;
