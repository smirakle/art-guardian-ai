
-- 1) Blockchain Ownership Registry (core record for on-chain registrations)
CREATE TABLE IF NOT EXISTS public.blockchain_ownership_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_address text NOT NULL,
  artwork_id uuid,
  title text,
  description text,
  fingerprint text NOT NULL,
  blockchain text NOT NULL,
  chain_id integer NOT NULL,
  transaction_hash text,
  block_number bigint,
  contract_address text,
  metadata_uri text,
  proof_hash text,
  status text NOT NULL DEFAULT 'pending', -- pending | confirmed | failed | revoked
  registered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, fingerprint, blockchain, chain_id)
);

CREATE INDEX IF NOT EXISTS idx_bor_user ON public.blockchain_ownership_registry (user_id);
CREATE INDEX IF NOT EXISTS idx_bor_owner_address ON public.blockchain_ownership_registry (owner_address);
CREATE INDEX IF NOT EXISTS idx_bor_tx ON public.blockchain_ownership_registry (transaction_hash);
CREATE INDEX IF NOT EXISTS idx_bor_artwork ON public.blockchain_ownership_registry (artwork_id);

DROP TRIGGER IF EXISTS trg_bor_updated_at ON public.blockchain_ownership_registry;
CREATE TRIGGER trg_bor_updated_at
BEFORE UPDATE ON public.blockchain_ownership_registry
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.blockchain_ownership_registry ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blockchain_ownership_registry' AND policyname='Users can manage their own registry'
  ) THEN
    CREATE POLICY "Users can manage their own registry"
    ON public.blockchain_ownership_registry
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blockchain_ownership_registry' AND policyname='Admins can view all registry'
  ) THEN
    CREATE POLICY "Admins can view all registry"
    ON public.blockchain_ownership_registry
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;


-- 2) Blockchain Certificates (issued after successful registration)
CREATE TABLE IF NOT EXISTS public.blockchain_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registration_id uuid NOT NULL REFERENCES public.blockchain_ownership_registry(id) ON DELETE CASCADE,
  certificate_number text NOT NULL,
  certificate_url text,
  certificate_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  network text,
  transaction_hash text,
  ipfs_hash text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active', -- active | revoked | superseded
  UNIQUE (certificate_number)
);

CREATE INDEX IF NOT EXISTS idx_bc_user ON public.blockchain_certificates (user_id);
CREATE INDEX IF NOT EXISTS idx_bc_registration ON public.blockchain_certificates (registration_id);
CREATE INDEX IF NOT EXISTS idx_bc_tx ON public.blockchain_certificates (transaction_hash);

DROP TRIGGER IF EXISTS trg_bc_updated_at ON public.blockchain_certificates;
CREATE TRIGGER trg_bc_updated_at
BEFORE UPDATE ON public.blockchain_certificates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.blockchain_certificates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blockchain_certificates' AND policyname='Users can manage their own certificates'
  ) THEN
    CREATE POLICY "Users can manage their own certificates"
    ON public.blockchain_certificates
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blockchain_certificates' AND policyname='Admins can view all certificates'
  ) THEN
    CREATE POLICY "Admins can view all certificates"
    ON public.blockchain_certificates
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;


-- 3) Blockchain Licenses (contract-based licensing tied to a registration)
CREATE TABLE IF NOT EXISTS public.blockchain_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registration_id uuid NOT NULL REFERENCES public.blockchain_ownership_registry(id) ON DELETE CASCADE,
  license_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  royalty_percentage numeric,
  licensee text,
  license_start date,
  license_end date,
  license_status text NOT NULL DEFAULT 'active', -- active | expired | revoked
  contract_address text,
  transaction_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bl_user ON public.blockchain_licenses (user_id);
CREATE INDEX IF NOT EXISTS idx_bl_registration ON public.blockchain_licenses (registration_id);
CREATE INDEX IF NOT EXISTS idx_bl_status ON public.blockchain_licenses (license_status);

