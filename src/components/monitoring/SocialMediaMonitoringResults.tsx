import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle,
  X,
  ExternalLink,
  Brain,
  Users,
  Flag,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DMCAFormDialog } from "@/components/dmca/DMCAFormDialog";

interface MonitoringResult {
  id: string;
  account_id: string;
  scan_id: string;
  detection_type: string;
  confidence_score: number;
  threat_level: string;
  content_type: string;
  content_url: string;
  content_title?: string;
  content_description?: string;
  thumbnail_url?: string;
  artifacts_detected?: string[];
  is_reviewed: boolean;
  action_taken?: string;
  detected_at: string;
}

interface SocialMediaAccount {
  id: string;
  platform: string;
  account_handle: string;
  account_url: string;
}

const SocialMediaMonitoringResults = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [results, setResults] = useState<MonitoringResult[]>([]);
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>('all');
  const [selectedDetectionType, setSelectedDetectionType] = useState<string>('all');
  const [isActioning, setIsActioning] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMonitoringResults();
      loadAccounts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('social-media-monitoring-results-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_media_monitoring_results' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setResults(prev => [payload.new as MonitoringResult, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setResults(prev => prev.map(result => 
              result.id === payload.new.id ? payload.new as MonitoringResult : result
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMonitoringResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_media_monitoring_results')
        .select(`
          *,
          account:social_media_accounts!inner(*)
        `)
        .eq('account.user_id', user.id)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error loading monitoring results:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const takeAction = async (resultId: string, action: string) => {
    setIsActioning(resultId);
    
    try {
      const { error } = await supabase
        .from('social_media_monitoring_results')
        .update({ 
          action_taken: action,
          is_reviewed: true 
        })
        .eq('id', resultId);

      if (error) throw error;

      toast({
        title: "Action Taken",
        description: `${action} action has been recorded for this detection`,
      });

    } catch (error) {
      console.error('Error taking action:', error);
      toast({
        title: "Action Failed",
        description: "Failed to record the action",
        variant: "destructive",
      });
    } finally {
      setIsActioning(null);
    }
  };

  const deleteResult = async (resultId: string) => {
    setIsActioning(resultId);
    
    try {
      const { error } = await supabase
        .from('social_media_monitoring_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;

      setResults(prev => prev.filter(result => result.id !== resultId));
      
      toast({
        title: "Result Deleted",
        description: "The monitoring result has been removed.",
      });

    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the monitoring result",
        variant: "destructive",
      });
    } finally {
      setIsActioning(null);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getDetectionTypeIcon = (type: string) => {
    switch (type) {
      case 'deepfake': return <Brain className="w-4 h-4" />;
      case 'impersonation': return <Users className="w-4 h-4" />;
      case 'copyright': return <Shield className="w-4 h-4" />;
      case 'identity_theft': return <Flag className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const filteredResults = results.filter(result => {
    const threatMatch = selectedThreatLevel === 'all' || result.threat_level === selectedThreatLevel;
    const typeMatch = selectedDetectionType === 'all' || result.detection_type === selectedDetectionType;
    return threatMatch && typeMatch;
  });

  const getAccount = (accountId: string) => accounts.find(acc => acc.id === accountId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Social Media Monitoring Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="detections" className="space-y-4">
            <TabsList>
              <TabsTrigger value="detections">Threat Detections</TabsTrigger>
              <TabsTrigger value="deepfakes">Deepfake Analysis</TabsTrigger>
              <TabsTrigger value="impersonations">Fake Accounts</TabsTrigger>
            </TabsList>

            <TabsContent value="detections" className="space-y-4">
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Threat Level:</span>
                  <div className="flex gap-2">
                    {['all', 'high', 'medium', 'low'].map(level => (
                      <Button
                        key={level}
                        variant={selectedThreatLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedThreatLevel(level)}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Detection Type:</span>
                  <div className="flex gap-2">
                    {['all', 'deepfake', 'impersonation', 'copyright', 'identity_theft'].map(type => (
                      <Button
                        key={type}
                        variant={selectedDetectionType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDetectionType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results List */}
              {filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No monitoring results found</p>
                  <p className="text-sm text-muted-foreground">
                    Results will appear here as your social media accounts are scanned
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((result) => {
                    const account = getAccount(result.account_id);
                    
                    return (
                      <Card key={result.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Header */}
                              <div className="flex items-center gap-3">
                                {getDetectionTypeIcon(result.detection_type)}
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {result.detection_type.charAt(0).toUpperCase() + 
                                     result.detection_type.slice(1).replace('_', ' ')} Detected
                                  </span>
                                  <Badge variant={getThreatLevelColor(result.threat_level)}>
                                    {result.threat_level.toUpperCase()} THREAT
                                  </Badge>
                                  <Badge variant="outline">
                                    {Math.round(result.confidence_score * 100)}% Confidence
                                  </Badge>
                                </div>
                              </div>

                              {/* Account Info */}
                              {account && (
                                <div className="text-sm text-muted-foreground">
                                  Found on {account.platform}: @{account.account_handle}
                                </div>
                              )}

                              {/* Content Info */}
                              <div className="space-y-2">
                                {result.content_title && (
                                  <p className="font-medium">{result.content_title}</p>
                                )}
                                {result.content_description && (
                                  <p className="text-sm text-muted-foreground">
                                    {result.content_description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline">{result.content_type}</Badge>
                                  <span className="text-muted-foreground">
                                    Detected {new Date(result.detected_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Artifacts */}
                              {result.artifacts_detected && result.artifacts_detected.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-sm font-medium">Detected Artifacts:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {result.artifacts_detected.map((artifact, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {artifact}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Action Taken */}
                              {result.action_taken && (
                                <Alert>
                                  <CheckCircle className="w-4 h-4" />
                                  <AlertDescription>
                                    Action taken: {result.action_taken}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            {/* Thumbnail */}
                            {result.thumbnail_url && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={result.thumbnail_url} 
                                  alt="Content thumbnail"
                                  className="w-24 h-24 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>

                           {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(result.content_url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Content
                            </Button>

                            {result.detection_type === 'copyright' && (
                              <DMCAFormDialog 
                                matchId={result.id}
                                sourceUrl={result.content_url}
                                sourceTitle={result.content_title || 'Social Media Detection'}
                              />
                            )}

                            {!result.is_reviewed && (
                              <>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => takeAction(result.id, 'blocked')}
                                  disabled={isActioning === result.id}
                                  className="flex items-center gap-2"
                                >
                                  <Ban className="w-4 h-4" />
                                  Block Account
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => takeAction(result.id, 'reported')}
                                  disabled={isActioning === result.id}
                                  className="flex items-center gap-2"
                                >
                                  <Flag className="w-4 h-4" />
                                  Report Content
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => takeAction(result.id, 'dismissed')}
                                  disabled={isActioning === result.id}
                                  className="flex items-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Dismiss
                                </Button>
                              </>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteResult(result.id)}
                              disabled={isActioning === result.id}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deepfakes" className="space-y-4">
              <Alert>
                <Brain className="w-4 h-4" />
                <AlertDescription>
                  Advanced AI analysis detects deepfake manipulations in videos and images using facial artifact detection, 
                  temporal inconsistency analysis, and metadata verification.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {filteredResults.filter(r => r.detection_type === 'deepfake').map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-red-500" />
                            <span className="font-medium">Deepfake Content Detected</span>
                            <Badge variant="destructive">
                              {Math.round(result.confidence_score * 100)}% Confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.content_title}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => takeAction(result.id, 'takedown_requested')}
                          disabled={isActioning === result.id}
                        >
                          Request Takedown
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="impersonations" className="space-y-4">
              <Alert>
                <Users className="w-4 h-4" />
                <AlertDescription>
                  Our system identifies fake accounts that impersonate you by analyzing profile information, 
                  images, and behavioral patterns across social media platforms.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {filteredResults.filter(r => r.detection_type === 'impersonation').map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">Fake Account Detected</span>
                            <Badge variant="default">
                              {Math.round(result.confidence_score * 100)}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.content_description}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => takeAction(result.id, 'account_reported')}
                          disabled={isActioning === result.id}
                        >
                          Report Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaMonitoringResults;