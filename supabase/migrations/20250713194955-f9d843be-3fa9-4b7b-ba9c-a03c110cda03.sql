-- Fix the scan_type constraint issue
-- First check what constraint exists and drop it if needed
DO $$ 
BEGIN
    -- Check if constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'monitoring_scans_scan_type_check'
    ) THEN
        ALTER TABLE public.monitoring_scans 
        DROP CONSTRAINT monitoring_scans_scan_type_check;
    END IF;
END $$;

-- Add a proper check constraint for scan_type
ALTER TABLE public.monitoring_scans 
ADD CONSTRAINT monitoring_scans_scan_type_check 
CHECK (scan_type IN ('quick', 'deep', 'scheduled', 'manual', 'visual-recognition'));

-- Add INSERT policy for copyright_matches so scans can create matches
CREATE POLICY "Users can create matches for their own scans" 
ON public.copyright_matches 
FOR INSERT 
WITH CHECK (artwork_id IN ( 
  SELECT artwork.id
  FROM artwork
  WHERE artwork.user_id = auth.uid()
));