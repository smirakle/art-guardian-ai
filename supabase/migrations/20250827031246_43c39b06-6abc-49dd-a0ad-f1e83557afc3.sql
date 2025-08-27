-- Create operating_costs table for tracking TSMO overhead expenses
CREATE TABLE public.operating_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  monthly_amount INTEGER NOT NULL, -- Amount in cents
  annual_amount INTEGER GENERATED ALWAYS AS (monthly_amount * 12) STORED,
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT,
  is_variable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operating_costs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all operating costs" 
ON public.operating_costs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_operating_costs_updated_at
BEFORE UPDATE ON public.operating_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial operating cost data
INSERT INTO public.operating_costs (category, subcategory, monthly_amount, description, is_variable) VALUES
-- Infrastructure & Technology
('Infrastructure', 'Supabase Pro', 2500, 'Database and backend services', false),
('Infrastructure', 'Vercel Pro', 2000, 'Frontend hosting and deployment', false),
('Infrastructure', 'Domain & SSL', 500, 'Domain registration and SSL certificates', false),
('Infrastructure', 'CDN & Storage', 1000, 'Content delivery and file storage', true),

-- External APIs & Services
('API Services', 'Google Vision API', 15000, 'Image analysis and recognition', true),
('API Services', 'OpenAI API', 30000, 'AI-powered content analysis', true),
('API Services', 'Legal Data APIs', 10000, 'Legal database access and research', true),
('API Services', 'Blockchain APIs', 5000, 'Blockchain verification services', true),

-- Legal & Compliance
('Legal', 'Patent Maintenance', 250000, 'Patent portfolio maintenance fees', false),
('Legal', 'Legal Counsel', 100000, 'General legal advisory services', false),
('Legal', 'Compliance Audits', 25000, 'Regular compliance and security audits', false),

-- Business Operations
('Operations', 'Email Services', 5000, 'Transactional and marketing emails', true),
('Operations', 'Analytics Tools', 3000, 'Business intelligence and analytics', false),
('Operations', 'Security Tools', 8000, 'Security monitoring and protection', false),
('Operations', 'Backup Services', 2000, 'Data backup and disaster recovery', false),

-- Development & Maintenance
('Development', 'Third-party Libraries', 1000, 'Software licenses and libraries', false),
('Development', 'Monitoring Tools', 4000, 'Application performance monitoring', false),
('Development', 'Testing Services', 2500, 'Automated testing and QA tools', false);

-- Create function to get total operating costs
CREATE OR REPLACE FUNCTION public.get_total_operating_costs()
RETURNS TABLE(
  total_monthly INTEGER,
  total_annual INTEGER,
  fixed_monthly INTEGER,
  variable_monthly INTEGER,
  cost_breakdown JSONB
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH cost_summary AS (
    SELECT 
      SUM(monthly_amount) as total_monthly,
      SUM(monthly_amount * 12) as total_annual,
      SUM(CASE WHEN is_variable = false THEN monthly_amount ELSE 0 END) as fixed_monthly,
      SUM(CASE WHEN is_variable = true THEN monthly_amount ELSE 0 END) as variable_monthly
    FROM public.operating_costs 
    WHERE is_active = true
  ),
  category_breakdown AS (
    SELECT jsonb_object_agg(
      category, 
      jsonb_build_object(
        'monthly_total', category_total,
        'items', items
      )
    ) as breakdown
    FROM (
      SELECT 
        category,
        SUM(monthly_amount) as category_total,
        jsonb_agg(
          jsonb_build_object(
            'subcategory', subcategory,
            'monthly_amount', monthly_amount,
            'description', description,
            'is_variable', is_variable
          )
        ) as items
      FROM public.operating_costs 
      WHERE is_active = true
      GROUP BY category
    ) category_data
  )
  SELECT 
    cs.total_monthly,
    cs.total_annual,
    cs.fixed_monthly,
    cs.variable_monthly,
    cb.breakdown
  FROM cost_summary cs
  CROSS JOIN category_breakdown cb;
$$;