-- Enable real-time for monitoring tables
ALTER TABLE public.artwork REPLICA IDENTITY FULL;
ALTER TABLE public.monitoring_scans REPLICA IDENTITY FULL;
ALTER TABLE public.copyright_matches REPLICA IDENTITY FULL;
ALTER TABLE public.monitoring_alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.copyright_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_alerts;