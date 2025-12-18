import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Eye, 
  ExternalLink,
  Clock,
  Brain,
  Shield,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  facial_artifacts: string[];
  temporal_inconsistency: boolean;
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
}

export const RecentDetectionsWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deepfakeMatches, setDeepfakeMatches] = useState<DeepfakeMatch[]>([]);
  const [copyrightMatches, setCopyrightMatches] = useState<CopyrightMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetections();
    setupRealTimeSubscriptions();
  }, [user]);

  const loadDetections = async () => {
    try {
      // Load recent deepfake detections
      const { data: deepfakeData } = await supabase
        .from('deepfake_matches')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(5);

      if (deepfakeData) {
        setDeepfakeMatches(deepfakeData);
      }

      // Load recent copyright matches for user's artworks
      if (user) {
        const { data: copyrightData } = await supabase
          .from('copyright_matches')
          .select(`
            *,
            artwork:artwork(title, user_id)
          `)
          .eq('artwork.user_id', user.id)
          .order('detected_at', { ascending: false })
          .limit(5);

        if (copyrightData) {
          setCopyrightMatches(copyrightData);
        }
      }
    } catch (error) {
      console.error('Error loading detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to new deepfake detections
    const deepfakeChannel = supabase
      .channel('dashboard-deepfake-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'deepfake_matches' },
        (payload) => {
          const newMatch = payload.new as DeepfakeMatch;
          setDeepfakeMatches(prev => [newMatch, ...prev.slice(0, 4)]);
          
          toast({
            title: "🚨 New Deepfake Detected!",
            description: `${newMatch.manipulation_type} detected with ${Math.round(newMatch.detection_confidence * 100)}% confidence`,
            variant: "destructive",
          });
        }
      )
      .subscribe();

    // Subscribe to new copyright matches
    const copyrightChannel = supabase
      .channel('dashboard-copyright-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'copyright_matches' },
        (payload) => {
          const newMatch = payload.new as CopyrightMatch;
          setCopyrightMatches(prev => [newMatch, ...prev.slice(0, 4)]);
          
          toast({
            title: "⚠️ Copyright Match Found!",
            description: `Potential infringement detected on ${newMatch.source_domain}`,
            variant: "destructive",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deepfakeChannel);
      supabase.removeChannel(copyrightChannel);
    };
  };

  const getThreatBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Detections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDetections = deepfakeMatches.length > 0 || copyrightMatches.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Detections
            </CardTitle>
            <CardDescription className="mt-1">
              Latest deepfake and copyright violations detected
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/findings')}
            className="gap-1"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasDetections ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No recent detections</p>
            <p className="text-sm text-muted-foreground">Your content is protected and being monitored</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Deepfake Detections */}
            {deepfakeMatches.map((match) => (
              <div key={match.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Deepfake Detection: {match.manipulation_type}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {match.source_domain} • {Math.round(match.detection_confidence * 100)}% confidence
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getThreatBadgeVariant(match.threat_level)}>
                          {match.threat_level} risk
                        </Badge>
                        <Badge variant="outline">
                          {match.source_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(match.detected_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(match.source_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Copyright Detections */}
            {copyrightMatches.map((match) => (
              <div key={match.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Copyright Match: {match.match_type}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {match.source_domain} • {Math.round(match.match_confidence * 100)}% match
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getThreatBadgeVariant(match.threat_level)}>
                          {match.threat_level} risk
                        </Badge>
                        {match.is_authorized && (
                          <Badge variant="outline">
                            Authorized
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(match.detected_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(match.source_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};