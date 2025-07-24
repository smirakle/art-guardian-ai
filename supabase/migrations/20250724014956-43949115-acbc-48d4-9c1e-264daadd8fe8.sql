-- Fix the monitoring_alerts constraint and update the create-monitoring-alert function logic
ALTER TABLE monitoring_alerts DROP CONSTRAINT IF EXISTS monitoring_alerts_alert_type_check;

-- Add more comprehensive alert types
ALTER TABLE monitoring_alerts ADD CONSTRAINT monitoring_alerts_alert_type_check 
CHECK (alert_type = ANY (ARRAY['new_match'::text, 'high_threat'::text, 'unauthorized_use'::text, 'copyright_match'::text, 'deepfake_detected'::text, 'dark_web_match'::text, 'high_confidence_match'::text]));