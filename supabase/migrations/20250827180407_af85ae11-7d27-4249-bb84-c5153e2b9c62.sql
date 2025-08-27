-- Enable RLS on trademark-related tables
ALTER TABLE public.trademarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trademark_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trademark_monitoring_scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trademarks table
CREATE POLICY "Users can view their own trademarks" 
ON public.trademarks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trademarks" 
ON public.trademarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trademarks" 
ON public.trademarks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trademarks" 
ON public.trademarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for trademark_alerts table
CREATE POLICY "Users can view their own trademark alerts" 
ON public.trademark_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trademark alerts" 
ON public.trademark_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trademark alerts" 
ON public.trademark_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for trademark_monitoring_scans table
CREATE POLICY "Users can view their own trademark scans" 
ON public.trademark_monitoring_scans 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.trademarks 
  WHERE trademarks.id = trademark_monitoring_scans.trademark_id 
  AND trademarks.user_id = auth.uid()
));

CREATE POLICY "Users can create trademark scans for their trademarks" 
ON public.trademark_monitoring_scans 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.trademarks 
  WHERE trademarks.id = trademark_monitoring_scans.trademark_id 
  AND trademarks.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trademarks_user_id ON public.trademarks(user_id);
CREATE INDEX IF NOT EXISTS idx_trademarks_status ON public.trademarks(status);
CREATE INDEX IF NOT EXISTS idx_trademarks_jurisdiction ON public.trademarks(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_trademarks_monitoring_enabled ON public.trademarks(monitoring_enabled);

CREATE INDEX IF NOT EXISTS idx_trademark_alerts_user_id ON public.trademark_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_trademark_alerts_status ON public.trademark_alerts(status);
CREATE INDEX IF NOT EXISTS idx_trademark_alerts_severity ON public.trademark_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_trademark_alerts_created_at ON public.trademark_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_trademark_monitoring_scans_trademark_id ON public.trademark_monitoring_scans(trademark_id);
CREATE INDEX IF NOT EXISTS idx_trademark_monitoring_scans_created_at ON public.trademark_monitoring_scans(created_at);