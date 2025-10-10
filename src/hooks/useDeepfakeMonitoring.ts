import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export const useDeepfakeMonitoring = () => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeSession, setActiveSession] = useState<Tables<'realtime_monitoring_sessions'> | null>(null);
  const [liveMatches, setLiveMatches] = useState<Tables<'deepfake_matches'>[]>([]);
  const [scanUpdates, setScanUpdates] = useState<Tables<'realtime_scan_updates'>[]>([]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!activeSession) return;

    console.log('Setting up deepfake real-time subscriptions for session:', activeSession.id);

    // Subscribe to new matches
    const matchesChannel = supabase
      .channel('deepfake-live-matches')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deepfake_matches'
        },
        (payload) => {
          const newMatch = payload.new as Tables<'deepfake_matches'>;
          console.log('New deepfake match detected:', newMatch);
          
          setLiveMatches(prev => [newMatch, ...prev]);
          
          // Show toast for high-threat detections
          if (newMatch.threat_level === 'high' || newMatch.detection_confidence > 0.85) {
            toast({
              title: "⚠️ High-Threat Deepfake Detected",
              description: `${newMatch.manipulation_type} found on ${newMatch.source_domain}`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to scan updates
    const updatesChannel = supabase
      .channel('deepfake-scan-updates')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_scan_updates',
          filter: `session_id=eq.${activeSession.id}`
        },
        (payload) => {
          const update = payload.new as Tables<'realtime_scan_updates'>;
          console.log('Scan update received:', update);
          setScanUpdates(prev => [update, ...prev]);
        }
      )
      .subscribe();

    // Subscribe to session changes
    const sessionChannel = supabase
      .channel('deepfake-session-updates')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_monitoring_sessions',
          filter: `id=eq.${activeSession.id}`
        },
        (payload) => {
          const updatedSession = payload.new as Tables<'realtime_monitoring_sessions'>;
          console.log('Session updated:', updatedSession);
          setActiveSession(updatedSession);
          
          if (updatedSession.status === 'completed') {
            setIsMonitoring(false);
            toast({
              title: "✅ Deepfake Scan Complete",
              description: `Found ${updatedSession.matches_found} potential deepfakes across ${updatedSession.platforms_scanned} platforms`,
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

  const startMonitoring = async (platforms: string[]) => {
    try {
      setIsMonitoring(true);
      setLiveMatches([]);
      setScanUpdates([]);

      // Create monitoring session
      const { data: session, error: sessionError } = await supabase
        .from('realtime_monitoring_sessions')
        .insert({
          session_type: 'deepfake',
          status: 'active',
          platforms_requested: platforms,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setActiveSession(session);

      // Invoke monitoring engine
      const { error: invokeError } = await supabase.functions.invoke('deepfake-monitoring-engine', {
        body: { sessionId: session.id }
      });

      if (invokeError) throw invokeError;

      toast({
        title: "🔍 Deepfake Monitoring Started",
        description: `Scanning ${platforms.length} platforms for deepfake content...`,
      });

      return session;
    } catch (error) {
      console.error('Error starting deepfake monitoring:', error);
      setIsMonitoring(false);
      toast({
        title: "Error",
        description: "Failed to start deepfake monitoring",
        variant: "destructive",
      });
      throw error;
    }
  };

  const stopMonitoring = async () => {
    if (!activeSession) return;

    try {
      await supabase
        .from('realtime_monitoring_sessions')
        .update({ 
          status: 'stopped',
          completed_at: new Date().toISOString()
        })
        .eq('id', activeSession.id);

      setIsMonitoring(false);
      setActiveSession(null);

      toast({
        title: "Monitoring Stopped",
        description: "Deepfake monitoring has been stopped",
      });
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  };

  return {
    isMonitoring,
    activeSession,
    liveMatches,
    scanUpdates,
    startMonitoring,
    stopMonitoring
  };
};
