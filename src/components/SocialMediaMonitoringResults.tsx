import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { 
  Eye, 
  ExternalLink, 
  AlertTriangle, 
  Shield, 
  Activity,
  Youtube,
  Facebook,
  Instagram,
  Play,
  Image,
  FileText,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Info,
  Calendar,
  Gauge,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringResult {
  id: string;
  account_id: string;
  scan_id: string;
  content_type: string;
  content_url: string;
  content_title: string;
  content_description: string;
  thumbnail_url: string;
  detection_type: string;
  confidence_score: number;
  threat_level: string;
  artifacts_detected: string[];
  is_reviewed: boolean;
  detected_at: string;
  account: {
    platform: string;
    account_handle: string;
    account_name?: string;
  };
}

const SocialMediaMonitoringResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<MonitoringResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadResults();
      setupRealtimeSubscription();
    }
  }, [user, filter]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('social-media-results-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'social_media_monitoring_results' },
        (payload) => {
          console.log('New social media detection:', payload.new);
          loadResults(); // Reload to get complete data with account info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('social_media_monitoring_results')
        .select(`
          *,
          account:social_media_accounts(platform, account_handle, account_name)
        `)
        .order('detected_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('detection_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (resultId: string) => {
    try {
      const { error } = await supabase
        .from('social_media_monitoring_results')
        .update({ is_reviewed: true })
        .eq('id', resultId);

      if (error) throw error;

      setResults(prev => prev.map(result => 
        result.id === resultId ? { ...result, is_reviewed: true } : result
      ));
    } catch (error) {
      console.error('Error marking as reviewed:', error);
    }
  };

  const toggleExpanded = (resultId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'tiktok': return <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center">T</div>;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'post': return <FileText className="w-4 h-4" />;
      case 'story': return <Star className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getDetectionTypeColor = (type: string) => {
    switch (type) {
      case 'deepfake': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'copyright': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'impersonation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const detected = new Date(dateString);
    const diffMs = now.getTime() - detected.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getDetectionDescription = (type: string) => {
    switch (type) {
      case 'deepfake': return 'AI-generated or manipulated content detected using facial inconsistencies, temporal artifacts, and metadata analysis.';
      case 'copyright': return 'Potential unauthorized use of copyrighted content detected through visual similarity matching.';
      case 'impersonation': return 'Account impersonation detected through profile analysis and content comparison.';
      default: return 'Suspicious activity detected requiring further review.';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to view monitoring results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Social Media Monitoring Results
          </CardTitle>
          <CardDescription>
            Real-time detection results from your monitored social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Detections
            </Button>
            <Button
              variant={filter === 'deepfake' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('deepfake')}
            >
              Deepfakes
            </Button>
            <Button
              variant={filter === 'copyright' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('copyright')}
            >
              Copyright
            </Button>
            <Button
              variant={filter === 'impersonation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('impersonation')}
            >
              Impersonation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading monitoring results...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No monitoring results found</p>
              <p className="text-sm text-muted-foreground">
                {filter === 'all' 
                  ? 'Add social media accounts to start monitoring' 
                  : `No ${filter} detections found`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {results.map((result) => {
                const isExpanded = expandedResults.has(result.id);
                return (
                  <div key={result.id} className={`p-6 hover:bg-muted/30 transition-colors ${!result.is_reviewed ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={result.thumbnail_url}
                          alt="Content thumbnail"
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getPlatformIcon(result.account.platform)}
                          <span className="font-medium">@{result.account.account_handle}</span>
                          <span className="text-muted-foreground">•</span>
                          {getContentIcon(result.content_type)}
                          <span className="text-sm text-muted-foreground capitalize">{result.content_type}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{formatTimeAgo(result.detected_at)}</span>
                        </div>

                        <h3 className="font-medium text-lg mb-1">{result.content_title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {result.content_description}
                        </p>

                        {/* Detection Summary */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={getDetectionTypeColor(result.detection_type)}>
                            {result.detection_type}
                          </Badge>
                          <Badge variant={getThreatColor(result.threat_level)}>
                            {result.threat_level} threat
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Gauge className="w-4 h-4" />
                            {Math.round(result.confidence_score * 100)}% confidence
                          </div>
                        </div>

                        {/* Quick Artifacts Preview */}
                        {result.artifacts_detected.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {result.artifacts_detected.slice(0, 3).map((artifact, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {artifact}
                                </Badge>
                              ))}
                              {result.artifacts_detected.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{result.artifacts_detected.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(result.id)}
                          className="flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          Details
                        </Button>
                        
                        {!result.is_reviewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsReviewed(result.id)}
                          >
                            Mark Reviewed
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.content_url, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <Collapsible open={isExpanded}>
                      <CollapsibleContent className="mt-4 pt-4 border-t space-y-4">
                        {/* Detection Analysis */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            <h4 className="font-medium">Detection Analysis</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {getDetectionDescription(result.detection_type)}  
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Target className="w-3 h-3" />
                                <span className="font-medium">Detection Type</span>
                              </div>
                              <p className="text-muted-foreground capitalize">{result.detection_type}</p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Gauge className="w-3 h-3" />
                                <span className="font-medium">Confidence Score</span>
                              </div>
                              <p className="text-muted-foreground">
                                {Math.round(result.confidence_score * 100)}% ({result.confidence_score.toFixed(4)})
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">Detected At</span>
                              </div>
                              <p className="text-muted-foreground">
                                {new Date(result.detected_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* All Artifacts */}
                        {result.artifacts_detected.length > 0 && (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2">All Detected Artifacts ({result.artifacts_detected.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {result.artifacts_detected.map((artifact, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                                  <span>{artifact}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Content Metadata */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Content Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">URL: </span>
                              <a 
                                href={result.content_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline break-all"
                              >
                                {result.content_url}
                              </a>
                            </div>
                            <div>
                              <span className="font-medium">Platform: </span>
                              <span className="capitalize">{result.account.platform}</span>
                            </div>
                            <div>
                              <span className="font-medium">Account: </span>
                              <span>@{result.account.account_handle}</span>
                              {result.account.account_name && (
                                <span className="text-muted-foreground"> ({result.account.account_name})</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Content Type: </span>
                              <span className="capitalize">{result.content_type}</span>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {!result.is_reviewed && (
                      <Alert className="mt-4 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          New detection requires review. Consider taking appropriate action if this is unauthorized use.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaMonitoringResults;