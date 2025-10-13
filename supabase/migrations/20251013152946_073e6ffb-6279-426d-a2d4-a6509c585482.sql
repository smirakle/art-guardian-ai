-- Create table for CDN configurations
CREATE TABLE IF NOT EXISTS public.cdn_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'cloudflare', 'cloudfront', 'vercel', 'custom'
  status TEXT DEFAULT 'active',
  edge_locations JSONB DEFAULT '[]'::jsonb,
  cache_rules JSONB DEFAULT '{}'::jsonb,
  custom_headers JSONB DEFAULT '{}'::jsonb,
  ssl_enabled BOOLEAN DEFAULT true,
  http2_enabled BOOLEAN DEFAULT true,
  compression_enabled BOOLEAN DEFAULT true,
  minification_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for CDN performance metrics
CREATE TABLE IF NOT EXISTS public.cdn_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cdn_config_id UUID REFERENCES public.cdn_configurations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  region TEXT,
  response_time_ms INTEGER,
  cache_hit_ratio NUMERIC(5,2),
  bandwidth_bytes BIGINT,
  requests_count INTEGER,
  error_count INTEGER,
  status_2xx INTEGER DEFAULT 0,
  status_3xx INTEGER DEFAULT 0,
  status_4xx INTEGER DEFAULT 0,
  status_5xx INTEGER DEFAULT 0,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for CDN cache analytics
CREATE TABLE IF NOT EXISTS public.cdn_cache_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cdn_config_id UUID REFERENCES public.cdn_configurations(id) ON DELETE CASCADE,
  asset_type TEXT, -- 'image', 'css', 'js', 'html', 'other'
  cache_hit BOOLEAN DEFAULT false,
  cache_status TEXT, -- 'HIT', 'MISS', 'EXPIRED', 'STALE'
  size_bytes BIGINT,
  edge_location TEXT,
  user_country TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cdn_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdn_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdn_cache_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for CDN configurations
CREATE POLICY "Admins can manage all CDN configurations"
  ON public.cdn_configurations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view CDN configurations"
  ON public.cdn_configurations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create policies for CDN performance metrics
CREATE POLICY "Admins can manage CDN performance metrics"
  ON public.cdn_performance_metrics
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view CDN metrics"
  ON public.cdn_performance_metrics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create policies for CDN cache analytics
CREATE POLICY "Admins can manage CDN cache analytics"
  ON public.cdn_cache_analytics
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert cache analytics"
  ON public.cdn_cache_analytics
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cdn_configs_domain ON public.cdn_configurations(domain);
CREATE INDEX IF NOT EXISTS idx_cdn_configs_provider ON public.cdn_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_cdn_metrics_config_id ON public.cdn_performance_metrics(cdn_config_id);
CREATE INDEX IF NOT EXISTS idx_cdn_metrics_measured_at ON public.cdn_performance_metrics(measured_at);
CREATE INDEX IF NOT EXISTS idx_cdn_analytics_config_id ON public.cdn_cache_analytics(cdn_config_id);
CREATE INDEX IF NOT EXISTS idx_cdn_analytics_requested_at ON public.cdn_cache_analytics(requested_at);

-- Create trigger for updated_at
CREATE TRIGGER update_cdn_configurations_updated_at
  BEFORE UPDATE ON public.cdn_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();