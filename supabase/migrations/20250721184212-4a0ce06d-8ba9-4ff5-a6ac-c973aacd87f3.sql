-- Create table for real-time deepfake detections
CREATE TABLE public.deepfake_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  source_domain TEXT,
  source_title TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  detection_confidence DOUBLE PRECISION NOT NULL,
  manipulation_type TEXT NOT NULL,
  threat_level TEXT NOT NULL DEFAULT 'medium',
  facial_artifacts TEXT[] DEFAULT '{}',
  temporal_inconsistency BOOLEAN DEFAULT false,
  metadata_suspicious BOOLEAN DEFAULT false,
  claimed_location TEXT,
  claimed_time TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_reviewed BOOLEAN DEFAULT false,
  scan_type TEXT NOT NULL DEFAULT 'realtime', -- 'realtime', 'scheduled', 'manual'
  source_type TEXT NOT NULL DEFAULT 'surface', -- 'surface', 'dark', 'deep'
  context JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on deepfake_matches
ALTER TABLE public.deepfake_matches ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing deepfake matches (public for now since this is threat intelligence)
CREATE POLICY "Anyone can view deepfake matches"
ON public.deepfake_matches
FOR SELECT
USING (true);

-- Create policy for creating deepfake matches (system-level inserts only)
CREATE POLICY "System can create deepfake matches"
ON public.deepfake_matches
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_deepfake_matches_detected_at ON public.deepfake_matches (detected_at DESC);
CREATE INDEX idx_deepfake_matches_threat_level ON public.deepfake_matches (threat_level);
CREATE INDEX idx_deepfake_matches_source_type ON public.deepfake_matches (source_type);
CREATE INDEX idx_deepfake_matches_manipulation_type ON public.deepfake_matches (manipulation_type);

-- Create table for real-time monitoring statistics
CREATE TABLE public.realtime_monitoring_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sources_scanned INTEGER NOT NULL DEFAULT 0,
  deepfakes_detected INTEGER NOT NULL DEFAULT 0,
  surface_web_scans INTEGER NOT NULL DEFAULT 0,
  dark_web_scans INTEGER NOT NULL DEFAULT 0,
  high_threat_count INTEGER NOT NULL DEFAULT 0,
  medium_threat_count INTEGER NOT NULL DEFAULT 0,
  low_threat_count INTEGER NOT NULL DEFAULT 0,
  scan_type TEXT NOT NULL DEFAULT 'realtime'
);

-- Enable RLS on monitoring stats
ALTER TABLE public.realtime_monitoring_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing monitoring stats
CREATE POLICY "Anyone can view monitoring stats"
ON public.realtime_monitoring_stats
FOR SELECT
USING (true);

-- Create policy for creating monitoring stats (system only)
CREATE POLICY "System can create monitoring stats"
ON public.realtime_monitoring_stats
FOR INSERT
WITH CHECK (true);