-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule continuous scanning every 5 minutes
SELECT cron.schedule(
  'continuous-realtime-scanning',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/continuous-scan-scheduler',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQzMDM3MiwiZXhwIjoyMDY4MDA2MzcyfQ.BUIClCgdNB-TBbRbI5sH_M9NTVkKIDJUDHdNNFWqEb4"}'::jsonb,
      body:='{"action": "scheduled_scan"}'::jsonb
    ) as request_id;
  $$
);