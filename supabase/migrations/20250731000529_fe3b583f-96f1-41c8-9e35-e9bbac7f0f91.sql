-- Update RLS policy for ai_protection_records to allow standalone protection records
DROP POLICY IF EXISTS "Users can create protection records for their artwork" ON public.ai_protection_records;

-- Create a more flexible policy that allows users to create protection records 
-- either for their artwork OR for standalone files (when artwork_id is null)
CREATE POLICY "Users can create their own protection records" 
ON public.ai_protection_records 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    artwork_id IS NULL OR 
    artwork_id IN (
      SELECT id FROM artwork WHERE user_id = auth.uid()
    )
  )
);