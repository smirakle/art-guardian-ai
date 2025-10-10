import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeMatch {
  id: string;
  platform: string;
  match_url: string;
  match_title: string;
  confidence_score: number;
  threat_level: string;
  detected_at: string;
}

interface RealtimeScanUpdate {
  id: string;
  platform: string;
  matches_found: number;
  scan_status: string;
  progress_percentage: number;
  created_at: string;
}

interface RealtimeMonitoringSession {
  id: string;
  artwork_id?: string;
  status: string;
  started_at?: string;
  last_scan_at?: string;
  created_at?: string;
  ended_at?: string;
  user_id: string;
  platforms_monitored?: string[];
}

export const useRealtimeMonitoring = (sessionId?: string) => {
  const [matches, setMatches] = useState<RealtimeMatch[]>([]);
  const [scanUpdates, setScanUpdates] = useState<RealtimeScanUpdate[]>([]);
  const [session, setSession] = useState<RealtimeMonitoringSession | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sessionId) return;

    console.log('Setting up real-time monitoring for session:', sessionId);

    // Subscribe to matches
    const matchesChannel = supabase
      .channel(`realtime-matches-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_matches',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New match detected:', payload);
          const newMatch = payload.new as RealtimeMatch;
          
          setMatches(prev => [...prev, newMatch]);

          // Show toast for high-threat matches
          if (newMatch.threat_level === 'high') {
            toast({
              title: 'High-Threat Match Detected!',
              description: `${Math.round(newMatch.confidence_score * 100)}% match found on ${newMatch.platform}`,
              variant: 'destructive'
            });
          }
        }
      )
      .subscribe();

    // Subscribe to scan updates
    const updatesChannel = supabase
      .channel(`realtime-updates-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_scan_updates',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Scan update:', payload);
          const update = payload.new as RealtimeScanUpdate;
          setScanUpdates(prev => [...prev, update]);
        }
      )
      .subscribe();

    // Subscribe to session changes
    const sessionChannel = supabase
      .channel(`realtime-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_monitoring_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session updated:', payload);
          setSession(payload.new as RealtimeMonitoringSession);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      matchesChannel.unsubscribe();
      updatesChannel.unsubscribe();
      sessionChannel.unsubscribe();
    };
  }, [sessionId, toast]);

  const startMonitoring = useCallback(async (artworkId: string, platforms: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create monitoring session
      const { data: newSession, error: sessionError } = await supabase
        .from('realtime_monitoring_sessions')
        .insert({
          user_id: user.id,
          platforms_monitored: platforms,
          status: 'active'
        } as any)
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSession(newSession);
      setIsMonitoring(true);

      // Get artwork file URL
      const { data: artwork } = await supabase
        .from('artwork')
        .select('file_paths')
        .eq('id', artworkId)
        .single();

      if (artwork?.file_paths?.[0]) {
        const { data: fileData } = await supabase.storage
          .from('artwork')
          .createSignedUrl(artwork.file_paths[0], 3600);

        if (fileData?.signedUrl) {
          // Trigger initial scan
          await supabase.functions.invoke('realtime-monitoring-engine', {
            body: {
              sessionId: newSession.id,
              artworkId,
              imageUrl: fileData.signedUrl,
              platforms
            }
          });
        }
      }

      toast({
        title: 'Real-Time Monitoring Started',
        description: 'Your artwork is now being monitored across multiple platforms.'
      });

      return newSession.id;
    } catch (error: any) {
      console.error('Error starting monitoring:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const stopMonitoring = useCallback(async (sessionIdToStop: string) => {
    try {
      await supabase
        .from('realtime_monitoring_sessions')
        .update({ status: 'stopped', completed_at: new Date().toISOString() })
        .eq('id', sessionIdToStop);

      setIsMonitoring(false);

      toast({
        title: 'Monitoring Stopped',
        description: 'Real-time monitoring has been stopped for this artwork.'
      });
    } catch (error: any) {
      console.error('Error stopping monitoring:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [toast]);

  return {
    matches,
    scanUpdates,
    session,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
};