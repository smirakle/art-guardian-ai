-- Licenses and License Events schema
-- Create licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licensor_user_id uuid NOT NULL,
  artwork_id uuid NOT NULL,
  licensee_name text,
  licensee_email text,
  license_type text NOT NULL,
  usage_scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  territory text NOT NULL DEFAULT 'Worldwide',
  start_date timestamptz,
  end_date timestamptz,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'draft',
  terms_text text NOT NULL,
  document_hash text NOT NULL,
  blockchain_hash text,
  blockchain_certificate_id text,
  stripe_session_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recommended indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user ON public.licenses (licensor_user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_artwork ON public.licenses (artwork_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses (status);

-- License events table
CREATE TABLE IF NOT EXISTS public.license_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_license_events_license FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_license_events_license ON public.license_events (license_id);
CREATE INDEX IF NOT EXISTS idx_license_events_type ON public.license_events (event_type);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public._update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_licenses_updated_at ON public.licenses;
CREATE TRIGGER trg_licenses_updated_at
BEFORE UPDATE ON public.licenses
FOR EACH ROW EXECUTE FUNCTION public._update_updated_at();

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_events ENABLE ROW LEVEL SECURITY;

-- Policies for licenses: owner can manage
DROP POLICY IF EXISTS "licenses_owner_select" ON public.licenses;
DROP POLICY IF EXISTS "licenses_owner_all" ON public.licenses;
CREATE POLICY "licenses_owner_select" ON public.licenses
  FOR SELECT USING (auth.uid() = licensor_user_id);
CREATE POLICY "licenses_owner_all" ON public.licenses
  FOR ALL USING (auth.uid() = licensor_user_id) WITH CHECK (auth.uid() = licensor_user_id);

-- Policies for license_events: owner can read, system can insert
DROP POLICY IF EXISTS "license_events_owner_select" ON public.license_events;
DROP POLICY IF EXISTS "license_events_system_insert" ON public.license_events;
CREATE POLICY "license_events_owner_select" ON public.license_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_events.license_id AND l.licensor_user_id = auth.uid()
    )
  );
CREATE POLICY "license_events_system_insert" ON public.license_events
  FOR INSERT WITH CHECK (true);

-- Optional: allow owner to insert their own events too
DROP POLICY IF EXISTS "license_events_owner_insert" ON public.license_events;
CREATE POLICY "license_events_owner_insert" ON public.license_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_events.license_id AND l.licensor_user_id = auth.uid()
    )
  );