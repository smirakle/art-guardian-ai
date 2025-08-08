-- Create custom_integrations table (if not exists)
CREATE TABLE IF NOT EXISTS public.custom_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('webhook','api','export')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','error')),
  endpoint_url TEXT,
  api_key TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_integrations ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own integrations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_integrations' AND policyname='Users can view their integrations'
  ) THEN
    CREATE POLICY "Users can view their integrations"
      ON public.custom_integrations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_integrations' AND policyname='Users can insert their integrations'
  ) THEN
    CREATE POLICY "Users can insert their integrations"
      ON public.custom_integrations FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_integrations' AND policyname='Users can update their integrations'
  ) THEN
    CREATE POLICY "Users can update their integrations"
      ON public.custom_integrations FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_integrations' AND policyname='Users can delete their integrations'
  ) THEN
    CREATE POLICY "Users can delete their integrations"
      ON public.custom_integrations FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_custom_integrations_updated_at'
  ) THEN
    CREATE TRIGGER trg_custom_integrations_updated_at
    BEFORE UPDATE ON public.custom_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create user_integrations table to store OAuth tokens
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('adobe','buffer')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  account_id TEXT,
  account_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON public.user_integrations(provider);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_integrations' AND policyname='Users can view their tokens'
  ) THEN
    CREATE POLICY "Users can view their tokens"
      ON public.user_integrations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_integrations' AND policyname='Users can insert their tokens'
  ) THEN
    CREATE POLICY "Users can insert their tokens"
      ON public.user_integrations FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_integrations' AND policyname='Users can update their tokens'
  ) THEN
    CREATE POLICY "Users can update their tokens"
      ON public.user_integrations FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_integrations' AND policyname='Users can delete their tokens'
  ) THEN
    CREATE POLICY "Users can delete their tokens"
      ON public.user_integrations FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_integrations_updated_at'
  ) THEN
    CREATE TRIGGER trg_user_integrations_updated_at
    BEFORE UPDATE ON public.user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- OAuth state table for CSRF protection during OAuth flows
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('adobe','buffer')),
  state TEXT NOT NULL UNIQUE,
  app_redirect_uri TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes')
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user ON public.oauth_states(user_id);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='oauth_states' AND policyname='Users can manage their oauth states'
  ) THEN
    CREATE POLICY "Users can manage their oauth states"
      ON public.oauth_states FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;