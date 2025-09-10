-- Create industry verticals table
CREATE TABLE public.industry_verticals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  requires_security_clearance BOOLEAN DEFAULT false,
  export_controlled BOOLEAN DEFAULT false,
  compliance_requirements JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default industry verticals
INSERT INTO public.industry_verticals (name, slug, description, icon, requires_security_clearance, export_controlled) VALUES
('Creative & Media', 'creative-media', 'Digital art, photography, video content, and creative works protection', 'Palette', false, false),
('Military Thermoelectric Materials', 'military-thermoelectric', 'Defense applications for thermoelectric materials and energy conversion systems', 'Shield', true, true),
('Global Thermoelectric Modules', 'global-thermoelectric', 'Commercial and industrial thermoelectric module development and deployment', 'Zap', false, false),
('RTGs & SiGe Applications', 'rtgs-sige', 'Radioisotope Thermoelectric Generators and Silicon Germanium applications', 'Atom', true, true),
('Scientific Research', 'scientific-research', 'Academic and research institution IP protection and collaboration', 'Microscope', false, false),
('Government Defense', 'government-defense', 'Government and defense contractor intellectual property protection', 'Building', true, true);

-- Create user industries junction table
CREATE TABLE public.user_industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  industry_id UUID NOT NULL REFERENCES public.industry_verticals(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  security_clearance_level TEXT,
  attestation_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, industry_id)
);

-- Add industry and data classification to portfolios
ALTER TABLE public.portfolios 
ADD COLUMN industry_id UUID REFERENCES public.industry_verticals(id),
ADD COLUMN data_classification TEXT DEFAULT 'unclassified' CHECK (data_classification IN ('unclassified', 'sensitive', 'export-controlled', 'classified')),
ADD COLUMN compliance_notes TEXT,
ADD COLUMN export_control_notice BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.industry_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_industries ENABLE ROW LEVEL SECURITY;

-- RLS policies for industry_verticals (public read)
CREATE POLICY "Anyone can view active industry verticals" 
ON public.industry_verticals 
FOR SELECT 
USING (is_active = true);

-- RLS policies for user_industries
CREATE POLICY "Users can manage their own industry associations" 
ON public.user_industries 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all industry associations" 
ON public.user_industries 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_industry_verticals_updated_at
BEFORE UPDATE ON public.industry_verticals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_industries_updated_at
BEFORE UPDATE ON public.user_industries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user's primary industry
CREATE OR REPLACE FUNCTION public.get_user_primary_industry(user_id_param UUID)
RETURNS TABLE(industry_name TEXT, industry_slug TEXT, requires_clearance BOOLEAN, export_controlled BOOLEAN)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    iv.name,
    iv.slug,
    iv.requires_security_clearance,
    iv.export_controlled
  FROM public.user_industries ui
  JOIN public.industry_verticals iv ON ui.industry_id = iv.id
  WHERE ui.user_id = user_id_param 
    AND ui.is_primary = true
    AND iv.is_active = true
  LIMIT 1;
$$;