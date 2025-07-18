-- Enable real-time for monitoring tables
ALTER TABLE public.artwork REPLICA IDENTITY FULL;
ALTER TABLE public.monitoring_scans REPLICA IDENTITY FULL;
ALTER TABLE public.copyright_matches REPLICA IDENTITY FULL;
ALTER TABLE public.monitoring_alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication (only if not already added)
DO $$
BEGIN
    -- Check and add artwork table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'artwork'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork;
    END IF;
    
    -- Check and add copyright_matches table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'copyright_matches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.copyright_matches;
    END IF;
    
    -- Check and add monitoring_alerts table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'monitoring_alerts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_alerts;
    END IF;
END $$;