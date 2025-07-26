-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to execute scheduled scans every 5 minutes
SELECT cron.schedule(
  'execute-scheduled-scans',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/scheduled-scan-executor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQzMDM3MiwiZXhwIjoyMDY4MDA2MzcyfQ.BUIClCgdNB-TBbRbI5sH_M9NTVkKIDJUDHdNNFWqEb4"}'::jsonb,
        body:='{"action": "execute_scheduled"}'::jsonb
    ) as request_id;
  $$
);

-- Create cron job for continuous 24/7 monitoring (every minute for real-time responsiveness)
SELECT cron.schedule(
  'continuous-monitoring',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/scheduled-scan-executor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQzMDM3MiwiZXhwIjoyMDY4MDA2MzcyfQ.BUIClCgdNB-TBbRbI5sH_M9NTVkKIDJUDHdNNFWqEb4"}'::jsonb,
        body:='{"action": "continuous_monitoring"}'::jsonb
    ) as request_id;
  $$
);

-- Function to manually trigger scheduled scan execution (for testing)
CREATE OR REPLACE FUNCTION public.trigger_scheduled_scans()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    net.http_post(
        url:='https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/scheduled-scan-executor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQzMDM3MiwiZXhwIjoyMDY4MDA2MzcyfQ.BUIClCgdNB-TBbRbI5sH_M9NTVkKIDJUDHdNNFWqEb4"}'::jsonb,
        body:='{"action": "manual_trigger"}'::jsonb
    );
$$;