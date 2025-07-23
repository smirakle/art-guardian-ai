import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Eye, 
  Shield, 
  ExternalLink, 
  Clock, 
  Globe, 
  AlertTriangle,
  Brain,
  Network,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type DeepfakeMatch = Tables<"deepfake_matches">;

const DeepfakeMatchDetails = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<DeepfakeMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("deepfake_matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error) throw error;
      setMatch(data);
    } catch (error: any) {
      console.error('Error fetching match details:', error);
      toast({
        title: "Error",
        description: "Failed to load match details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSourceClick = (sourceUrl: string, sourceType: string) => {
    if (sourceType === 'dark') {
      toast({
        title: "Dark Web Source",
        description: "This source requires Tor browser and appropriate security precautions. Proceed with caution.",
        variant: "destructive",
      });
      // Show a confirmation dialog or more detailed instructions
      return;
    }
    
    // For surface web sources, open in new tab
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const getThreatLevelColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getThreatLevelIcon = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high': return XCircle;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'dark': return Shield;
      case 'deep': return Network;
      default: return Globe;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const detected = new Date(dateString);
    const diffMs = now.getTime() - detected.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-muted-foreground">Loading match details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/upload')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Monitoring
          </Button>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Match not found. It may have been removed or you don't have access to view it.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const ThreatIcon = getThreatLevelIcon(match.threat_level);
  const SourceIcon = getSourceTypeIcon(match.source_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/upload')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Monitoring
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Deepfake Match Details</h1>
              <p className="text-muted-foreground">
                Detected {formatTimeAgo(match.detected_at)}
              </p>
            </div>
            <Badge variant={getThreatLevelColor(match.threat_level)} className="text-sm">
              <ThreatIcon className="w-4 h-4 mr-1" />
              {match.threat_level.toUpperCase()} THREAT
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detection Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Detected Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {match.image_url && (
                  <div className="mb-4">
                    {!imageError ? (
                      <img 
                        src={match.image_url}
                        alt="Detected deepfake content"
                        className="w-full max-w-md mx-auto rounded-lg border shadow-lg"
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                          setImageError(true);
                          setImageLoading(false);
                        }}
                        style={{ display: imageLoading ? 'none' : 'block' }}
                      />
                    ) : (
                      <div className="w-full max-w-md mx-auto h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                          <XCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Unable to load image</p>
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => window.open(match.image_url, '_blank')}
                          >
                            Open in new tab
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {imageLoading && (
                      <div className="w-full max-w-md mx-auto h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <Brain className="w-8 h-8 animate-pulse text-primary" />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <a 
                      href={match.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Original
                    </a>
                  </Button>
                  
                  <Button 
                    variant={match.source_type === 'dark' ? 'secondary' : 'outline'}
                    onClick={() => handleSourceClick(match.source_url, match.source_type)}
                  >
                    <SourceIcon className="w-4 h-4 mr-2" />
                    View Source
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detection Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manipulation Type</p>
                    <p className="text-lg font-semibold">{match.manipulation_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Detection Confidence</p>
                    <p className="text-lg font-semibold text-red-600">
                      {Math.round((match.detection_confidence || 0) * 100)}%
                    </p>
                  </div>
                </div>

                {match.facial_artifacts && match.facial_artifacts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Detected Artifacts</p>
                    <div className="flex flex-wrap gap-2">
                      {match.facial_artifacts.map((artifact, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {artifact}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Temporal Inconsistency:</span>
                    {match.temporal_inconsistency ? (
                      <Badge variant="destructive" className="text-xs">Detected</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">None</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Metadata Suspicious:</span>
                    {match.metadata_suspicious ? (
                      <Badge variant="destructive" className="text-xs">Yes</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Source Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SourceIcon className="w-5 h-5" />
                  Source Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Domain</p>
                  <p className="font-medium">{match.source_domain || 'Unknown'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Source Type</p>
                  <Badge variant={match.source_type === 'dark' ? 'secondary' : 'outline'}>
                    {match.source_type === 'dark' ? 'Dark Web' : 'Surface Web'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-sm">{match.source_title || 'No title available'}</p>
                </div>
                
                {match.claimed_location && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claimed Location</p>
                    <p className="text-sm">{match.claimed_location}</p>
                  </div>
                )}
                
                {match.claimed_time && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claimed Time</p>
                    <p className="text-sm">{match.claimed_time}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detection Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Detection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Detected At</p>
                  <p className="text-sm">
                    {new Date(match.detected_at).toLocaleDateString()} at{' '}
                    {new Date(match.detected_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scan Type</p>
                  <Badge variant="outline">{match.scan_type}</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Match ID</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">{match.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={match.is_reviewed ? 'default' : 'secondary'}>
                    {match.is_reviewed ? 'Reviewed' : 'Pending Review'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Report False Positive
                </Button>
                <Button variant="outline" className="w-full justify-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Request Takedown
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeMatchDetails;