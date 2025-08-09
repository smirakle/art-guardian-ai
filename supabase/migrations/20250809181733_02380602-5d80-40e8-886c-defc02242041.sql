-- Fix policy syntax: FOR comes before TO
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'licenses' AND policyname = 'Users can manage their own licenses'
  ) THEN
    DROP POLICY "Users can manage their own licenses" ON public.licenses;
  END IF;
  CREATE POLICY "Users can manage their own licenses"
    ON public.licenses
    FOR ALL
    TO authenticated
    USING (auth.uid() = licensor_user_id)
    WITH CHECK (auth.uid() = licensor_user_id);
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'license_events' AND policyname = 'Users can manage events for their licenses'
  ) THEN
    DROP POLICY "Users can manage events for their licenses" ON public.license_events;
  END IF;
  CREATE POLICY "Users can manage events for their licenses"
    ON public.license_events
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.licensor_user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.licensor_user_id = auth.uid()
    ));
END $$;