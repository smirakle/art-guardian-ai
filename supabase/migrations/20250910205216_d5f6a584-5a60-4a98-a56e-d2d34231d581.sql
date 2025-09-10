-- Create government agency API access system
CREATE TABLE IF NOT EXISTS public.government_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_name TEXT NOT NULL,
  agency_code TEXT NOT NULL UNIQUE, -- e.g., 'FBI', 'NSA', 'DHS'
  department TEXT NOT NULL, -- e.g., 'Department of Justice', 'Department of Defense'
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  security_clearance_level TEXT NOT NULL DEFAULT 'public', -- public, secret, top_secret
  authorization_document_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  address JSONB DEFAULT '{}',
  authorized_personnel JSONB DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE public.government_agencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all agencies"
ON public.government_agencies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agencies can view their own info"
ON public.government_agencies
FOR SELECT
USING (contact_email IN (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Create government API keys table
CREATE TABLE IF NOT EXISTS public.government_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.government_agencies(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  key_name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]', -- threat_intel, monitoring, compliance, etc.
  security_classification TEXT NOT NULL DEFAULT 'unclassified',
  rate_limit_requests INTEGER NOT NULL DEFAULT 10000,
  rate_limit_window_minutes INTEGER NOT NULL DEFAULT 60,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  purpose TEXT, -- e.g., "National security monitoring", "Threat intelligence gathering"
  ip_whitelist JSONB DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE public.government_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all gov API keys"
ON public.government_api_keys
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agencies can view their own API keys"
ON public.government_api_keys
FOR SELECT
USING (agency_id IN (
  SELECT id FROM public.government_agencies 
  WHERE contact_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

-- Create government API usage tracking
CREATE TABLE IF NOT EXISTS public.government_api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.government_api_keys(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.government_agencies(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  classification_level TEXT DEFAULT 'unclassified',
  operation_type TEXT, -- e.g., 'threat_analysis', 'monitoring_scan', 'compliance_check'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.government_api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can create gov API usage records"
ON public.government_api_usage
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all gov API usage"
ON public.government_api_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agencies can view their own usage"
ON public.government_api_usage
FOR SELECT
USING (agency_id IN (
  SELECT id FROM public.government_agencies 
  WHERE contact_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

-- Create function to generate government API keys
CREATE OR REPLACE FUNCTION public.generate_government_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_key TEXT;
BEGIN
  -- Generate a secure government API key with prefix
  api_key := 'gov_' || encode(gen_random_bytes(40), 'hex');
  RETURN api_key;
END;
$$;

-- Create function to validate government API key permissions
CREATE OR REPLACE FUNCTION public.validate_government_api_key(
  api_key_param TEXT,
  required_permission TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_record RECORD;
  agency_record RECORD;
  result JSONB;
BEGIN
  -- Get API key details with agency info
  SELECT 
    gak.*,
    ga.agency_name,
    ga.agency_code,
    ga.security_clearance_level,
    ga.is_active as agency_active,
    ga.is_verified as agency_verified
  INTO key_record
  FROM public.government_api_keys gak
  JOIN public.government_agencies ga ON gak.agency_id = ga.id
  WHERE gak.api_key = api_key_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid API key'
    );
  END IF;
  
  -- Check if key is active and not expired
  IF NOT key_record.is_active OR NOT key_record.agency_active THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'API key or agency is inactive'
    );
  END IF;
  
  IF NOT key_record.agency_verified THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Agency not verified'
    );
  END IF;
  
  IF key_record.expires_at IS NOT NULL AND key_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'API key has expired'
    );
  END IF;
  
  -- Check permission if required
  IF required_permission IS NOT NULL THEN
    IF NOT (key_record.permissions ? required_permission) THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Insufficient permissions for ' || required_permission
      );
    END IF;
  END IF;
  
  -- Update last used timestamp
  UPDATE public.government_api_keys
  SET last_used_at = now()
  WHERE id = key_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'agency_id', key_record.agency_id,
    'agency_name', key_record.agency_name,
    'agency_code', key_record.agency_code,
    'security_clearance', key_record.security_clearance_level,
    'permissions', key_record.permissions,
    'classification', key_record.security_classification
  );
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_government_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_government_agencies_updated_at
  BEFORE UPDATE ON public.government_agencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_government_updated_at();

CREATE TRIGGER update_government_api_keys_updated_at
  BEFORE UPDATE ON public.government_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_government_updated_at();