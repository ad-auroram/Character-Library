-- Character PDF export jobs for Milestone 5

CREATE TABLE IF NOT EXISTS public.character_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  storage_path TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS character_exports_user_created_idx
  ON public.character_exports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS character_exports_character_created_idx
  ON public.character_exports (character_id, created_at DESC);

CREATE INDEX IF NOT EXISTS character_exports_status_idx
  ON public.character_exports (status);

CREATE TRIGGER set_character_exports_updated_at
  BEFORE UPDATE ON public.character_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.character_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own character exports"
  ON public.character_exports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own character exports"
  ON public.character_exports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own character exports"
  ON public.character_exports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Bucket for generated PDFs. Keep private; download is via signed URL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'character-exports',
  'character-exports',
  false,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
