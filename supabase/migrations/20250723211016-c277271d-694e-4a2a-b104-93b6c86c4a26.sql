-- Enable real-time for monitoring tables (only the new ones)
ALTER TABLE public.deepfake_matches REPLICA IDENTITY FULL;
ALTER TABLE public.realtime_monitoring_stats REPLICA IDENTITY FULL;

-- Add missing tables to realtime publication (only the new ones)
ALTER PUBLICATION supabase_realtime ADD TABLE public.deepfake_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_monitoring_stats;