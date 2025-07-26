-- Create scheduled_scans table for managing scan schedules
CREATE TABLE public.scheduled_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artwork_id UUID REFERENCES public.artwork(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('monitoring', 'deep-scan', 'social-media', 'comprehensive')),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly', 'continuous')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence_pattern JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_executed TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitoring_schedules table for 24/7 monitoring configuration
CREATE TABLE public.monitoring_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_name TEXT NOT NULL,
  scan_types TEXT[] NOT NULL DEFAULT ARRAY['monitoring', 'deepfake-detection'],
  artwork_ids UUID[] DEFAULT NULL, -- NULL means all user's artwork
  frequency_minutes INTEGER NOT NULL DEFAULT 60 CHECK (frequency_minutes >= 5),
  is_24_7_enabled BOOLEAN NOT NULL DEFAULT false,
  monitoring_hours JSONB DEFAULT '{"start": "00:00", "end": "23:59", "timezone": "UTC"}',
  alert_settings JSONB DEFAULT '{"email": true, "webhook": false, "severity_threshold": "medium"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scan_execution_log table for tracking scheduled scan executions
CREATE TABLE public.scan_execution_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_scan_id UUID REFERENCES public.scheduled_scans(id) ON DELETE CASCADE,
  monitoring_schedule_id UUID REFERENCES public.monitoring_schedules(id) ON DELETE CASCADE,
  execution_type TEXT NOT NULL CHECK (execution_type IN ('scheduled', 'manual', 'continuous')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_execution_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scheduled_scans
CREATE POLICY "Users can manage their own scheduled scans" 
ON public.scheduled_scans 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for monitoring_schedules
CREATE POLICY "Users can manage their own monitoring schedules" 
ON public.monitoring_schedules 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for scan_execution_log
CREATE POLICY "Users can view their own scan execution logs" 
ON public.scan_execution_log 
FOR SELECT 
USING (
  scheduled_scan_id IN (SELECT id FROM public.scheduled_scans WHERE user_id = auth.uid()) OR
  monitoring_schedule_id IN (SELECT id FROM public.monitoring_schedules WHERE user_id = auth.uid())
);

CREATE POLICY "System can create scan execution logs" 
ON public.scan_execution_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update scan execution logs" 
ON public.scan_execution_log 
FOR UPDATE 
USING (true);

-- Create function to update next_execution time for scheduled scans
CREATE OR REPLACE FUNCTION public.calculate_next_execution(
  schedule_type TEXT,
  current_time TIMESTAMP WITH TIME ZONE,
  recurrence_pattern JSONB
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  CASE schedule_type
    WHEN 'once' THEN
      RETURN NULL; -- One-time execution
    WHEN 'daily' THEN
      RETURN current_time + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN current_time + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN current_time + INTERVAL '1 month';
    WHEN 'continuous' THEN
      RETURN current_time + INTERVAL '1 hour'; -- Default continuous interval
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update next_execution when scheduled_scans are updated
CREATE OR REPLACE FUNCTION public.update_next_execution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_executed IS NOT NULL AND NEW.schedule_type != 'once' THEN
    NEW.next_execution = public.calculate_next_execution(
      NEW.schedule_type,
      NEW.last_executed,
      NEW.recurrence_pattern
    );
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_execution
  BEFORE UPDATE ON public.scheduled_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_next_execution();

-- Create trigger for monitoring_schedules updated_at
CREATE TRIGGER update_monitoring_schedules_updated_at
  BEFORE UPDATE ON public.monitoring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();