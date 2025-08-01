-- Create production optimization tables for enhanced monitoring and performance

-- Enhanced alert channels table
CREATE TABLE public.alert_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('email', 'sms', 'webhook', 'push')),
  channel_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority_level TEXT NOT NULL DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance metrics table for system monitoring
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  additional_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_component TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System optimizations tracking
CREATE TABLE public.system_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  optimization_type TEXT NOT NULL CHECK (optimization_type IN ('rate_limiting', 'caching', 'alerts', 'analytics', 'reporting')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  configuration JSONB NOT NULL DEFAULT '{}',
  performance_impact JSONB DEFAULT '{}',
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cache performance tracking
CREATE TABLE public.cache_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  miss_count INTEGER NOT NULL DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ttl_seconds INTEGER NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced monitoring alerts with multi-channel support
CREATE TABLE public.advanced_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_data JSONB DEFAULT '{}',
  delivery_channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
  delivery_status JSONB DEFAULT '{}',
  is_escalated BOOLEAN NOT NULL DEFAULT false,
  escalation_level INTEGER NOT NULL DEFAULT 0,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.alert_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert_channels
CREATE POLICY "Users can manage their own alert channels" 
ON public.alert_channels 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for performance_metrics (admin and system access)
CREATE POLICY "Admins can view all performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ) OR auth.uid() IS NULL
);

CREATE POLICY "System can insert performance metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for system_optimizations (admin only)
CREATE POLICY "Admins can manage system optimizations" 
ON public.system_optimizations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- RLS Policies for cache_statistics (system access)
CREATE POLICY "System can manage cache statistics" 
ON public.cache_statistics 
FOR ALL 
USING (true);

-- RLS Policies for advanced_alerts
CREATE POLICY "Users can view their own advanced alerts" 
ON public.advanced_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own advanced alerts" 
ON public.advanced_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create advanced alerts" 
ON public.advanced_alerts 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_alert_channels_user_id ON public.alert_channels(user_id);
CREATE INDEX idx_alert_channels_active ON public.alert_channels(is_active) WHERE is_active = true;
CREATE INDEX idx_performance_metrics_type_recorded ON public.performance_metrics(metric_type, recorded_at);
CREATE INDEX idx_performance_metrics_recorded_at ON public.performance_metrics(recorded_at);
CREATE INDEX idx_system_optimizations_type ON public.system_optimizations(optimization_type);
CREATE INDEX idx_cache_statistics_key ON public.cache_statistics(cache_key);
CREATE INDEX idx_cache_statistics_accessed ON public.cache_statistics(last_accessed);
CREATE INDEX idx_advanced_alerts_user_severity ON public.advanced_alerts(user_id, severity);
CREATE INDEX idx_advanced_alerts_created_at ON public.advanced_alerts(created_at);
CREATE INDEX idx_advanced_alerts_unresolved ON public.advanced_alerts(resolved_at) WHERE resolved_at IS NULL;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alert_channels_updated_at
  BEFORE UPDATE ON public.alert_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_optimizations_updated_at
  BEFORE UPDATE ON public.system_optimizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cache_statistics_updated_at
  BEFORE UPDATE ON public.cache_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advanced_alerts_updated_at
  BEFORE UPDATE ON public.advanced_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system optimizations
INSERT INTO public.system_optimizations (optimization_type, is_enabled, configuration) VALUES
('rate_limiting', true, '{"maxRequests": 100, "windowMs": 60000, "burstLimit": 20, "cooldownMs": 5000}'),
('caching', true, '{"maxSize": 104857600, "defaultTTL": 3600000, "enablePersistence": true, "compressionThreshold": 10240}'),
('alerts', true, '{"channels": ["email", "push"], "escalationTimeout": 1800000, "priorityRouting": true}'),
('analytics', true, '{"enablePredictions": true, "metricsRetention": 2592000000, "reportGeneration": true}'),
('reporting', true, '{"enableAdvancedReports": true, "autoGeneration": true, "exportFormats": ["pdf", "csv", "json"]}')