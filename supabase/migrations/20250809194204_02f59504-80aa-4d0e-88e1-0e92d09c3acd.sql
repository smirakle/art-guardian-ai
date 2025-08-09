-- AI Document Protection: schema updates

-- Safely extend ai_protection_records for document support
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'ai_protection_records'
  ) THEN
    -- content_type (image | document | video | audio)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'content_type'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN content_type text NOT NULL DEFAULT ''image''';
    END IF;

    -- original_mime_type
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'original_mime_type'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN original_mime_type text';
    END IF;

    -- file_extension
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'file_extension'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN file_extension text';
    END IF;

    -- document-specific metadata
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'document_methods'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN document_methods jsonb NOT NULL DEFAULT ''[]''::jsonb';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'doc_tracer_checksum'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN doc_tracer_checksum text';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'word_count'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN word_count integer NOT NULL DEFAULT 0';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'char_count'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN char_count integer NOT NULL DEFAULT 0';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'language'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN language text';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ai_protection_records' AND column_name = 'text_fingerprint'
    ) THEN
      EXECUTE 'ALTER TABLE public.ai_protection_records ADD COLUMN text_fingerprint text';
    END IF;
  END IF;
END $$;

-- New table to store document tracers/watermarks
CREATE TABLE IF NOT EXISTS public.ai_document_tracers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  protection_record_id uuid NOT NULL,
  tracer_type text NOT NULL,            -- zero_width, synonym_map, metadata, checksum, semantic_noise
  tracer_payload text NOT NULL,         -- the embedded string or serialized payload
  checksum text,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_ai_doc_tracers_user ON public.ai_document_tracers (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_doc_tracers_protection ON public.ai_document_tracers (protection_record_id);
CREATE INDEX IF NOT EXISTS idx_ai_doc_tracers_type ON public.ai_document_tracers (tracer_type);

-- Updated at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ai_document_tracers_updated_at'
  ) THEN
    EXECUTE 'CREATE TRIGGER trg_ai_document_tracers_updated_at
      BEFORE UPDATE ON public.ai_document_tracers
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.ai_document_tracers ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  -- Allow system inserts (edge functions with service role)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_tracers' AND policyname = 'System can insert document tracers'
  ) THEN
    EXECUTE 'CREATE POLICY "System can insert document tracers" ON public.ai_document_tracers FOR INSERT WITH CHECK (true)';
  END IF;

  -- Users can view their own tracers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_tracers' AND policyname = 'Users can view their own document tracers'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own document tracers" ON public.ai_document_tracers FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  -- Users can update their own tracers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_tracers' AND policyname = 'Users can update their own document tracers'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own document tracers" ON public.ai_document_tracers FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  -- Users can delete their own tracers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_tracers' AND policyname = 'Users can delete their own document tracers'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own document tracers" ON public.ai_document_tracers FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;
