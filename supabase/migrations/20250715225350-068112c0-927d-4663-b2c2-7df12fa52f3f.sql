-- Create blockchain certificates table for storing ownership proofs
CREATE TABLE public.blockchain_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT NOT NULL UNIQUE,
  artwork_id UUID NOT NULL,
  user_id UUID NOT NULL,
  blockchain_hash TEXT NOT NULL,
  artwork_fingerprint TEXT NOT NULL,
  ownership_proof TEXT NOT NULL,
  registration_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  certificate_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add blockchain-related columns to artwork table
ALTER TABLE public.artwork 
ADD COLUMN blockchain_hash TEXT,
ADD COLUMN blockchain_certificate_id TEXT,
ADD COLUMN blockchain_registered_at TIMESTAMP WITH TIME ZONE;

-- Enable Row Level Security
ALTER TABLE public.blockchain_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for blockchain certificates
CREATE POLICY "Users can view their own certificates" 
ON public.blockchain_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create certificates for their artwork" 
ON public.blockchain_certificates 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  artwork_id IN (SELECT id FROM public.artwork WHERE user_id = auth.uid())
);

-- Create index for faster certificate lookups
CREATE INDEX idx_blockchain_certificates_certificate_id ON public.blockchain_certificates(certificate_id);
CREATE INDEX idx_blockchain_certificates_artwork_id ON public.blockchain_certificates(artwork_id);
CREATE INDEX idx_artwork_blockchain_hash ON public.artwork(blockchain_hash) WHERE blockchain_hash IS NOT NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blockchain_certificates_updated_at
BEFORE UPDATE ON public.blockchain_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();