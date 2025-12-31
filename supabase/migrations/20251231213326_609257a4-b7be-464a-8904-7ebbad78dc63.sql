-- Batch 3: Clean up RLS policies for existing tables only
-- Tables: document_ai_analysis, document_monitoring_sessions, document_plagiarism_matches, 
-- document_protection_jobs, document_scan_updates, document_takedown_notices, document_version_comparisons

-- document_ai_analysis
DROP POLICY IF EXISTS "Authenticated users can view their session analysis" ON public.document_ai_analysis;
DROP POLICY IF EXISTS "Users can view their analysis" ON public.document_ai_analysis;
DROP POLICY IF EXISTS "Users can insert their analysis" ON public.document_ai_analysis;
CREATE POLICY "Users can view their session analysis" ON public.document_ai_analysis FOR SELECT TO authenticated USING (
  session_id IN (SELECT id FROM public.document_monitoring_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert analysis for their sessions" ON public.document_ai_analysis FOR INSERT TO authenticated WITH CHECK (
  session_id IN (SELECT id FROM public.document_monitoring_sessions WHERE user_id = auth.uid())
);

-- document_monitoring_sessions
DROP POLICY IF EXISTS "Authenticated users can view their monitoring sessions" ON public.document_monitoring_sessions;
DROP POLICY IF EXISTS "Users can view their monitoring sessions" ON public.document_monitoring_sessions;
DROP POLICY IF EXISTS "Users can create their monitoring sessions" ON public.document_monitoring_sessions;
DROP POLICY IF EXISTS "Users can update their monitoring sessions" ON public.document_monitoring_sessions;
DROP POLICY IF EXISTS "Users can delete their monitoring sessions" ON public.document_monitoring_sessions;
CREATE POLICY "Users can view own monitoring sessions" ON public.document_monitoring_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own monitoring sessions" ON public.document_monitoring_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monitoring sessions" ON public.document_monitoring_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own monitoring sessions" ON public.document_monitoring_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- document_plagiarism_matches
DROP POLICY IF EXISTS "Authenticated users can view their plagiarism matches" ON public.document_plagiarism_matches;
DROP POLICY IF EXISTS "Users can view their plagiarism matches" ON public.document_plagiarism_matches;
DROP POLICY IF EXISTS "Users can insert their plagiarism matches" ON public.document_plagiarism_matches;
CREATE POLICY "Users can view own plagiarism matches" ON public.document_plagiarism_matches FOR SELECT TO authenticated USING (
  session_id IN (SELECT id FROM public.document_monitoring_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own plagiarism matches" ON public.document_plagiarism_matches FOR INSERT TO authenticated WITH CHECK (
  session_id IN (SELECT id FROM public.document_monitoring_sessions WHERE user_id = auth.uid())
);

-- document_protection_jobs
DROP POLICY IF EXISTS "Users can view own protection jobs" ON public.document_protection_jobs;
DROP POLICY IF EXISTS "Users can create own protection jobs" ON public.document_protection_jobs;
DROP POLICY IF EXISTS "Users can update own protection jobs" ON public.document_protection_jobs;
CREATE POLICY "Users can view own protection jobs" ON public.document_protection_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own protection jobs" ON public.document_protection_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own protection jobs" ON public.document_protection_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- document_scan_updates
DROP POLICY IF EXISTS "Users can view own scan updates" ON public.document_scan_updates;
DROP POLICY IF EXISTS "Users can create own scan updates" ON public.document_scan_updates;
CREATE POLICY "Users can view own scan updates" ON public.document_scan_updates FOR SELECT TO authenticated USING (
  session_id IN (SELECT id FROM public.document_monitoring_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own scan updates" ON public.document_scan_updates FOR INSERT TO authenticated WITH CHECK (
  session_id IN (SELECT id FROM public.document_monitoring_sessions WHERE user_id = auth.uid())
);

-- document_takedown_notices
DROP POLICY IF EXISTS "Users can view own takedown notices" ON public.document_takedown_notices;
DROP POLICY IF EXISTS "Users can create own takedown notices" ON public.document_takedown_notices;
DROP POLICY IF EXISTS "Users can update own takedown notices" ON public.document_takedown_notices;
CREATE POLICY "Users can view own takedown notices" ON public.document_takedown_notices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own takedown notices" ON public.document_takedown_notices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own takedown notices" ON public.document_takedown_notices FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- document_version_comparisons
DROP POLICY IF EXISTS "Users can view own version comparisons" ON public.document_version_comparisons;
DROP POLICY IF EXISTS "Users can create own version comparisons" ON public.document_version_comparisons;
CREATE POLICY "Users can view own version comparisons" ON public.document_version_comparisons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own version comparisons" ON public.document_version_comparisons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);