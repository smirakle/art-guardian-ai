-- Create web scans table for tracking comprehensive scans
CREATE TABLE public.web_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'article', 'video')),
  content_url TEXT,
  content_text TEXT,
  search_terms TEXT[] NOT NULL,
  include_deep_web BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  sources_scanned INTEGER DEFAULT 0,
  matches_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create web scan results table for storing individual matches
CREATE TABLE public.web_scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.web_scans(id) ON DELETE CASCADE,
  source_domain TEXT NOT NULL,
  source_url TEXT NOT NULL,
  content_title TEXT,
  content_description TEXT,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high')),
  detection_type TEXT NOT NULL,
  content_type TEXT NOT NULL,
  thumbnail_url TEXT,
  artifacts_detected TEXT[],
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  action_taken TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on web scans
ALTER TABLE public.web_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for web scans
CREATE POLICY "Users can view their own web scans" 
ON public.web_scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own web scans" 
ON public.web_scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own web scans" 
ON public.web_scans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS on web scan results
ALTER TABLE public.web_scan_results ENABLE ROW LEVEL SECURITY;

-- Create policies for web scan results
CREATE POLICY "Users can view their own web scan results" 
ON public.web_scan_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.web_scans 
    WHERE id = web_scan_results.scan_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Service can insert web scan results" 
ON public.web_scan_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own web scan results" 
ON public.web_scan_results 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.web_scans 
    WHERE id = web_scan_results.scan_id 
    AND user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_web_scans_user_id ON public.web_scans(user_id);
CREATE INDEX idx_web_scans_status ON public.web_scans(status);
CREATE INDEX idx_web_scans_content_type ON public.web_scans(content_type);
CREATE INDEX idx_web_scan_results_scan_id ON public.web_scan_results(scan_id);
CREATE INDEX idx_web_scan_results_threat_level ON public.web_scan_results(threat_level);
CREATE INDEX idx_web_scan_results_detection_type ON public.web_scan_results(detection_type);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_web_scans_updated_at
BEFORE UPDATE ON public.web_scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();