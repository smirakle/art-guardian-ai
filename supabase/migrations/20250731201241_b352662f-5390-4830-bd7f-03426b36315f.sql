-- Create table for user legal profiles
CREATE TABLE IF NOT EXISTS public.user_legal_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  business_name TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT,
  business_type TEXT, -- individual, corporation, llc, etc.
  tax_id TEXT,
  preferred_jurisdiction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for legal document generations
CREATE TABLE IF NOT EXISTS public.legal_document_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_title TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  document_hash TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded TIMESTAMP WITH TIME ZONE,
  is_signed BOOLEAN NOT NULL DEFAULT false,
  signature_data JSONB,
  witness_data JSONB,
  notarization_data JSONB,
  legal_review_status TEXT DEFAULT 'pending', -- pending, approved, requires_revision
  legal_reviewer_id UUID,
  legal_review_notes TEXT,
  legal_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for legal compliance tracking
CREATE TABLE IF NOT EXISTS public.legal_compliance_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.legal_document_generations(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL, -- dmca_filing, copyright_registration, contract_execution
  jurisdiction TEXT NOT NULL,
  filing_number TEXT,
  filing_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'initiated', -- initiated, filed, acknowledged, completed, rejected
  government_response JSONB,
  deadline_date TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  cost_usd DECIMAL(10,2),
  supporting_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for legal template customizations
CREATE TABLE IF NOT EXISTS public.legal_template_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  preferred_jurisdiction TEXT,
  custom_clauses JSONB DEFAULT '[]',
  saved_name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for legal professional directory
CREATE TABLE IF NOT EXISTS public.legal_professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  law_firm TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  jurisdictions TEXT[] NOT NULL DEFAULT '{}',
  bar_numbers JSONB DEFAULT '{}', -- {"CA": "123456", "NY": "789012"}
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  languages TEXT[] DEFAULT '{English}',
  years_experience INTEGER,
  education TEXT[],
  certifications TEXT[],
  bio TEXT,
  website TEXT,
  linkedin_url TEXT,
  profile_image_url TEXT,
  accepts_new_clients BOOLEAN NOT NULL DEFAULT true,
  consultation_fee INTEGER, -- in USD cents
  response_time_hours INTEGER DEFAULT 24,
  rating DECIMAL(3,2), -- average rating out of 5.00
  review_count INTEGER NOT NULL DEFAULT 0,
  verified_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  verification_documents JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for legal consultations
CREATE TABLE IF NOT EXISTS public.legal_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.legal_professionals(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency_level TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  consultation_type TEXT NOT NULL, -- document_review, legal_advice, representation
  budget_range TEXT, -- under_500, 500_1000, 1000_5000, over_5000
  preferred_communication TEXT DEFAULT 'email', -- email, phone, video, in_person
  requested_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, completed, cancelled
  professional_response TEXT,
  estimated_cost INTEGER, -- in USD cents
  actual_cost INTEGER,
  session_notes TEXT,
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  rating INTEGER, -- 1-5 stars
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_legal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_legal_profiles
CREATE POLICY "Users can manage their own legal profile"
  ON public.user_legal_profiles
  FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for legal_document_generations
CREATE POLICY "Users can manage their own documents"
  ON public.legal_document_generations
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Legal professionals can review documents"
  ON public.legal_document_generations
  FOR SELECT
  USING (
    legal_reviewer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.legal_professionals
      WHERE id = auth.uid() AND verified_status = 'verified'
    )
  );

-- Create RLS policies for legal_compliance_tracking
CREATE POLICY "Users can view their own compliance tracking"
  ON public.legal_compliance_tracking
  FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for legal_template_customizations
CREATE POLICY "Users can manage their template customizations"
  ON public.legal_template_customizations
  FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for legal_professionals
CREATE POLICY "Anyone can view verified professionals"
  ON public.legal_professionals
  FOR SELECT
  USING (verified_status = 'verified' AND is_active = true);

CREATE POLICY "Professionals can manage their own profile"
  ON public.legal_professionals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = legal_professionals.email
    )
  );

CREATE POLICY "Admins can manage all professionals"
  ON public.legal_professionals
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for legal_consultations
CREATE POLICY "Users can view their consultations"
  ON public.legal_consultations
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their consultations"
  ON public.legal_consultations
  FOR ALL
  USING (
    professional_id = (
      SELECT id FROM public.legal_professionals
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      LIMIT 1
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_user_legal_profiles_user_id ON public.user_legal_profiles(user_id);
CREATE INDEX idx_legal_document_generations_user_id ON public.legal_document_generations(user_id);
CREATE INDEX idx_legal_document_generations_template_id ON public.legal_document_generations(template_id);
CREATE INDEX idx_legal_compliance_tracking_user_id ON public.legal_compliance_tracking(user_id);
CREATE INDEX idx_legal_compliance_tracking_document_id ON public.legal_compliance_tracking(document_id);
CREATE INDEX idx_legal_template_customizations_user_id ON public.legal_template_customizations(user_id);
CREATE INDEX idx_legal_template_customizations_template_id ON public.legal_template_customizations(template_id);
CREATE INDEX idx_legal_professionals_specialties ON public.legal_professionals USING GIN(specialties);
CREATE INDEX idx_legal_professionals_jurisdictions ON public.legal_professionals USING GIN(jurisdictions);
CREATE INDEX idx_legal_consultations_user_id ON public.legal_consultations(user_id);
CREATE INDEX idx_legal_consultations_professional_id ON public.legal_consultations(professional_id);

-- Create functions for template processing
CREATE OR REPLACE FUNCTION public.generate_document_hash(content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$$;

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_legal_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_legal_profiles_updated_at
  BEFORE UPDATE ON public.user_legal_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_legal_updated_at();

CREATE TRIGGER update_legal_document_generations_updated_at
  BEFORE UPDATE ON public.legal_document_generations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_legal_updated_at();

CREATE TRIGGER update_legal_compliance_tracking_updated_at
  BEFORE UPDATE ON public.legal_compliance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_legal_updated_at();

CREATE TRIGGER update_legal_template_customizations_updated_at
  BEFORE UPDATE ON public.legal_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_legal_updated_at();

CREATE TRIGGER update_legal_professionals_updated_at
  BEFORE UPDATE ON public.legal_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_legal_updated_at();

CREATE TRIGGER update_legal_consultations_updated_at
  BEFORE UPDATE ON public.legal_consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_legal_updated_at();