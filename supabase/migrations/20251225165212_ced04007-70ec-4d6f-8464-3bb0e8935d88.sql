-- Create visitor_sessions table for tracking individual sessions
CREATE TABLE public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  is_returning_visitor BOOLEAN DEFAULT false,
  entry_page TEXT,
  exit_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  is_bounce BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create page_views table for individual page tracking
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  time_on_page_seconds INTEGER DEFAULT 0,
  scroll_depth_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create visitor_retention_metrics table for aggregated daily metrics
CREATE TABLE public.visitor_retention_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  new_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_session_duration_seconds NUMERIC DEFAULT 0,
  avg_pages_per_session NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_visitor_sessions_visitor_id ON public.visitor_sessions(visitor_id);
CREATE INDEX idx_visitor_sessions_started_at ON public.visitor_sessions(started_at);
CREATE INDEX idx_visitor_sessions_is_returning ON public.visitor_sessions(is_returning_visitor);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_retention_metrics_date ON public.visitor_retention_metrics(date);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_retention_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_sessions
CREATE POLICY "Allow anonymous session creation"
ON public.visitor_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anonymous session updates"
ON public.visitor_sessions FOR UPDATE
USING (true);

CREATE POLICY "Admins can view all sessions"
ON public.visitor_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for page_views
CREATE POLICY "Allow anonymous page view creation"
ON public.page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all page views"
ON public.page_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for visitor_retention_metrics
CREATE POLICY "System can manage retention metrics"
ON public.visitor_retention_metrics FOR ALL
USING (true);

CREATE POLICY "Admins can view retention metrics"
ON public.visitor_retention_metrics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at
CREATE TRIGGER update_visitor_sessions_updated_at
  BEFORE UPDATE ON public.visitor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retention_metrics_updated_at
  BEFORE UPDATE ON public.visitor_retention_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();