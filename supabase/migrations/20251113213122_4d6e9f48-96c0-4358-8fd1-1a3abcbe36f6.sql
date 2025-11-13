-- Create table for AI similarity analysis results
CREATE TABLE IF NOT EXISTS public.document_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.document_monitoring_sessions(id) ON DELETE CASCADE,
  source_url TEXT,
  similarity_score DECIMAL(5,4) CHECK (similarity_score >= 0 AND similarity_score <= 1),
  semantic_similarity DECIMAL(5,4) CHECK (semantic_similarity >= 0 AND semantic_similarity <= 1),
  structural_similarity DECIMAL(5,4) CHECK (structural_similarity >= 0 AND structural_similarity <= 1),
  is_paraphrased BOOLEAN DEFAULT false,
  key_concepts_matched TEXT[] DEFAULT ARRAY[]::TEXT[],
  analysis_details TEXT,
  confidence DECIMAL(5,4) CHECK (confidence >= 0 AND confidence <= 1),
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI analysis"
  ON public.document_ai_analysis
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_monitoring_sessions
      WHERE document_monitoring_sessions.id = document_ai_analysis.session_id
      AND document_monitoring_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert AI analysis"
  ON public.document_ai_analysis
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_document_ai_analysis_session_id ON public.document_ai_analysis(session_id);
CREATE INDEX idx_document_ai_analysis_analyzed_at ON public.document_ai_analysis(analyzed_at DESC);
CREATE INDEX idx_document_ai_analysis_paraphrased ON public.document_ai_analysis(is_paraphrased) WHERE is_paraphrased = true;
CREATE INDEX idx_document_ai_analysis_similarity ON public.document_ai_analysis(similarity_score DESC);

COMMENT ON TABLE public.document_ai_analysis IS 'Stores AI-powered similarity analysis results for document plagiarism detection';
COMMENT ON COLUMN public.document_ai_analysis.similarity_score IS 'Overall similarity score from 0 to 1';
COMMENT ON COLUMN public.document_ai_analysis.semantic_similarity IS 'Semantic meaning similarity score';
COMMENT ON COLUMN public.document_ai_analysis.structural_similarity IS 'Structural organization similarity score';
COMMENT ON COLUMN public.document_ai_analysis.is_paraphrased IS 'Whether the content appears to be paraphrased';
COMMENT ON COLUMN public.document_ai_analysis.confidence IS 'Confidence level of the AI analysis from 0 to 1';