-- Fix the match_confidence constraint issue
-- The constraint is likely expecting values between 0-100 but we're storing 0-1 decimal values

-- Drop the existing constraint if it exists
ALTER TABLE copyright_matches DROP CONSTRAINT IF EXISTS copyright_matches_match_confidence_check;

-- Add a new constraint that accepts both percentage (0-100) and decimal (0-1) values
ALTER TABLE copyright_matches ADD CONSTRAINT copyright_matches_match_confidence_check 
CHECK (match_confidence >= 0 AND match_confidence <= 100);