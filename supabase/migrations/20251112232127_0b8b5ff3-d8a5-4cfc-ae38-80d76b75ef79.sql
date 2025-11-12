-- Document Version Comparisons Table
CREATE TABLE IF NOT EXISTS public.document_version_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_document_id UUID REFERENCES public.ai_protection_records(id) ON DELETE CASCADE,
  comparison_url TEXT,
  similarity_score NUMERIC(5,4) NOT NULL,
  total_chars INTEGER NOT NULL DEFAULT 0,
  matched_chars INTEGER NOT NULL DEFAULT 0,
  added_chars INTEGER NOT NULL DEFAULT 0,
  removed_chars INTEGER NOT NULL DEFAULT 0,
  differences JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_version_comparisons_user ON public.document_version_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_version_comparisons_document ON public.document_version_comparisons(original_document_id);
CREATE INDEX IF NOT EXISTS idx_version_comparisons_similarity ON public.document_version_comparisons(similarity_score DESC);

-- Enable RLS
ALTER TABLE public.document_version_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own version comparisons"
  ON public.document_version_comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own version comparisons"
  ON public.document_version_comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own version comparisons"
  ON public.document_version_comparisons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own version comparisons"
  ON public.document_version_comparisons FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_version_comparisons_updated_at
  BEFORE UPDATE ON public.document_version_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_version_comparisons;