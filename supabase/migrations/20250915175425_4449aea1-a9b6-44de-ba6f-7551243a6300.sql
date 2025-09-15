-- Create tables for real trademark monitoring system

-- Trademark search results storage
CREATE TABLE IF NOT EXISTS public.trademark_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  jurisdictions TEXT[] NOT NULL DEFAULT '{}',
  classifications TEXT[] NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '[]',
  total_matches INTEGER NOT NULL DEFAULT 0,
  high_risk_matches INTEGER NOT NULL DEFAULT 0,
  search_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trademark_search_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own search results" 
ON public.trademark_search_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search results" 
ON public.trademark_search_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create search results" 
ON public.trademark_search_results 
FOR INSERT 
WITH CHECK (true);

-- Trademark alerts table
CREATE TABLE IF NOT EXISTS public.trademark_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trademark_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trademark_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own alerts" 
ON public.trademark_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.trademark_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts" 
ON public.trademark_alerts 
FOR INSERT 
WITH CHECK (true);

-- Real-time monitoring schedules
CREATE TABLE IF NOT EXISTS public.trademark_monitoring_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trademark_id UUID,
  schedule_name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  jurisdictions TEXT[] NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  frequency_hours INTEGER NOT NULL DEFAULT 24,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_executed TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trademark_monitoring_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own monitoring schedules" 
ON public.trademark_monitoring_schedules 
FOR ALL 
USING (auth.uid() = user_id);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_trademark_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_trademark_search_results_updated_at
  BEFORE UPDATE ON public.trademark_search_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trademark_updated_at();

CREATE TRIGGER update_trademark_alerts_updated_at
  BEFORE UPDATE ON public.trademark_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trademark_updated_at();

CREATE TRIGGER update_trademark_monitoring_schedules_updated_at
  BEFORE UPDATE ON public.trademark_monitoring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trademark_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trademark_search_results_user_id ON public.trademark_search_results(user_id);
CREATE INDEX IF NOT EXISTS idx_trademark_search_results_created_at ON public.trademark_search_results(created_at);
CREATE INDEX IF NOT EXISTS idx_trademark_alerts_user_id ON public.trademark_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_trademark_alerts_severity ON public.trademark_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_trademark_monitoring_schedules_user_id ON public.trademark_monitoring_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_trademark_monitoring_schedules_next_execution ON public.trademark_monitoring_schedules(next_execution) WHERE is_active = true;