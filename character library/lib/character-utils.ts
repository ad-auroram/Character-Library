'use client';

import { useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

/**
 * Load first character image for each character ID.
 * Returns a map of character ID to image URL.
 */
export async function loadCharacterAvatars(
  characterIds: string[]
): Promise<Map<string, string>> {
  if (characterIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabaseClient();
  const { data: imageRows } = await supabase
    .from('character_images')
    .select('character_id, image_url')
    .in('character_id', characterIds)
    .order('sort_order', { ascending: true });

  const map = new Map<string, string>();
  for (const row of imageRows ?? []) {
    if (!map.has(row.character_id)) {
      map.set(row.character_id, row.image_url);
    }
  }
  return map;
}
