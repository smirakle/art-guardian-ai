-- Make artwork_id nullable to allow standalone protection records
ALTER TABLE public.ai_protection_records 
ALTER COLUMN artwork_id DROP NOT NULL;