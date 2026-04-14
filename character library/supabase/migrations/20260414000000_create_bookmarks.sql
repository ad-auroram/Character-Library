-- Bookmarks for Milestone 2 - Users can bookmark public characters

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, character_id)
);

-- Index for efficient bookmark lookups by user
CREATE INDEX IF NOT EXISTS bookmarks_user_created_idx
  ON public.bookmarks (user_id, created_at DESC);

-- Index for checking if a character is bookmarked
CREATE INDEX IF NOT EXISTS bookmarks_character_idx
  ON public.bookmarks (character_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create bookmarks for themselves
CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);
