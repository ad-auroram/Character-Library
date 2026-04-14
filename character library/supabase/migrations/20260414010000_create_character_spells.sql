-- Character spells for Milestone 3 - attached from D&D 5e API

CREATE TABLE IF NOT EXISTS public.character_spells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  spell_index TEXT NOT NULL,
  name TEXT NOT NULL,
  level SMALLINT NOT NULL DEFAULT 0,
  school TEXT,
  casting_time TEXT,
  range TEXT,
  duration TEXT,
  ritual BOOLEAN NOT NULL DEFAULT FALSE,
  concentration BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  api_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (character_id, spell_index)
);

CREATE INDEX IF NOT EXISTS character_spells_character_created_idx
  ON public.character_spells (character_id, created_at DESC);

CREATE INDEX IF NOT EXISTS character_spells_spell_index_idx
  ON public.character_spells (spell_index);

ALTER TABLE public.character_spells ENABLE ROW LEVEL SECURITY;

-- Anyone can view spells for visible characters
CREATE POLICY "Users can view spells for visible characters"
  ON public.character_spells
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_spells.character_id
        AND (c.is_public OR c.user_id = auth.uid())
    )
  );

-- Only owners can attach spells to their own characters
CREATE POLICY "Users can create spells for own characters"
  ON public.character_spells
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_spells.character_id
        AND c.user_id = auth.uid()
    )
  );

-- Only owners can edit/remove attached spells
CREATE POLICY "Users can update spells for own characters"
  ON public.character_spells
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_spells.character_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_spells.character_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete spells for own characters"
  ON public.character_spells
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_spells.character_id
        AND c.user_id = auth.uid()
    )
  );
