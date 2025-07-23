-- Enable real-time for monitoring tables
ALTER TABLE public.deepfake_matches REPLICA IDENTITY FULL;
ALTER TABLE public.realtime_monitoring_stats REPLICA IDENTITY FULL;
ALTER TABLE public.copyright_matches REPLICA IDENTITY FULL;
ALTER TABLE public.monitoring_scans REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.deepfake_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_monitoring_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.copyright_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_scans;