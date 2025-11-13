-- Add INSERT policy for document_plagiarism_matches
CREATE POLICY "Users can insert their own plagiarism matches"
ON document_plagiarism_matches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy for document_scan_updates
CREATE POLICY "Users can insert their own scan updates"
ON document_scan_updates
FOR INSERT
WITH CHECK (auth.uid() = user_id);