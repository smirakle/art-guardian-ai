-- Create white label organizations table
CREATE TABLE public.white_label_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Used for custom domains and identification
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Branding settings
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  accent_color TEXT DEFAULT '#06b6d4',
  company_name TEXT NOT NULL,
  company_description TEXT,
  custom_css TEXT,
  
  -- Domain settings
  custom_domain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  domain_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  max_users INTEGER DEFAULT 100,
  max_artworks INTEGER DEFAULT 1000,
  features JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.white_label_organizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization owners can manage their organization"
ON public.white_label_organizations
FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all organizations"
ON public.white_label_organizations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create white label users table (users within white label organizations)
CREATE TABLE public.white_label_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.white_label_organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.white_label_users ENABLE ROW LEVEL SECURITY;

-- Create policies for white label users
CREATE POLICY "Organization members can view organization users"
ON public.white_label_users
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.white_label_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage users"
ON public.white_label_users
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.white_label_users 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR
  organization_id IN (
    SELECT id FROM public.white_label_organizations 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "System admins can manage all white label users"
ON public.white_label_users
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create white label domains table for multiple domain support
CREATE TABLE public.white_label_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.white_label_organizations(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  ssl_enabled BOOLEAN DEFAULT false,
  dns_configured BOOLEAN DEFAULT false,
  verification_token TEXT DEFAULT gen_random_uuid()::text,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(domain)
);

-- Enable RLS
ALTER TABLE public.white_label_domains ENABLE ROW LEVEL SECURITY;

-- Create policies for domains
CREATE POLICY "Organization owners can manage their domains"
ON public.white_label_domains
FOR ALL
USING (
  organization_id IN (
    SELECT id FROM public.white_label_organizations 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all domains"
ON public.white_label_domains
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update subscriptions table to include enterprise plan and white label features
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_domain_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_white_label_users INTEGER DEFAULT 0;

-- Create function to check white label access
CREATE OR REPLACE FUNCTION public.user_has_white_label_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND s.plan_id IN ('professional', 'enterprise')
    AND s.white_label_enabled = true
    AND s.current_period_end > now()
  );
$$;

-- Create function to get user's white label organization
CREATE OR REPLACE FUNCTION public.get_user_white_label_org()
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_slug TEXT,
  is_owner BOOLEAN,
  user_role TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Check if user owns an organization
  SELECT 
    wlo.id,
    wlo.name,
    wlo.slug,
    true as is_owner,
    'owner'::text as user_role
  FROM public.white_label_organizations wlo
  WHERE wlo.owner_id = auth.uid()
  AND wlo.is_active = true
  
  UNION ALL
  
  -- Check if user is a member of an organization
  SELECT 
    wlo.id,
    wlo.name,
    wlo.slug,
    false as is_owner,
    wlu.role
  FROM public.white_label_organizations wlo
  JOIN public.white_label_users wlu ON wlo.id = wlu.organization_id
  WHERE wlu.user_id = auth.uid()
  AND wlo.is_active = true
  AND wlu.is_active = true
  
  LIMIT 1;
$$;

-- Create trigger for updating timestamps
CREATE TRIGGER update_white_label_organizations_updated_at
BEFORE UPDATE ON public.white_label_organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_white_label_users_updated_at
BEFORE UPDATE ON public.white_label_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_white_label_domains_updated_at
BEFORE UPDATE ON public.white_label_domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();