-- Create DMCA notices table
CREATE TABLE public.dmca_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  artwork_id UUID NOT NULL,
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
  response_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dmca_notices ENABLE ROW LEVEL SECURITY;

-- Create policies for DMCA notices
CREATE POLICY "Users can view their own DMCA notices" 
ON public.dmca_notices 
FOR SELECT 
USING (artwork_id IN (
  SELECT id FROM public.artwork WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create DMCA notices for their artwork" 
ON public.dmca_notices 
FOR INSERT 
WITH CHECK (artwork_id IN (
  SELECT id FROM public.artwork WHERE user_id = auth.uid()
));

-- Add DMCA tracking columns to copyright_matches
ALTER TABLE public.copyright_matches 
ADD COLUMN dmca_filed BOOLEAN DEFAULT false,
ADD COLUMN dmca_filed_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at
CREATE TRIGGER update_dmca_notices_updated_at
BEFORE UPDATE ON public.dmca_notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();