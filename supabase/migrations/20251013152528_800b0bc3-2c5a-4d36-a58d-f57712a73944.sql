-- Create table for SSL certificate monitoring
CREATE TABLE IF NOT EXISTS public.ssl_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  issuer TEXT,
  subject TEXT,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_to TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER,
  is_valid BOOLEAN DEFAULT false,
  protocol_version TEXT,
  cipher_suite TEXT,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'unknown',
  error_message TEXT,
  certificate_chain JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ssl_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage SSL certificates"
  ON public.ssl_certificates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view SSL certificates"
  ON public.ssl_certificates
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_domain ON public.ssl_certificates(domain);
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_valid_to ON public.ssl_certificates(valid_to);

-- Create trigger for updated_at
CREATE TRIGGER update_ssl_certificates_updated_at
  BEFORE UPDATE ON public.ssl_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();