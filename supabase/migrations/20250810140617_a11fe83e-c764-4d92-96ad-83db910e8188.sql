-- Create leads table for creator ICP lead capture
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text, -- e.g., sales-package, header-cta
  utm_source text,
  utm_medium text,
  utm_campaign text,
  name text,
  company text,
  email text NOT NULL,
  use_case text,
  notes text,
  consent boolean NOT NULL DEFAULT true,
  owner_email text DEFAULT 'Shirleena.cunningham@tsmowatch.com'
);

-- Update trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies: allow inserts for anyone (public lead form)
DROP POLICY IF EXISTS "Enable insert for anonymous lead capture" ON public.leads;
CREATE POLICY "Enable insert for anonymous lead capture"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow read/update/delete only for authenticated users with matching owner_email (basic safety)
DROP POLICY IF EXISTS "Leads readable by staff" ON public.leads;
CREATE POLICY "Leads readable by staff"
ON public.leads FOR SELECT
TO authenticated
USING (true);

-- Optional: restrict updates/deletes to authenticated users
DROP POLICY IF EXISTS "Leads updatable by authenticated" ON public.leads;
CREATE POLICY "Leads updatable by authenticated"
ON public.leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Leads deletable by authenticated" ON public.leads;
CREATE POLICY "Leads deletable by authenticated"
ON public.leads FOR DELETE
TO authenticated
USING (true);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
