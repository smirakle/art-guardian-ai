
-- Fix social_media_scans: replace overly broad ALL policy with specific per-operation policies
DROP POLICY IF EXISTS "Users can view their social media scans" ON public.social_media_scans;

CREATE POLICY "Users can select their social media scans"
ON public.social_media_scans
FOR SELECT
TO authenticated
USING (account_id IN (
  SELECT id FROM public.social_media_accounts WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their social media scans"
ON public.social_media_scans
FOR INSERT
TO authenticated
WITH CHECK (account_id IN (
  SELECT id FROM public.social_media_accounts WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their social media scans"
ON public.social_media_scans
FOR UPDATE
TO authenticated
USING (account_id IN (
  SELECT id FROM public.social_media_accounts WHERE user_id = auth.uid()
));

-- Fix social_media_monitoring_results: add INSERT policy
CREATE POLICY "Users can insert their social media monitoring results"
ON public.social_media_monitoring_results
FOR INSERT
TO authenticated
WITH CHECK (account_id IN (
  SELECT id FROM public.social_media_accounts WHERE user_id = auth.uid()
));
