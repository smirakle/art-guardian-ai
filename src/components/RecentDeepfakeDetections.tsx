import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  ArrowRight, 
  Globe, 
  Link2, 
  Eye, 
  Shield,
  Clock,
  ExternalLink,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export default function RecentDeepfakeDetections() {
  const navigate = useNavigate();
  const [detections, setDetections] = useState<Tables<"deepfake_matches">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetections = async () => {
      console.log('RecentDeepfakeDetections: Fetching detections...');
      const { data, error } = await supabase
        .from("deepfake_matches")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        console.log('RecentDeepfakeDetections: Data loaded:', data.length, 'detections');
        setDetections(data);
      } else {
        console.error('RecentDeepfakeDetections: Error loading data:', error);
      }
      setLoading(false);
    };

    fetchDetections();
    
    // Set up real-time subscription for new detections
    const channel = supabase
      .channel('deepfake-detections')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'deepfake_matches' 
        }, 
        (payload) => {
          setDetections(prev => [payload.new as Tables<"deepfake_matches">, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getThreatLevelVariant = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    return sourceType === 'dark' ? Shield : Globe;
  };

  const handleSourceClick = (sourceUrl: string, sourceType: string) => {
    if (sourceType === 'dark') {
      // For dark web sources, show a warning or info dialog
      alert(`This is a dark web source (${sourceUrl}). Access requires Tor browser and appropriate precautions.`);
    } else {
      // For surface web sources, open directly
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 animate-spin" />
            Loading recent detections...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (detections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5 text-muted-foreground" />
            No deepfakes detected yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring is active. Detected deepfakes will appear here as they're found across surface and dark web sources.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Deepfake Detections</h3>
        <Badge variant="outline" className="text-xs">
          {detections.length} detections
        </Badge>
      </div>
      
      {detections.map((detection) => {
        const SourceIcon = getSourceIcon(detection.source_type);
        
        return (
          <Card key={detection.id} className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SourceIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-base sm:text-lg truncate">
                    {detection.source_title || "Unknown Source"}
                  </span>
                  {detection.source_type === 'dark' && (
                    <Badge variant="outline" className="text-xs">
                      Dark Web
                    </Badge>
                  )}
                </div>
                <Badge variant={getThreatLevelVariant(detection.threat_level)} className="text-xs self-start sm:self-center">
                  {detection.threat_level.toUpperCase()} THREAT
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {detection.thumbnail_url && (
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img 
                      src={detection.thumbnail_url} 
                      alt="Detected content" 
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Manipulation Type:</p>
                      <p className="text-xs sm:text-sm text-foreground font-semibold">
                        {detection.manipulation_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Confidence:</p>
                      <p className="text-xs sm:text-sm text-foreground font-semibold">
                        {Math.round(detection.detection_confidence * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Source Domain:</p>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        {detection.source_domain || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Detected:</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(detection.detected_at).toLocaleDateString()} {new Date(detection.detected_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  {detection.facial_artifacts && detection.facial_artifacts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs sm:text-sm font-medium mb-1">Detected Artifacts:</p>
                      <div className="flex flex-wrap gap-1">
                        {detection.facial_artifacts.map((artifact, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {artifact}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {detection.claimed_location && (
                    <div className="mt-2">
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">Claimed Location:</span> {detection.claimed_location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => navigate(`/deepfake-match/${detection.id}`)}
                >
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">View Details</span>
                </Button>
                
                {detection.image_url && (
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <a 
                      href={detection.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">View Image</span>
                    </a>
                  </Button>
                )}
                
                {detection.source_url && (
                  <Button 
                    variant={detection.source_type === 'dark' ? 'secondary' : 'outline'} 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => handleSourceClick(detection.source_url, detection.source_type)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {detection.source_type === 'dark' ? (
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span className="text-xs sm:text-sm">
                        {detection.source_type === 'dark' ? 'Dark Web Source' : 'View Source'}
                      </span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}