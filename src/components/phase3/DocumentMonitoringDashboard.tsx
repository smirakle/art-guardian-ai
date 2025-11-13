import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDocumentMonitoring } from "@/hooks/useDocumentMonitoring";
import { Shield, AlertTriangle, FileText, Search, StopCircle } from "lucide-react";
import { useState } from "react";

const PLATFORMS = [
  "Google Scholar",
  "Research Gate",
  "Academia.edu",
  "Medium",
  "Substack",
  "Common Crawl",
  "AI Training Datasets"
];

export const DocumentMonitoringDashboard = () => {
  const {
    isMonitoring,
    activeSession,
    matches,
    scanUpdates,
    startMonitoring,
    stopMonitoring,
    generateTakedown
  } = useDocumentMonitoring();

  const [selectedProtectionRecord, setSelectedProtectionRecord] = useState<string>("");

  const handleStartMonitoring = () => {
    if (!selectedProtectionRecord) {
      // For demo purposes, use null for protection_record_id
      startMonitoring(null as any, PLATFORMS);
    } else {
      startMonitoring(selectedProtectionRecord, PLATFORMS);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      default: return "text-blue-600";
    }
  };

  const getThreatBadge = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "outline";
      default: return "secondary";
    }
  };

  const completedScans = scanUpdates.filter(u => u.status === "completed").length;
  const progress = PLATFORMS.length > 0 ? (completedScans / PLATFORMS.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Real-time Document Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Monitor your documents across the web for plagiarism and unauthorized AI training usage.
          </p>

          {!isMonitoring ? (
            <Button onClick={handleStartMonitoring} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Start Real-time Monitoring
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Monitoring in progress...</p>
                  <p className="text-xs text-muted-foreground">
                    Scanning {PLATFORMS.length} platforms
                  </p>
                </div>
                <Button onClick={stopMonitoring} variant="destructive" size="sm">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {completedScans} of {PLATFORMS.length} platforms scanned
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {scanUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scan Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanUpdates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{update.platform}</p>
                    <p className="text-xs text-muted-foreground">
                      {update.sources_scanned.toLocaleString()} sources scanned
                    </p>
                  </div>
                  <Badge variant={update.status === "completed" ? "default" : "outline"}>
                    {update.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Plagiarism Detections ({matches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id} className="border-l-4" style={{
                  borderLeftColor: match.threat_level === "critical" ? "rgb(239 68 68)" :
                                   match.threat_level === "high" ? "rgb(249 115 22)" :
                                   match.threat_level === "medium" ? "rgb(234 179 8)" :
                                   "rgb(59 130 246)"
                }}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getThreatBadge(match.threat_level)}>
                            {match.threat_level.toUpperCase()}
                          </Badge>
                          {match.ai_training_detected && (
                            <Badge variant="destructive">AI Training</Badge>
                          )}
                          <span className={`text-sm font-semibold ${getThreatColor(match.threat_level)}`}>
                            {Math.round(match.similarity_score * 100)}% Match
                          </span>
                        </div>
                        <p className="text-sm font-medium">{match.source_domain}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {match.source_url}
                        </p>
                      </div>
                    </div>

                    {match.context_snippet && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs italic text-muted-foreground">
                          "{match.context_snippet}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => generateTakedown(match.id)}
                        variant="default"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Takedown
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={match.source_url} target="_blank" rel="noopener noreferrer">
                          View Source
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSession && activeSession.status === "completed" && matches.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-semibold">No Plagiarism Detected</p>
            <p className="text-sm text-muted-foreground">
              Your document appears to be safe across all scanned platforms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
