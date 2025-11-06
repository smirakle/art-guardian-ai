-- Fix RLS policies for realtime_matches table (using session relationship)

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own realtime matches" ON realtime_matches;
DROP POLICY IF EXISTS "System can create realtime matches" ON realtime_matches;
DROP POLICY IF EXISTS "Users can view matches from their sessions" ON realtime_matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON realtime_matches;

-- Enable RLS
ALTER TABLE realtime_matches ENABLE ROW LEVEL SECURITY;

-- Allow users to view matches from their own monitoring sessions
CREATE POLICY "Users can view matches from their sessions"
  ON realtime_matches
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM realtime_monitoring_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Allow service role and edge functions to create matches
CREATE POLICY "System can create realtime matches"
  ON realtime_matches
  FOR INSERT
  WITH CHECK (true);

-- Fix RLS for realtime_monitoring_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON realtime_monitoring_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON realtime_monitoring_sessions;
DROP POLICY IF EXISTS "System can update sessions" ON realtime_monitoring_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON realtime_monitoring_sessions;
DROP POLICY IF EXISTS "System can update all sessions" ON realtime_monitoring_sessions;

ALTER TABLE realtime_monitoring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
  ON realtime_monitoring_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update all sessions"
  ON realtime_monitoring_sessions
  FOR UPDATE
  USING (true);

-- Fix RLS for realtime_scan_updates
DROP POLICY IF EXISTS "Users can view their own scan updates" ON realtime_scan_updates;
DROP POLICY IF EXISTS "System can create scan updates" ON realtime_scan_updates;

ALTER TABLE realtime_scan_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scan updates"
  ON realtime_scan_updates
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM realtime_monitoring_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create scan updates"
  ON realtime_scan_updates
  FOR INSERT
  WITH CHECK (true);