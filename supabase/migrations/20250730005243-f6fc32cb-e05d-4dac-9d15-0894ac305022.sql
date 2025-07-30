-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  monitoring_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_settings JSONB DEFAULT '{"email": true, "webhook": false, "severity_threshold": "medium"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_items table (many-to-many relationship between portfolios and artwork)
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  artwork_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(portfolio_id, artwork_id)
);

-- Create portfolio_monitoring_results table for aggregated results
CREATE TABLE public.portfolio_monitoring_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_artworks INTEGER NOT NULL DEFAULT 0,
  artworks_scanned INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  high_risk_matches INTEGER NOT NULL DEFAULT 0,
  medium_risk_matches INTEGER NOT NULL DEFAULT 0,
  low_risk_matches INTEGER NOT NULL DEFAULT 0,
  platforms_scanned TEXT[] NOT NULL DEFAULT '{}',
  scan_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_alerts table
CREATE TABLE public.portfolio_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_monitoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolios
CREATE POLICY "Users can manage their own portfolios"
ON public.portfolios
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_items
CREATE POLICY "Users can manage items in their portfolios"
ON public.portfolio_items
FOR ALL
USING (
  portfolio_id IN (
    SELECT id FROM public.portfolios WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for portfolio_monitoring_results
CREATE POLICY "Users can view their portfolio monitoring results"
ON public.portfolio_monitoring_results
FOR SELECT
USING (
  portfolio_id IN (
    SELECT id FROM public.portfolios WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can create portfolio monitoring results"
ON public.portfolio_monitoring_results
FOR INSERT
WITH CHECK (true);

-- Create RLS policies for portfolio_alerts
CREATE POLICY "Users can manage their portfolio alerts"
ON public.portfolio_alerts
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolio_items_portfolio_id ON public.portfolio_items(portfolio_id);
CREATE INDEX idx_portfolio_items_artwork_id ON public.portfolio_items(artwork_id);
CREATE INDEX idx_portfolio_monitoring_results_portfolio_id ON public.portfolio_monitoring_results(portfolio_id);
CREATE INDEX idx_portfolio_monitoring_results_scan_date ON public.portfolio_monitoring_results(scan_date);
CREATE INDEX idx_portfolio_alerts_portfolio_id ON public.portfolio_alerts(portfolio_id);
CREATE INDEX idx_portfolio_alerts_user_id ON public.portfolio_alerts(user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();