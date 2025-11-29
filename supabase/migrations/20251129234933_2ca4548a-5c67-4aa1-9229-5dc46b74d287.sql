-- Add feature_type column to trademark_waitlist to support multiple features
ALTER TABLE public.trademark_waitlist 
ADD COLUMN feature_type TEXT DEFAULT 'trademark' CHECK (feature_type IN ('trademark', 'profile', 'deepfake', 'forgery'));

-- Update existing records to have feature_type
UPDATE public.trademark_waitlist 
SET feature_type = 'trademark' 
WHERE feature_type IS NULL;

-- Make feature_type NOT NULL after setting defaults
ALTER TABLE public.trademark_waitlist 
ALTER COLUMN feature_type SET NOT NULL;

-- Add index for feature_type
CREATE INDEX idx_trademark_waitlist_feature_type ON public.trademark_waitlist(feature_type);

-- Update table comment
COMMENT ON TABLE public.trademark_waitlist IS 'Waitlist for upcoming monitoring features including trademark, profile, deepfake, and forgery detection';