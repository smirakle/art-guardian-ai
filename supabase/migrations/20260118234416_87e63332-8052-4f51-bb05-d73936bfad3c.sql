-- Create plugin conversion events table for tracking upgrade funnel
CREATE TABLE public.plugin_conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('upgrade_click', 'pricing_landed', 'checkout_started', 'subscription_converted')),
  source text NOT NULL DEFAULT 'adobe_plugin',
  user_email text,
  user_id uuid REFERENCES auth.users(id),
  plugin_version text,
  session_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_plugin_conversion_events_type ON public.plugin_conversion_events(event_type);
CREATE INDEX idx_plugin_conversion_events_source ON public.plugin_conversion_events(source);
CREATE INDEX idx_plugin_conversion_events_created_at ON public.plugin_conversion_events(created_at);

-- Enable RLS
ALTER TABLE public.plugin_conversion_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anon users (for pre-login tracking)
CREATE POLICY "Allow event inserts" ON public.plugin_conversion_events
  FOR INSERT WITH CHECK (true);

-- Allow service role full access for admin analytics
CREATE POLICY "Service role full access" ON public.plugin_conversion_events
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Add comment
COMMENT ON TABLE public.plugin_conversion_events IS 'Tracks conversion funnel from Adobe plugin upgrade clicks through to subscription';