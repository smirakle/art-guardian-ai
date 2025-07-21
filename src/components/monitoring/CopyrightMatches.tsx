import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Globe, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { DMCAFormDialog } from "@/components/dmca/DMCAFormDialog";

export default function CopyrightMatches() {
  const [matches, setMatches] = useState<Tables<"copyright_matches">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("copyright_matches")
        .select("*, artwork!inner(user_id)")
        .eq("artwork.user_id", (await supabase.auth.getUser()).data.user?.id || "")
        .order("detected_at", { ascending: false });

      if (!error && data) {
        setMatches(data);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Loading matches...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            No matches found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We haven&apos;t detected any copyright matches yet. Keep monitoring your artwork for potential matches.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                <span className="text-base sm:text-lg truncate">
                  {match.source_title || "Untitled Source"}
                </span>
              </div>
              <Badge variant={match.match_confidence > 90 ? "destructive" : "secondary"} className="text-xs self-start sm:self-center">
                {Math.round(match.match_confidence)}% match
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {match.thumbnail_url && (
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img 
                    src={match.thumbnail_url} 
                    alt={match.source_title || "Image match"} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border"
                  />
                </div>
              )}
              <div className="flex-1">
                {match.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">{match.description}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Found on:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {match.source_domain || "Unknown domain"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Detected:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(match.detected_at).toLocaleDateString()} {new Date(match.detected_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Type:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                      {match.match_type}
                    </p>
                  </div>
                  {match.threat_level && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Threat Level:</p>
                      <Badge variant={match.threat_level === "high" ? "destructive" : "secondary"} className="text-xs">
                        {match.threat_level}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <DMCAFormDialog 
                matchId={match.id}
                sourceUrl={match.source_url}
                sourceTitle={match.source_title || "Untitled Source"}
              />
              {match.source_url && (
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <a 
                    href={match.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">View Source</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}