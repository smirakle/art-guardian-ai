-- Create legal_profiles table for storing user legal information
CREATE TABLE public.legal_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    business_name text,
    street_address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text NOT NULL DEFAULT 'US',
    phone_number text NOT NULL,
    email_address text NOT NULL,
    website text,
    bar_number text,
    practice_areas text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.legal_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own legal profile" 
ON public.legal_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legal profile" 
ON public.legal_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal profile" 
ON public.legal_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal profile" 
ON public.legal_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create legal_document_generations table for storing generated documents
CREATE TABLE public.legal_document_generations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id text NOT NULL,
    template_type text NOT NULL,
    jurisdiction text NOT NULL DEFAULT 'US',
    content text NOT NULL,
    custom_fields jsonb DEFAULT '{}',
    document_hash text NOT NULL,
    blockchain_tx_id text,
    status text NOT NULL DEFAULT 'generated',
    compliance_level text NOT NULL DEFAULT 'standard',
    generated_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}',
    is_signed boolean DEFAULT false,
    signature_data text,
    signature_hash text,
    signed_at timestamp with time zone,
    legal_review_status text,
    legal_review_requested_at timestamp with time zone,
    legal_review_priority text,
    filing_status text,
    filed_at timestamp with time zone,
    filing_reference text,
    filing_platform text,
    validation_status text,
    validation_results jsonb,
    validated_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_document_generations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own documents" 
ON public.legal_document_generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.legal_document_generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.legal_document_generations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" 
ON public.legal_document_generations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create template_usage_analytics table for tracking usage
CREATE TABLE public.template_usage_analytics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id text NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    jurisdiction text NOT NULL DEFAULT 'US',
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.template_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can create analytics" 
ON public.template_usage_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" 
ON public.template_usage_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create legal_template_customizations table
CREATE TABLE public.legal_template_customizations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id text NOT NULL,
    custom_fields jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, template_id)
);

-- Enable RLS
ALTER TABLE public.legal_template_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their customizations" 
ON public.legal_template_customizations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create legal_review_queue table
CREATE TABLE public.legal_review_queue (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid NOT NULL REFERENCES legal_document_generations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    priority text NOT NULL DEFAULT 'standard',
    estimated_completion timestamp with time zone,
    status text NOT NULL DEFAULT 'queued',
    metadata jsonb DEFAULT '{}',
    assigned_reviewer_id uuid,
    review_notes text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_review_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own review requests" 
ON public.legal_review_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create review requests" 
ON public.legal_review_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all reviews" 
ON public.legal_review_queue 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create update timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_legal_profiles_updated_at
BEFORE UPDATE ON public.legal_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_document_generations_updated_at
BEFORE UPDATE ON public.legal_document_generations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_template_customizations_updated_at
BEFORE UPDATE ON public.legal_template_customizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_review_queue_updated_at
BEFORE UPDATE ON public.legal_review_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();