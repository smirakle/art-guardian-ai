-- Ensure licenses table exists and has required columns for automated licensing with blockchain proof
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add/ensure required columns (idempotent)
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS licensor_user_id UUID;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS artwork_id UUID;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS licensee_name TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS licensee_email TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS license_type TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS usage_scope JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS territory TEXT DEFAULT 'Worldwide';
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd';
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS terms_text TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS document_hash TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS blockchain_hash TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS blockchain_certificate_id TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS payment_session_id TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Ensure defaults / constraints where safe
DO $$ BEGIN
  -- verification_code unique & default
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'licenses_verification_code_key'
  ) THEN
    ALTER TABLE public.licenses
      ALTER COLUMN verification_code SET DEFAULT (gen_random_uuid())::text;
    CREATE UNIQUE INDEX licenses_verification_code_key ON public.licenses(verification_code);
  END IF;
END $$;

-- Foreign keys (idempotent)
DO $$ BEGIN
  -- artwork FK
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_licenses_artwork'
  ) THEN
    ALTER TABLE public.licenses
      ADD CONSTRAINT fk_licenses_artwork FOREIGN KEY (artwork_id) REFERENCES public.artwork(id) ON DELETE CASCADE;
  END IF;
  -- licensor FK -> profiles.user_id (avoid direct FK to auth.users)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_licenses_licensor'
  ) THEN
    ALTER TABLE public.licenses
      ADD CONSTRAINT fk_licenses_licensor FOREIGN KEY (licensor_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user ON public.licenses(licensor_user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_artwork ON public.licenses(artwork_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- RLS: Users manage their own licenses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'licenses' AND policyname = 'Users can manage their own licenses'
  ) THEN
    CREATE POLICY "Users can manage their own licenses"
      ON public.licenses
      FOR ALL
      USING (auth.uid() = licensor_user_id)
      WITH CHECK (auth.uid() = licensor_user_id);
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_licenses_updated_at'
  ) THEN
    CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON public.licenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- License events table
CREATE TABLE IF NOT EXISTS public.license_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK for license_events
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_license_events_license'
  ) THEN
    ALTER TABLE public.license_events
      ADD CONSTRAINT fk_license_events_license FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_license_events_license ON public.license_events(license_id);

ALTER TABLE public.license_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'license_events' AND policyname = 'Users can manage events for their licenses'
  ) THEN
    CREATE POLICY "Users can manage events for their licenses"
      ON public.license_events
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.licensor_user_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.licensor_user_id = auth.uid()
      ));
  END IF;
END $$;
