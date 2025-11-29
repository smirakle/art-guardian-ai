-- Create guest uploads table for anonymous users
CREATE TABLE IF NOT EXISTS public.guest_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  protection_level TEXT DEFAULT 'standard',
  protection_id TEXT NOT NULL,
  fingerprint TEXT,
  word_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  converted_to_user_id UUID,
  converted_at TIMESTAMPTZ
);

-- Enable RLS on guest_uploads
ALTER TABLE public.guest_uploads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert guest uploads (anonymous)
CREATE POLICY "Anyone can create guest uploads"
ON public.guest_uploads
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view their own guest uploads by session_id
CREATE POLICY "Users can view their own guest uploads"
ON public.guest_uploads
FOR SELECT
USING (true);

-- Allow authenticated users to update guest uploads they're claiming
CREATE POLICY "Users can claim guest uploads"
ON public.guest_uploads
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_guest_uploads_session_id ON public.guest_uploads(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_uploads_expires_at ON public.guest_uploads(expires_at);

-- Function to clean up expired guest uploads (called by cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_uploads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.guest_uploads
  WHERE expires_at < now() AND converted_to_user_id IS NULL;
END;
$$;

-- Function to convert guest uploads to user account
CREATE OR REPLACE FUNCTION public.convert_guest_uploads_to_user(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uploads_count INTEGER;
BEGIN
  -- Insert guest uploads into ai_protection_records
  INSERT INTO public.ai_protection_records (
    user_id,
    original_filename,
    protected_file_path,
    file_fingerprint,
    protection_id,
    protection_level,
    word_count,
    char_count,
    content_type,
    protection_methods,
    document_methods,
    metadata
  )
  SELECT
    p_user_id,
    gu.file_name,
    gu.file_path,
    COALESCE(gu.fingerprint, 'guest_' || gu.id::text),
    gu.protection_id,
    gu.protection_level,
    gu.word_count,
    gu.char_count,
    gu.content_type,
    jsonb_build_object('guest_upload', true),
    jsonb_build_object('guest_upload', true),
    jsonb_build_object('original_session', gu.session_id, 'converted_at', now())
  FROM public.guest_uploads gu
  WHERE gu.session_id = p_session_id
    AND gu.converted_to_user_id IS NULL;
  
  GET DIAGNOSTICS uploads_count = ROW_COUNT;
  
  -- Mark guest uploads as converted
  UPDATE public.guest_uploads
  SET converted_to_user_id = p_user_id,
      converted_at = now()
  WHERE session_id = p_session_id
    AND converted_to_user_id IS NULL;
  
  RETURN uploads_count;
END;
$$;