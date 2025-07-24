-- Add the missing match types to the constraint
ALTER TABLE copyright_matches DROP CONSTRAINT IF EXISTS copyright_matches_match_type_check;

ALTER TABLE copyright_matches ADD CONSTRAINT copyright_matches_match_type_check 
CHECK (match_type = ANY (ARRAY['exact'::text, 'similar'::text, 'modified'::text, 'partial'::text, 'deepfake_manipulation'::text, 'dark_web_infringement'::text, 'face_swap'::text, 'voice_synthesis'::text]));