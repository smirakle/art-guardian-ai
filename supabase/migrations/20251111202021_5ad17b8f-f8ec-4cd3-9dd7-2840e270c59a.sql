-- Add total_matches column to realtime_monitoring_stats
ALTER TABLE realtime_monitoring_stats 
ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0;