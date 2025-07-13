-- Add INSERT policy for monitoring scans
CREATE POLICY "Users can create scans for their own artwork" 
ON public.monitoring_scans 
FOR INSERT 
WITH CHECK (artwork_id IN ( 
  SELECT artwork.id
  FROM artwork
  WHERE artwork.user_id = auth.uid()
));

-- Add UPDATE policy for monitoring scans (to update scan progress)
CREATE POLICY "Users can update their own scans" 
ON public.monitoring_scans 
FOR UPDATE 
USING (artwork_id IN ( 
  SELECT artwork.id
  FROM artwork
  WHERE artwork.user_id = auth.uid()
));