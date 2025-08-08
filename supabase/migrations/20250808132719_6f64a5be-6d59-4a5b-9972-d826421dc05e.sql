-- Tighten RLS to authenticated role for newly added tables

-- custom_integrations policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_integrations') THEN
    DROP POLICY IF EXISTS "Users can view their integrations" ON public.custom_integrations;
    DROP POLICY IF EXISTS "Users can insert their integrations" ON public.custom_integrations;
    DROP POLICY IF EXISTS "Users can update their integrations" ON public.custom_integrations;
    DROP POLICY IF EXISTS "Users can delete their integrations" ON public.custom_integrations;
  END IF;
END $$;

CREATE POLICY "Users can view their integrations"
  ON public.custom_integrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their integrations"
  ON public.custom_integrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their integrations"
  ON public.custom_integrations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their integrations"
  ON public.custom_integrations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- user_integrations policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_integrations') THEN
    DROP POLICY IF EXISTS "Users can view their tokens" ON public.user_integrations;
    DROP POLICY IF EXISTS "Users can insert their tokens" ON public.user_integrations;
    DROP POLICY IF EXISTS "Users can update their tokens" ON public.user_integrations;
    DROP POLICY IF EXISTS "Users can delete their tokens" ON public.user_integrations;
  END IF;
END $$;

CREATE POLICY "Users can view their tokens"
  ON public.user_integrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their tokens"
  ON public.user_integrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their tokens"
  ON public.user_integrations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their tokens"
  ON public.user_integrations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- oauth_states policies (split by command, authenticated only)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='oauth_states') THEN
    DROP POLICY IF EXISTS "Users can manage their oauth states" ON public.oauth_states;
  END IF;
END $$;

CREATE POLICY "Users can insert oauth states"
  ON public.oauth_states FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their oauth states"
  ON public.oauth_states FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their oauth states"
  ON public.oauth_states FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their oauth states"
  ON public.oauth_states FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
