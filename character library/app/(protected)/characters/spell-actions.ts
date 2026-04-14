'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getDndSpellByIndex, searchDndSpells, type DndSpellSearchResult } from '@/lib/dnd/spells'

export interface CharacterSpell {
  id: string
  spell_index: string
  name: string
  level: number
  school: string | null
  casting_time: string | null
  range: string | null
  duration: string | null
  ritual: boolean
  concentration: boolean
  description: string | null
  api_url: string | null
}

interface SpellActionResult {
  success: boolean
  error?: string
  spell?: CharacterSpell
}

async function requireOwnedCharacter(characterId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('id', characterId)
    .eq('user_id', user.id)
    .single()

  if (!character) {
    throw new Error('Character not found or not editable.')
  }

  return { supabase }
}

export async function searchSpellsAction(query: string): Promise<DndSpellSearchResult[]> {
  const cleaned = query.trim()
  if (cleaned.length < 2) {
    return []
  }

  return searchDndSpells(cleaned)
}

export async function addCharacterSpellAction(characterId: string, spellIndex: string): Promise<SpellActionResult> {
  try {
    const { supabase } = await requireOwnedCharacter(characterId)
    const detail = await getDndSpellByIndex(spellIndex)

    const payload = {
      character_id: characterId,
      spell_index: detail.index,
      name: detail.name,
      level: detail.level,
      school: detail.school,
      casting_time: detail.casting_time,
      range: detail.range,
      duration: detail.duration,
      ritual: detail.ritual,
      concentration: detail.concentration,
      description: detail.desc.join('\n\n') || null,
      api_url: detail.url,
    }

    const { data, error } = await supabase
      .from('character_spells')
      .insert(payload)
      .select(
        'id, spell_index, name, level, school, casting_time, range, duration, ritual, concentration, description, api_url'
      )
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This spell is already attached to the character.' }
      }
      throw new Error(error.message)
    }

    revalidatePath(`/characters/${characterId}`)
    return {
      success: true,
      spell: data as CharacterSpell,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add spell.',
    }
  }
}

export async function removeCharacterSpellAction(characterId: string, spellIndex: string): Promise<SpellActionResult> {
  try {
    const { supabase } = await requireOwnedCharacter(characterId)

    const { error } = await supabase
      .from('character_spells')
      .delete()
      .eq('character_id', characterId)
      .eq('spell_index', spellIndex)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(`/characters/${characterId}`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove spell.',
    }
  }
}
