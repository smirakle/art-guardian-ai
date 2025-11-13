-- Create table for scheduled document monitoring
CREATE TABLE IF NOT EXISTS public.scheduled_document_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protection_record_id UUID REFERENCES public.ai_protection_records(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  schedule_time TIME NOT NULL DEFAULT '09:00:00',
  schedule_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Mon-Fri for weekly
  is_active BOOLEAN DEFAULT true,
  platforms TEXT[] DEFAULT ARRAY['Google Scholar', 'Research Gate', 'Academia.edu', 'Medium', 'Substack'],
  last_executed TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  total_executions INTEGER DEFAULT 0,
  email_notifications BOOLEAN DEFAULT true,
  notification_threshold TEXT DEFAULT 'any' CHECK (notification_threshold IN ('any', 'high_risk_only', 'medium_plus')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_document_monitoring ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scheduled monitoring"
  ON public.scheduled_document_monitoring
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled monitoring"
  ON public.scheduled_document_monitoring
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled monitoring"
  ON public.scheduled_document_monitoring
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled monitoring"
  ON public.scheduled_document_monitoring
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can update scheduled monitoring"
  ON public.scheduled_document_monitoring
  FOR UPDATE
  USING (true);

-- Create function to calculate next scheduled execution
CREATE OR REPLACE FUNCTION public.calculate_next_scheduled_scan(
  schedule_type_param TEXT,
  schedule_time_param TIME,
  schedule_days_param INTEGER[],
  from_time_param TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  next_date TIMESTAMP WITH TIME ZONE;
  target_time TIMESTAMP WITH TIME ZONE;
  current_dow INTEGER;
  days_ahead INTEGER;
BEGIN
  CASE schedule_type_param
    WHEN 'daily' THEN
      -- Next occurrence at specified time today or tomorrow
      target_time := date_trunc('day', from_time_param) + schedule_time_param;
      IF target_time <= from_time_param THEN
        target_time := target_time + INTERVAL '1 day';
      END IF;
      RETURN target_time;
      
    WHEN 'weekly' THEN
      -- Find next scheduled day of week
      current_dow := EXTRACT(DOW FROM from_time_param)::INTEGER;
      IF current_dow = 0 THEN current_dow := 7; END IF; -- Sunday = 7
      
      -- Find next scheduled day
      days_ahead := NULL;
      FOR i IN 0..6 LOOP
        IF (current_dow + i - 1) % 7 + 1 = ANY(schedule_days_param) THEN
          IF i = 0 THEN
            -- Check if time has passed today
            target_time := date_trunc('day', from_time_param) + schedule_time_param;
            IF target_time > from_time_param THEN
              days_ahead := 0;
              EXIT;
            END IF;
          ELSE
            days_ahead := i;
            EXIT;
          END IF;
        END IF;
      END LOOP;
      
      IF days_ahead IS NULL THEN
        days_ahead := 7; -- Next week, same day
      END IF;
      
      target_time := date_trunc('day', from_time_param) + (days_ahead || ' days')::INTERVAL + schedule_time_param;
      RETURN target_time;
      
    WHEN 'monthly' THEN
      -- Same day next month at specified time
      target_time := date_trunc('day', from_time_param) + schedule_time_param;
      IF target_time <= from_time_param THEN
        target_time := (date_trunc('month', from_time_param) + INTERVAL '1 month' + schedule_time_param);
      END IF;
      RETURN target_time;
      
    ELSE
      RETURN NULL;
  END CASE;
END;
$$;

-- Create trigger to calculate next execution on insert/update
CREATE OR REPLACE FUNCTION public.update_scheduled_monitoring_next_execution()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.next_execution := public.calculate_next_scheduled_scan(
    NEW.schedule_type,
    NEW.schedule_time,
    NEW.schedule_days,
    COALESCE(NEW.last_executed, now())
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_scheduled_monitoring_next_execution
  BEFORE INSERT OR UPDATE ON public.scheduled_document_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scheduled_monitoring_next_execution();

-- Create indexes
CREATE INDEX idx_scheduled_monitoring_user_id ON public.scheduled_document_monitoring(user_id);
CREATE INDEX idx_scheduled_monitoring_next_execution ON public.scheduled_document_monitoring(next_execution) WHERE is_active = true;
CREATE INDEX idx_scheduled_monitoring_protection_record ON public.scheduled_document_monitoring(protection_record_id);

COMMENT ON TABLE public.scheduled_document_monitoring IS 'Stores scheduled document monitoring configurations for automatic scans';
COMMENT ON COLUMN public.scheduled_document_monitoring.schedule_type IS 'Frequency of scans: daily, weekly, or monthly';
COMMENT ON COLUMN public.scheduled_document_monitoring.schedule_days IS 'For weekly: days of week (1=Mon, 7=Sun)';
COMMENT ON COLUMN public.scheduled_document_monitoring.notification_threshold IS 'When to send email notifications: any match, high risk only, or medium+';
