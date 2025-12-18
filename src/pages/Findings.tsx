import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Eye, 
  ExternalLink,
  Brain,
  Shield,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Gavel
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

interface DeepfakeMatch {
  id: string;
  source_url: string;
  source_domain: string;
  source_title: string;
  image_url: string;
  detection_confidence: number;
  manipulation_type: string;
  threat_level: string;
  source_type: string;
  detected_at: string;
  is_reviewed: boolean;
}

interface CopyrightMatch {
  id: string;
  source_url: string;
  source_domain: string;
  source_title: string;
  match_confidence: number;
  match_type: string;
  threat_level: string;
  detected_at: string;
  image_url: string;
  thumbnail_url: string;
  is_authorized: boolean;
  is_reviewed: boolean;
  dmca_filed: boolean;
}

interface AIViolation {
  id: string;
  violation_type: string;
  source_url: string;
  source_domain: string;
  confidence_score: number;
  status: string;
  detected_at: string;
}

const Findings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deepfakeMatches, setDeepfakeMatches] = useState<DeepfakeMatch[]>([]);
  const [copyrightMatches, setCopyrightMatches] = useState<CopyrightMatch[]>([]);
  const [aiViolations, setAIViolations] = useState<AIViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadAllFindings();
  }, [user]);

  const loadAllFindings = async () => {
    try {
      setLoading(true);
      
      // Load deepfake matches
      const { data: deepfakeData } = await supabase
        .from('deepfake_matches')
        .select('*')
        .order('detected_at', { ascending: false });

      if (deepfakeData) {
        setDeepfakeMatches(deepfakeData);
      }

      // Load copyright matches
      if (user) {
        const { data: copyrightData } = await supabase
          .from('copyright_matches')
          .select('*')
          .order('detected_at', { ascending: false });

        if (copyrightData) {
          setCopyrightMatches(copyrightData);
        }

        // Load AI training violations
        const { data: violationData } = await supabase
          .from('ai_training_violations')
          .select('*')
          .eq('user_id', user.id)
          .order('detected_at', { ascending: false });

        if (violationData) {
          setAIViolations(violationData);
        }
      }
    } catch (error) {
      console.error('Error loading findings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalFindings = deepfakeMatches.length + copyrightMatches.length + aiViolations.length;
  const highPriorityCount = [
    ...deepfakeMatches.filter(m => m.threat_level === 'high'),
    ...copyrightMatches.filter(m => m.threat_level === 'high'),
  ].length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = [
    ...deepfakeMatches.filter(m => new Date(m.detected_at) > oneWeekAgo),
    ...copyrightMatches.filter(m => new Date(m.detected_at) > oneWeekAgo),
    ...aiViolations.filter(v => new Date(v.detected_at) > oneWeekAgo),
  ].length;

  const pendingReview = [
    ...deepfakeMatches.filter(m => !m.is_reviewed),
    ...copyrightMatches.filter(m => !m.is_reviewed),
    ...aiViolations.filter(v => v.status === 'detected'),
  ].length;

  const getThreatBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const filterFindings = <T extends { threat_level?: string; source_domain?: string; source_url?: string; is_reviewed?: boolean; status?: string }>(
    items: T[]
  ): T[] => {
    return items.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDomain = item.source_domain?.toLowerCase().includes(query);
        const matchesUrl = item.source_url?.toLowerCase().includes(query);
        if (!matchesDomain && !matchesUrl) return false;
      }
      
      // Threat filter
      if (threatFilter !== 'all' && item.threat_level !== threatFilter) return false;
      
      // Status filter
      if (statusFilter !== 'all') {
        const isReviewed = item.is_reviewed || item.status === 'resolved';
        if (statusFilter === 'reviewed' && !isReviewed) return false;
        if (statusFilter === 'pending' && isReviewed) return false;
      }
      
      return true;
    });
  };

  const filteredDeepfake = filterFindings(deepfakeMatches);
  const filteredCopyright = filterFindings(copyrightMatches);
  const filteredViolations = filterFindings(aiViolations.map(v => ({ ...v, threat_level: 'high' })));

  const renderFindingCard = (
    finding: DeepfakeMatch | CopyrightMatch | AIViolation,
    type: 'deepfake' | 'copyright' | 'ai_violation'
  ) => {
    const isDeepfake = type === 'deepfake';
    const isCopyright = type === 'copyright';
    const threat_level = 'threat_level' in finding ? finding.threat_level : 'high';
    
    return (
      <Card key={finding.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className={`w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 ${getThreatColor(threat_level)}`}>
              {isDeepfake ? (
                <Brain className="h-10 w-10" />
              ) : isCopyright ? (
                <Shield className="h-10 w-10" />
              ) : (
                <AlertTriangle className="h-10 w-10" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isDeepfake && 'manipulation_type' in finding ? `Deepfake: ${finding.manipulation_type}` : 
                     isCopyright && 'match_type' in finding ? `Copyright: ${finding.match_type}` :
                     'violation_type' in finding ? `AI Training: ${finding.violation_type}` : 'Unknown'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {finding.source_domain || 'Unknown source'}
                  </p>
                </div>
                <Badge variant={getThreatBadgeVariant(threat_level)} className="flex-shrink-0">
                  {threat_level} risk
                </Badge>
              </div>
              
              {/* Stats row */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(finding.detected_at)}
                </span>
                {'detection_confidence' in finding && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round(finding.detection_confidence * 100)}% confidence
                  </span>
                )}
                {'match_confidence' in finding && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round(finding.match_confidence * 100)}% match
                  </span>
                )}
                {'confidence_score' in finding && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round(finding.confidence_score * 100)}% confidence
                  </span>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(finding.source_url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Source
                </Button>
                {isCopyright && !('dmca_filed' in finding && finding.dmca_filed) && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/dmca-center')}
                  >
                    <Gavel className="h-3 w-3 mr-1" />
                    File DMCA
                  </Button>
                )}
                {'is_reviewed' in finding && !finding.is_reviewed && (
                  <Button variant="ghost" size="sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Mark Reviewed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Findings</h1>
          <p className="text-muted-foreground mt-1">
            All detected copyright violations, deepfakes, and unauthorized AI training
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalFindings}</p>
                <p className="text-sm text-muted-foreground">Total Findings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{highPriorityCount}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{newThisWeek}</p>
                <p className="text-sm text-muted-foreground">New This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingReview}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by domain or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={threatFilter} onValueChange={setThreatFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Threat Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threats</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Findings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">{totalFindings}</Badge>
          </TabsTrigger>
          <TabsTrigger value="copyright" className="gap-2">
            Copyright
            <Badge variant="secondary" className="ml-1">{filteredCopyright.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="gap-2">
            Deepfake
            <Badge variant="secondary" className="ml-1">{filteredDeepfake.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ai_training" className="gap-2">
            AI Training
            <Badge variant="secondary" className="ml-1">{filteredViolations.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredCopyright.length === 0 && filteredDeepfake.length === 0 && filteredViolations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No findings match your filters</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredDeepfake.map(match => renderFindingCard(match, 'deepfake'))}
              {filteredCopyright.map(match => renderFindingCard(match, 'copyright'))}
              {filteredViolations.map(violation => renderFindingCard(violation as any, 'ai_violation'))}
            </>
          )}
        </TabsContent>

        <TabsContent value="copyright" className="mt-6 space-y-4">
          {filteredCopyright.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No copyright matches found</h3>
                <p className="text-muted-foreground">Your content appears to be safe from unauthorized use</p>
              </CardContent>
            </Card>
          ) : (
            filteredCopyright.map(match => renderFindingCard(match, 'copyright'))
          )}
        </TabsContent>

        <TabsContent value="deepfake" className="mt-6 space-y-4">
          {filteredDeepfake.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No deepfakes detected</h3>
                <p className="text-muted-foreground">No AI-manipulated content has been found</p>
              </CardContent>
            </Card>
          ) : (
            filteredDeepfake.map(match => renderFindingCard(match, 'deepfake'))
          )}
        </TabsContent>

        <TabsContent value="ai_training" className="mt-6 space-y-4">
          {filteredViolations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No AI training violations</h3>
                <p className="text-muted-foreground">Your content hasn't been detected in AI training datasets</p>
              </CardContent>
            </Card>
          ) : (
            filteredViolations.map(violation => renderFindingCard(violation as any, 'ai_violation'))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Findings;
