-- Document Real-time Monitoring Tables
CREATE TABLE IF NOT EXISTS public.document_monitoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protection_record_id UUID REFERENCES public.ai_protection_records(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'realtime',
  status TEXT NOT NULL DEFAULT 'active',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  scan_frequency TEXT NOT NULL DEFAULT 'hourly',
  last_scan_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  total_scans INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  high_risk_matches INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_plagiarism_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.document_monitoring_sessions(id) ON DELETE CASCADE,
  protection_record_id UUID REFERENCES public.ai_protection_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_domain TEXT,
  similarity_score NUMERIC(5,4) NOT NULL,
  matched_content TEXT,
  context_snippet TEXT,
  threat_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ai_training_detected BOOLEAN DEFAULT false,
  detection_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_scan_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.document_monitoring_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  sources_scanned INTEGER NOT NULL DEFAULT 0,
  matches_found INTEGER NOT NULL DEFAULT 0,
  scan_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_takedown_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.document_plagiarism_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notice_type TEXT NOT NULL DEFAULT 'dmca',
  target_platform TEXT NOT NULL,
  target_url TEXT NOT NULL,
  notice_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  resolution TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doc_sessions_user ON public.document_monitoring_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_doc_sessions_protection ON public.document_monitoring_sessions(protection_record_id);
CREATE INDEX IF NOT EXISTS idx_doc_matches_session ON public.document_plagiarism_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_doc_matches_user ON public.document_plagiarism_matches(user_id, threat_level);
CREATE INDEX IF NOT EXISTS idx_doc_scan_updates_session ON public.document_scan_updates(session_id);
CREATE INDEX IF NOT EXISTS idx_doc_takedowns_match ON public.document_takedown_notices(match_id);
CREATE INDEX IF NOT EXISTS idx_doc_takedowns_user ON public.document_takedown_notices(user_id, status);

-- Enable RLS
ALTER TABLE public.document_monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_plagiarism_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_scan_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_takedown_notices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own document monitoring sessions"
  ON public.document_monitoring_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document monitoring sessions"
  ON public.document_monitoring_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document monitoring sessions"
  ON public.document_monitoring_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own document matches"
  ON public.document_plagiarism_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own document matches"
  ON public.document_plagiarism_matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own document scan updates"
  ON public.document_scan_updates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own document takedown notices"
  ON public.document_takedown_notices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document takedown notices"
  ON public.document_takedown_notices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document takedown notices"
  ON public.document_takedown_notices FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_doc_sessions_updated_at
  BEFORE UPDATE ON public.document_monitoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doc_matches_updated_at
  BEFORE UPDATE ON public.document_plagiarism_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doc_takedowns_updated_at
  BEFORE UPDATE ON public.document_takedown_notices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_monitoring_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_plagiarism_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_scan_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_takedown_notices;