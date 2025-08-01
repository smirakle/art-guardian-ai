-- Create tables for legal document processing and international compliance

-- Generated legal documents table
CREATE TABLE IF NOT EXISTS public.generated_legal_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    template_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    document_content TEXT NOT NULL,
    document_metadata JSONB NOT NULL DEFAULT '{}',
    compliance_status TEXT NOT NULL DEFAULT 'pending',
    word_count INTEGER NOT NULL DEFAULT 0,
    estimated_value INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Government filings table
CREATE TABLE IF NOT EXISTS public.government_filings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL,
    user_id UUID NOT NULL,
    filing_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    filing_status TEXT NOT NULL DEFAULT 'pending',
    government_reference TEXT,
    filed_at TIMESTAMP WITH TIME ZONE,
    expected_response_date TIMESTAMP WITH TIME ZONE,
    actual_response_date TIMESTAMP WITH TIME ZONE,
    filing_fee NUMERIC(10,2),
    filing_metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- International compliance analysis table
CREATE TABLE IF NOT EXISTS public.international_compliance_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_jurisdiction TEXT NOT NULL,
    target_jurisdictions TEXT[] NOT NULL,
    legal_matter TEXT NOT NULL,
    document_type TEXT,
    compliance_level TEXT NOT NULL DEFAULT 'standard',
    compliance_results JSONB NOT NULL DEFAULT '[]',
    conflict_analysis JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB NOT NULL DEFAULT '[]',
    compliance_score INTEGER NOT NULL DEFAULT 0,
    analysis_metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DMCA notices table (enhanced)
CREATE TABLE IF NOT EXISTS public.dmca_notices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID,
    artwork_id UUID,
    copyright_owner_name TEXT NOT NULL,
    copyright_owner_email TEXT NOT NULL,
    copyright_owner_address TEXT NOT NULL,
    copyright_work_description TEXT NOT NULL,
    infringing_url TEXT NOT NULL,
    infringing_description TEXT NOT NULL,
    target_domain TEXT NOT NULL,
    electronic_signature TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'filed',
    filed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    response_received_at TIMESTAMP WITH TIME ZONE,
    platform_specific_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.generated_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_compliance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dmca_notices ENABLE ROW LEVEL SECURITY;

-- RLS policies for generated_legal_documents
CREATE POLICY "Users can manage their own legal documents"
ON public.generated_legal_documents
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for government_filings
CREATE POLICY "Users can manage their own government filings"
ON public.government_filings
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for international_compliance_analysis
CREATE POLICY "Users can create compliance analysis"
ON public.international_compliance_analysis
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view all compliance analysis"
ON public.international_compliance_analysis
FOR SELECT
USING (true);

-- RLS policies for dmca_notices
CREATE POLICY "System can create DMCA notices"
ON public.dmca_notices
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view DMCA notices for their matches"
ON public.dmca_notices
FOR SELECT
USING (
    match_id IN (
        SELECT cm.id 
        FROM copyright_matches cm
        JOIN artwork a ON cm.artwork_id = a.id
        WHERE a.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update DMCA notices for their matches"
ON public.dmca_notices
FOR UPDATE
USING (
    match_id IN (
        SELECT cm.id 
        FROM copyright_matches cm
        JOIN artwork a ON cm.artwork_id = a.id
        WHERE a.user_id = auth.uid()
    )
);

-- Add updated_at triggers
CREATE TRIGGER update_generated_legal_documents_updated_at
    BEFORE UPDATE ON public.generated_legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_filings_updated_at
    BEFORE UPDATE ON public.government_filings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_international_compliance_analysis_updated_at
    BEFORE UPDATE ON public.international_compliance_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dmca_notices_updated_at
    BEFORE UPDATE ON public.dmca_notices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_legal_documents_user_id ON public.generated_legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_legal_documents_template_type ON public.generated_legal_documents(template_type);
CREATE INDEX IF NOT EXISTS idx_government_filings_user_id ON public.government_filings(user_id);
CREATE INDEX IF NOT EXISTS idx_government_filings_status ON public.government_filings(filing_status);
CREATE INDEX IF NOT EXISTS idx_dmca_notices_match_id ON public.dmca_notices(match_id);
CREATE INDEX IF NOT EXISTS idx_dmca_notices_status ON public.dmca_notices(status);