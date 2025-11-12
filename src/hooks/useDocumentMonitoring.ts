import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentMonitoringSession {
  id: string;
  user_id: string;
  protection_record_id?: string;
  session_type: string;
  status: string;
  platforms: string[];
  scan_frequency: string;
  last_scan_at?: string;
  started_at: string;
  ended_at?: string;
  total_scans: number;
  total_matches: number;
  high_risk_matches: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface PlagiarismMatch {
  id: string;
  session_id: string;
  protection_record_id?: string;
  user_id: string;
  match_type: string;
  source_url: string;
  source_domain?: string;
  similarity_score: number;
  matched_content?: string;
  context_snippet?: string;
  threat_level: string;
  status: string;
  ai_training_detected: boolean;
  detection_method?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ScanUpdate {
  id: string;
  session_id: string;
  user_id: string;
  platform: string;
  status: string;
  progress_percentage: number;
  sources_scanned: number;
  matches_found: number;
  scan_details: any;
  created_at: string;
}

export const useDocumentMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeSession, setActiveSession] = useState<DocumentMonitoringSession | null>(null);
  const [matches, setMatches] = useState<PlagiarismMatch[]>([]);
  const [scanUpdates, setScanUpdates] = useState<ScanUpdate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeSession) return;

    const matchesChannel = supabase
      .channel("document_matches")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "document_plagiarism_matches",
          filter: `session_id=eq.${activeSession.id}`,
        },
        (payload) => {
          const newMatch = payload.new as PlagiarismMatch;
          setMatches((prev) => [...prev, newMatch]);

          if (newMatch.threat_level === "high" || newMatch.threat_level === "critical") {
            toast({
              title: "High-Risk Plagiarism Detected",
              description: `${Math.round(newMatch.similarity_score * 100)}% similarity found on ${newMatch.source_domain}`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    const updatesChannel = supabase
      .channel("document_scan_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "document_scan_updates",
          filter: `session_id=eq.${activeSession.id}`,
        },
        (payload) => {
          const newUpdate = payload.new as ScanUpdate;
          setScanUpdates((prev) => [...prev, newUpdate]);
        }
      )
      .subscribe();

    const sessionChannel = supabase
      .channel("document_session_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "document_monitoring_sessions",
          filter: `id=eq.${activeSession.id}`,
        },
        (payload) => {
          const updatedSession = payload.new as DocumentMonitoringSession;
          setActiveSession(updatedSession);
          
          if (updatedSession.status === "completed") {
            setIsMonitoring(false);
            toast({
              title: "Document Monitoring Complete",
              description: `Scan completed. Found ${updatedSession.total_matches} matches across ${updatedSession.total_scans} platforms.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(updatesChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [activeSession, toast]);

  const startMonitoring = useCallback(async (protectionRecordId: string, platforms: string[]) => {
    try {
      setIsMonitoring(true);
      setScanUpdates([]);
      setMatches([]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: session, error: sessionError } = await supabase
        .from("document_monitoring_sessions")
        .insert({
          user_id: user.id,
          protection_record_id: protectionRecordId,
          session_type: "realtime",
          status: "active",
          platforms: platforms,
          scan_frequency: "on_demand",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setActiveSession(session);

      const { error: functionError } = await supabase.functions.invoke(
        "document-monitoring-engine",
        {
          body: { sessionId: session.id },
        }
      );

      if (functionError) throw functionError;

      toast({
        title: "Monitoring Started",
        description: `Scanning ${platforms.length} platforms for plagiarism and AI training usage.`,
      });
    } catch (error: any) {
      console.error("Start monitoring error:", error);
      setIsMonitoring(false);
      toast({
        title: "Monitoring Failed",
        description: error.message || "Failed to start document monitoring",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopMonitoring = useCallback(async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from("document_monitoring_sessions")
        .update({
          status: "stopped",
          ended_at: new Date().toISOString(),
        })
        .eq("id", activeSession.id);

      if (error) throw error;

      setIsMonitoring(false);
      setActiveSession(null);

      toast({
        title: "Monitoring Stopped",
        description: "Document monitoring has been stopped.",
      });
    } catch (error: any) {
      console.error("Stop monitoring error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to stop monitoring",
        variant: "destructive",
      });
    }
  }, [activeSession, toast]);

  const generateTakedown = useCallback(async (matchId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-document-takedown",
        {
          body: { matchId },
        }
      );

      if (error) throw error;

      toast({
        title: "Takedown Notice Generated",
        description: "Your DMCA takedown notice has been generated and saved.",
      });

      return data;
    } catch (error: any) {
      console.error("Generate takedown error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate takedown notice",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  return {
    isMonitoring,
    activeSession,
    matches,
    scanUpdates,
    startMonitoring,
    stopMonitoring,
    generateTakedown,
  };
};
