-- Create table for real-time analysis results
CREATE TABLE public.realtime_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('classification', 'reverse_search', 'copyright', 'similarity')),
  service_name TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.realtime_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analysis results" 
ON public.realtime_analysis_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert analysis results" 
ON public.realtime_analysis_results 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_realtime_analysis_user_id ON public.realtime_analysis_results(user_id);
CREATE INDEX idx_realtime_analysis_type ON public.realtime_analysis_results(analysis_type);
CREATE INDEX idx_realtime_analysis_created_at ON public.realtime_analysis_results(created_at);
CREATE INDEX idx_realtime_analysis_confidence ON public.realtime_analysis_results(confidence_score);