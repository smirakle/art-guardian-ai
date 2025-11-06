-- Clean up and fix RLS policies for real-time monitoring tables

-- realtime_matches
DROP POLICY IF EXISTS "Users can view matches from their sessions" ON realtime_matches;
DROP POLICY IF EXISTS "Users can view their own realtime matches" ON realtime_matches;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON realtime_matches;
DROP POLICY IF EXISTS "Service role can insert matches" ON realtime_matches;

-- realtime_scan_updates  
DROP POLICY IF EXISTS "Users can view scan updates from their sessions" ON realtime_scan_updates;
DROP POLICY IF EXISTS "Users can view their own scan updates" ON realtime_scan_updates;
DROP POLICY IF EXISTS "Service role can insert scan updates" ON realtime_scan_updates;

-- Create proper policies for realtime_matches
CREATE POLICY "authenticated_select_own_matches"
ON realtime_matches
FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM realtime_monitoring_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "service_role_insert_matches"
ON realtime_matches
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create proper policies for realtime_scan_updates
CREATE POLICY "authenticated_select_own_updates"
ON realtime_scan_updates
FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM realtime_monitoring_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "service_role_insert_updates"
ON realtime_scan_updates
FOR INSERT
TO service_role
WITH CHECK (true);