DROP TRIGGER IF EXISTS trg_bl_updated_at ON public.blockchain_licenses;
CREATE TRIGGER trg_bl_updated_at
BEFORE UPDATE ON public.blockchain_licenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.blockchain_licenses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blockchain_licenses' AND policyname='Users can manage their own licenses'
  ) THEN
    CREATE POLICY "Users can manage their own licenses"
    ON public.blockchain_licenses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blockchain_licenses' AND policyname='Admins can view all licenses'
  ) THEN
    CREATE POLICY "Admins can view all licenses"
    ON public.blockchain_licenses
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;


-- 4) Legal Documents (Global Legal Network - generated templates, filings, etc.)
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  related_type text,  -- e.g., 'registration', 'license', 'case', 'artwork'
  related_id uuid,
  title text NOT NULL,
  document_type text NOT NULL,  -- e.g., 'ownership_declaration', 'dmca_notice', 'copyright_registration'
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  document_url text,
  status text NOT NULL DEFAULT 'draft', -- draft | filed | sent | archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ld_user ON public.legal_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_ld_related ON public.legal_documents (related_type, related_id);

DROP TRIGGER IF EXISTS trg_ld_updated_at ON public.legal_documents;
CREATE TRIGGER trg_ld_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='legal_documents' AND policyname='Users can manage their own legal documents'
  ) THEN
    CREATE POLICY "Users can manage their own legal documents"
    ON public.legal_documents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='legal_documents' AND policyname='Admins can view all legal documents'
  ) THEN
    CREATE POLICY "Admins can view all legal documents"
    ON public.legal_documents
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;


-- 5) Legal Actions (case tracking from 'initiate_legal_action')
CREATE TABLE IF NOT EXISTS public.legal_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  jurisdiction text NOT NULL,
  case_type text NOT NULL,
  professional_id uuid REFERENCES public.legal_professionals(id),
  status text NOT NULL DEFAULT 'initiated', -- initiated | in_progress | resolved | dismissed
  case_reference text,
  estimated_timeline text,
  estimated_cost text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_la_user ON public.legal_actions (user_id);
CREATE INDEX IF NOT EXISTS idx_la_status ON public.legal_actions (status);
CREATE INDEX IF NOT EXISTS idx_la_professional ON public.legal_actions (professional_id);

DROP TRIGGER IF EXISTS trg_la_updated_at ON public.legal_actions;
CREATE TRIGGER trg_la_updated_at
BEFORE UPDATE ON public.legal_actions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.legal_actions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='legal_actions' AND policyname='Users can manage their own legal actions'
  ) THEN
    CREATE POLICY "Users can manage their own legal actions"
    ON public.legal_actions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='legal_actions' AND policyname='Admins can view all legal actions'
  ) THEN
    CREATE POLICY "Admins can view all legal actions"
    ON public.legal_actions
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;


-- 6) Creator Profiles (public-facing creator directory; one profile per user)
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  bio text,
  website text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  revenue_split_percent numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_user ON public.creator_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_cp_active ON public.creator_profiles (is_active);

DROP TRIGGER IF EXISTS trg_cp_updated_at ON public.creator_profiles;
CREATE TRIGGER trg_cp_updated_at
BEFORE UPDATE ON public.creator_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='creator_profiles' AND policyname='Users can manage their own creator profile'
  ) THEN
    CREATE POLICY "Users can manage their own creator profile"
    ON public.creator_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Public can view only active profiles (for discovery/marketplace)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='creator_profiles' AND policyname='Anyone can view active creator profiles'
  ) THEN
    CREATE POLICY "Anyone can view active creator profiles"
    ON public.creator_profiles
    FOR SELECT
    USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='creator_profiles' AND policyname='Admins can view all creator profiles'
  ) THEN
    CREATE POLICY "Admins can view all creator profiles"
    ON public.creator_profiles
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;
