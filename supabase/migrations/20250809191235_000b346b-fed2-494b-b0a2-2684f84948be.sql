-- Tighten insert policy for license_events to authenticated users only
DROP POLICY IF EXISTS "license_events_system_insert" ON public.license_events;
CREATE POLICY "license_events_system_insert" ON public.license_events
  FOR INSERT TO authenticated
  WITH CHECK (true);
