-- Create storage bucket for government filing documents
INSERT INTO storage.buckets (id, name, public) VALUES ('government-filings', 'government-filings', false);

-- Create government filing requests table
CREATE TABLE IF NOT EXISTS public.government_filing_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    filing_type TEXT NOT NULL,
    document_title TEXT NOT NULL,
    document_description TEXT,
    document_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
    filing_jurisdiction TEXT NOT NULL,
    urgency_level TEXT NOT NULL DEFAULT 'standard' CHECK (urgency_level IN ('standard', 'expedited', 'rush')),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    additional_instructions TEXT,
    filing_fee_paid BOOLEAN NOT NULL DEFAULT false,
    stripe_session_id TEXT,
    amount_paid INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    filing_status TEXT NOT NULL DEFAULT 'received' CHECK (filing_status IN ('received', 'in_review', 'filed', 'rejected', 'completed')),
    admin_notes TEXT,
    filed_at TIMESTAMP WITH TIME ZONE,
    filed_by UUID,
    tracking_number TEXT,
    government_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.government_filing_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own filing requests" 
ON public.government_filing_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own filing requests" 
ON public.government_filing_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filing requests" 
ON public.government_filing_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all filing requests" 
ON public.government_filing_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_government_filing_requests_updated_at
BEFORE UPDATE ON public.government_filing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for government filings
CREATE POLICY "Users can upload their own filing documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'government-filings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own filing documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'government-filings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all filing documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'government-filings' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can download all filing documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'government-filings' AND has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_government_filing_requests_user_id ON public.government_filing_requests(user_id);
CREATE INDEX idx_government_filing_requests_status ON public.government_filing_requests(filing_status);
CREATE INDEX idx_government_filing_requests_payment_status ON public.government_filing_requests(payment_status);
CREATE INDEX idx_government_filing_requests_created_at ON public.government_filing_requests(created_at);