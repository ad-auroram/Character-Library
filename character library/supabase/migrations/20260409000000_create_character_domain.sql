-- Character domain tables for Milestone 1

-- Characters belong to a single auth user and can be public or private.
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  summary TEXT,
  notes TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  strength SMALLINT NOT NULL DEFAULT 10 CHECK (strength BETWEEN 1 AND 30),
  dexterity SMALLINT NOT NULL DEFAULT 10 CHECK (dexterity BETWEEN 1 AND 30),
  constitution SMALLINT NOT NULL DEFAULT 10 CHECK (constitution BETWEEN 1 AND 30),
  intelligence SMALLINT NOT NULL DEFAULT 10 CHECK (intelligence BETWEEN 1 AND 30),
  wisdom SMALLINT NOT NULL DEFAULT 10 CHECK (wisdom BETWEEN 1 AND 30),
  charisma SMALLINT NOT NULL DEFAULT 10 CHECK (charisma BETWEEN 1 AND 30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_tags (
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (character_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.character_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for list, visibility, and relationship queries.
CREATE INDEX IF NOT EXISTS characters_user_updated_idx
  ON public.characters (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS characters_visibility_updated_idx
  ON public.characters (is_public, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS tags_name_lower_unique_idx
  ON public.tags (lower(name));

CREATE INDEX IF NOT EXISTS character_tags_tag_id_idx
  ON public.character_tags (tag_id);

CREATE INDEX IF NOT EXISTS character_images_character_sort_idx
  ON public.character_images (character_id, sort_order);

-- Use existing shared trigger function for updated_at.
CREATE TRIGGER set_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_images ENABLE ROW LEVEL SECURITY;

-- Characters: owners can CRUD; public records are readable by everyone.
CREATE POLICY "Anyone can view public or own characters"
  ON public.characters
  FOR SELECT
  USING (is_public OR auth.uid() = user_id);

CREATE POLICY "Users can insert own characters"
  ON public.characters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON public.characters
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON public.characters
  FOR DELETE
  USING (auth.uid() = user_id);

-- Tags are shared vocabulary; authenticated users can read/create tags.
CREATE POLICY "Authenticated users can read tags"
  ON public.tags
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Character tag links follow character ownership/visibility.
CREATE POLICY "Users can view tags for visible characters"
  ON public.character_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_tags.character_id
        AND (c.is_public OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create tags for own characters"
  ON public.character_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_tags.character_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags for own characters"
  ON public.character_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_tags.character_id
        AND c.user_id = auth.uid()
    )
  );

-- Character images follow character ownership/visibility.
CREATE POLICY "Users can view images for visible characters"
  ON public.character_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_images.character_id
        AND (c.is_public OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create images for own characters"
  ON public.character_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_images.character_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for own characters"
  ON public.character_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_images.character_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_images.character_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for own characters"
  ON public.character_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = character_images.character_id
        AND c.user_id = auth.uid()
    )
  );
