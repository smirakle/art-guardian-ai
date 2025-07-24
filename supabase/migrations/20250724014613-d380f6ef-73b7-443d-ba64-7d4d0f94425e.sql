-- Add missing scan types to the constraint
ALTER TABLE monitoring_scans DROP CONSTRAINT IF EXISTS monitoring_scans_scan_type_check;

ALTER TABLE monitoring_scans ADD CONSTRAINT monitoring_scans_scan_type_check 
CHECK (scan_type = ANY (ARRAY['quick'::text, 'deep'::text, 'scheduled'::text, 'manual'::text, 'visual-recognition'::text, 'comprehensive'::text, 'realtime'::text, 'test'::text]));