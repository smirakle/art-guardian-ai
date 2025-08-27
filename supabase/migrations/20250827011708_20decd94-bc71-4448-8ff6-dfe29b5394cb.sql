-- Create enterprise AI analyses table
CREATE TABLE IF NOT EXISTS public.enterprise_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'comprehensive',
  analyses JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_factors TEXT[] DEFAULT '{}',
  overall_risk TEXT NOT NULL DEFAULT 'low' CHECK (overall_risk IN ('low', 'medium', 'high')),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create copyright scan results table  
CREATE TABLE IF NOT EXISTS public.copyright_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  search_engines TEXT[] NOT NULL DEFAULT '{}',
  total_matches INTEGER NOT NULL DEFAULT 0,
  threat_level TEXT NOT NULL DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high')),
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_analysis TEXT,
  scan_completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for enterprise AI analyses
ALTER TABLE public.enterprise_ai_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for enterprise AI analyses
CREATE POLICY "Users can view their own AI analyses" 
  ON public.enterprise_ai_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI analyses" 
  ON public.enterprise_ai_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create AI analyses" 
  ON public.enterprise_ai_analyses 
  FOR INSERT 
  WITH CHECK (true);

-- Enable RLS for copyright scan results
ALTER TABLE public.copyright_scan_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for copyright scan results
CREATE POLICY "Users can view their own scan results" 
  ON public.copyright_scan_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scan results" 
  ON public.copyright_scan_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create scan results" 
  ON public.copyright_scan_results 
  FOR INSERT 
  WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enterprise_ai_analyses_updated_at
  BEFORE UPDATE ON public.enterprise_ai_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copyright_scan_results_updated_at
  BEFORE UPDATE ON public.copyright_scan_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();