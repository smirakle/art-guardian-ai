-- Create tables for blockchain and NFT functionality

-- NFT tokens table
CREATE TABLE IF NOT EXISTS public.nft_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    artwork_id UUID NOT NULL,
    user_id UUID NOT NULL,
    token_id BIGINT NOT NULL,
    contract_address TEXT NOT NULL,
    blockchain TEXT NOT NULL DEFAULT 'polygon',
    metadata_ipfs_hash TEXT NOT NULL,
    mint_transaction_hash TEXT NOT NULL,
    royalty_percentage INTEGER NOT NULL DEFAULT 500,
    collection_name TEXT,
    owner_wallet_address TEXT NOT NULL,
    mint_block_number BIGINT,
    gas_fee_paid NUMERIC(20,8),
    current_price NUMERIC(20,8),
    last_sale_price NUMERIC(20,8),
    is_listed_for_sale BOOLEAN NOT NULL DEFAULT false,
    listing_price NUMERIC(20,8),
    listing_marketplace TEXT,
    total_sales INTEGER NOT NULL DEFAULT 0,
    total_volume NUMERIC(20,8) NOT NULL DEFAULT 0,
    minting_metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blockchain verifications table
CREATE TABLE IF NOT EXISTS public.blockchain_verifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_hash TEXT NOT NULL,
    contract_address TEXT,
    token_id BIGINT,
    blockchain TEXT NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT false,
    block_number BIGINT,
    block_timestamp TIMESTAMP WITH TIME ZONE,
    gas_used BIGINT,
    gas_price BIGINT,
    verification_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    owner_address TEXT,
    metadata_uri TEXT,
    verification_metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wallet connections table
CREATE TABLE IF NOT EXISTS public.wallet_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    wallet_address TEXT NOT NULL,
    wallet_type TEXT NOT NULL, -- metamask, walletconnect, etc
    blockchain TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_signature TEXT,
    verification_message TEXT,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, wallet_address, blockchain)
);

-- Smart contract interactions table
CREATE TABLE IF NOT EXISTS public.smart_contract_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    contract_address TEXT NOT NULL,
    function_name TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    transaction_fee NUMERIC(20,8),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, failed
    input_data JSONB NOT NULL DEFAULT '{}',
    output_data JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for NFT assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'nft-assets',
    'nft-assets',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mpeg', 'audio/wav']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.nft_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contract_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for nft_tokens
CREATE POLICY "Users can view NFTs for their artwork"
ON public.nft_tokens
FOR SELECT
USING (
    artwork_id IN (
        SELECT id FROM artwork WHERE user_id = auth.uid()
    )
    OR owner_wallet_address IN (
        SELECT wallet_address FROM wallet_connections WHERE user_id = auth.uid()
    )
);

CREATE POLICY "System can create NFT records"
ON public.nft_tokens
FOR INSERT
WITH CHECK (true);

CREATE POLICY "NFT owners can update their tokens"
ON public.nft_tokens
FOR UPDATE
USING (
    owner_wallet_address IN (
        SELECT wallet_address FROM wallet_connections WHERE user_id = auth.uid()
    )
);

-- RLS policies for blockchain_verifications
CREATE POLICY "Anyone can create blockchain verifications"
ON public.blockchain_verifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view blockchain verifications"
ON public.blockchain_verifications
FOR SELECT
USING (true);

-- RLS policies for wallet_connections
CREATE POLICY "Users can manage their own wallet connections"
ON public.wallet_connections
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for smart_contract_interactions
CREATE POLICY "Users can view their own contract interactions"
ON public.smart_contract_interactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create contract interactions"
ON public.smart_contract_interactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own contract interactions"
ON public.smart_contract_interactions
FOR UPDATE
USING (auth.uid() = user_id);

-- Storage policies for NFT assets
CREATE POLICY "Public access to NFT assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'nft-assets');

CREATE POLICY "Authenticated users can upload NFT assets"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'nft-assets' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own NFT assets"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'nft-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own NFT assets"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'nft-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add updated_at triggers
CREATE TRIGGER update_nft_tokens_updated_at
    BEFORE UPDATE ON public.nft_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_connections_updated_at
    BEFORE UPDATE ON public.wallet_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_contract_interactions_updated_at
    BEFORE UPDATE ON public.smart_contract_interactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_nft_tokens_artwork_id ON public.nft_tokens(artwork_id);
CREATE INDEX IF NOT EXISTS idx_nft_tokens_user_id ON public.nft_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_tokens_contract_token ON public.nft_tokens(contract_address, token_id);
CREATE INDEX IF NOT EXISTS idx_nft_tokens_owner ON public.nft_tokens(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_verifications_hash ON public.blockchain_verifications(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user ON public.wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON public.wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_contract_interactions_user ON public.smart_contract_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_interactions_hash ON public.smart_contract_interactions(transaction_hash);