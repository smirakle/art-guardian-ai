-- Add artwork_id to realtime_monitoring_sessions
ALTER TABLE realtime_monitoring_sessions 
ADD COLUMN IF NOT EXISTS artwork_id UUID REFERENCES artwork(id) ON DELETE CASCADE;

-- Add active_scans column to realtime_monitoring_stats if it doesn't exist
ALTER TABLE realtime_monitoring_stats 
ADD COLUMN IF NOT EXISTS active_scans INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_realtime_sessions_artwork 
ON realtime_monitoring_sessions(artwork_id);

CREATE INDEX IF NOT EXISTS idx_realtime_sessions_user 
ON realtime_monitoring_sessions(user_id);