import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Globe, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg">
                  {match.source_title || "Untitled Source"}
                </span>
              </div>
              <Badge variant={match.match_confidence > 90 ? "destructive" : "secondary"}>
                {Math.round(match.match_confidence)}% match
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {match.description && (
              <p className="text-sm text-muted-foreground">{match.description}</p>
            )}
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium">Found on:</p>
                <p className="text-sm text-muted-foreground">
                  {match.source_domain || "Unknown domain"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Detected:</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(match.detected_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Type:</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {match.match_type}
                </p>
              </div>
              {match.threat_level && (
                <div>
                  <p className="text-sm font-medium">Threat Level:</p>
                  <Badge variant={match.threat_level === "high" ? "destructive" : "secondary"}>
                    {match.threat_level}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              {match.source_url && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={match.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    View Source
                    <ArrowRight className="w-4 h-4" />
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