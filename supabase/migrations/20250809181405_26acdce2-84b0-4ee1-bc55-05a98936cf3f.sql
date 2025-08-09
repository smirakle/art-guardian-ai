-- Create licenses table for automated licensing with blockchain proof
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licensor_user_id UUID NOT NULL,
  artwork_id UUID NOT NULL,
  licensee_name TEXT,
  licensee_email TEXT,
  license_type TEXT NOT NULL,
  usage_scope JSONB NOT NULL DEFAULT '{}',
  territory TEXT DEFAULT 'Worldwide',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_payment, active, revoked, expired
  terms_text TEXT NOT NULL,
  document_url TEXT,
  document_hash TEXT NOT NULL,
  blockchain_hash TEXT,
  blockchain_certificate_id TEXT,
  verification_code TEXT UNIQUE NOT NULL DEFAULT (gen_random_uuid())::text,
  payment_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_licenses_artwork FOREIGN KEY (artwork_id) REFERENCES public.artwork(id) ON DELETE CASCADE,
  CONSTRAINT fk_licenses_user FOREIGN KEY (licensor_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user ON public.licenses(licensor_user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_artwork ON public.licenses(artwork_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users manage their own licenses
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

-- Trigger to auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_licenses_updated_at'
  ) THEN
    CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON public.licenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- License events table for auditability
CREATE TABLE IF NOT EXISTS public.license_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL, -- created, terms_updated, sent, payment_pending, activated, revoked, expired, blockchain_registered
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_license_events_license ON public.license_events(license_id);

ALTER TABLE public.license_events ENABLE ROW LEVEL SECURITY;

-- Policies for license_events: owner can manage events on their licenses
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