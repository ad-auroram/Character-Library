'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const MIN_STAT = 1
const MAX_STAT = 30
const DEFAULT_STAT = 10

function parseStat(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string') return DEFAULT_STAT
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return DEFAULT_STAT
  return Math.min(MAX_STAT, Math.max(MIN_STAT, parsed))
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>()

  return raw
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .filter((tag) => {
      if (seen.has(tag)) return false
      seen.add(tag)
      return true
    })
}

function parseImageUrls(raw: string): string[] {
  const seen = new Set<string>()

  return raw
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .filter((url) => {
      if (seen.has(url)) return false
      seen.add(url)
      return true
    })
}

async function syncTagsAndImages(characterId: string, tagsInput: string, imageUrlsInput: string) {
  const supabase = await createClient()

  const tags = parseTags(tagsInput)
  const imageUrls = parseImageUrls(imageUrlsInput)

  await supabase.from('character_tags').delete().eq('character_id', characterId)
  await supabase.from('character_images').delete().eq('character_id', characterId)

  if (tags.length > 0) {
    const { data: existingTags } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tags)

    const existingMap = new Map<string, number>()
    for (const tag of existingTags ?? []) {
      existingMap.set(tag.name.toLowerCase(), tag.id)
    }

    const missingTags = tags.filter((name) => !existingMap.has(name))

    if (missingTags.length > 0) {
      const { data: insertedTags } = await supabase
        .from('tags')
        .insert(missingTags.map((name) => ({ name })))
        .select('id, name')

      for (const tag of insertedTags ?? []) {
        existingMap.set(tag.name.toLowerCase(), tag.id)
      }
    }

    const tagLinks = tags
      .map((name) => existingMap.get(name))
      .filter((id): id is number => typeof id === 'number')
      .map((tagId) => ({ character_id: characterId, tag_id: tagId }))

    if (tagLinks.length > 0) {
      await supabase.from('character_tags').insert(tagLinks)
    }
  }

  if (imageUrls.length > 0) {
    await supabase.from('character_images').insert(
      imageUrls.map((imageUrl, index) => ({
        character_id: characterId,
        image_url: imageUrl,
        sort_order: index,
      }))
    )
  }
}

function ensureName(name: string) {
  if (name.trim().length === 0) {
    throw new Error('Character name is required.')
  }
}

export async function createCharacterAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const name = String(formData.get('name') ?? '').trim()
  ensureName(name)

  const role = String(formData.get('role') ?? '').trim()
  const summary = String(formData.get('summary') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()
  const tagsInput = String(formData.get('tags') ?? '')
  const imageUrlsInput = String(formData.get('image_urls') ?? '')

  const payload = {
    user_id: user.id,
    name,
    role: role || null,
    summary: summary || null,
    notes: notes || null,
    is_public: formData.get('is_public') === 'on',
    strength: parseStat(formData.get('strength')),
    dexterity: parseStat(formData.get('dexterity')),
    constitution: parseStat(formData.get('constitution')),
    intelligence: parseStat(formData.get('intelligence')),
    wisdom: parseStat(formData.get('wisdom')),
    charisma: parseStat(formData.get('charisma')),
  }

  const { data: insertedCharacter, error } = await supabase
    .from('characters')
    .insert(payload)
    .select('id')
    .single()

  if (error || !insertedCharacter) {
    throw new Error(error?.message ?? 'Failed to create character.')
  }

  await syncTagsAndImages(insertedCharacter.id, tagsInput, imageUrlsInput)

  revalidatePath('/characters')
  revalidatePath('/dashboard')
  redirect(`/characters/${insertedCharacter.id}`)
}

export async function updateCharacterAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const characterId = String(formData.get('character_id') ?? '')
  if (!characterId) {
    throw new Error('Character id is required.')
  }

  const name = String(formData.get('name') ?? '').trim()
  ensureName(name)

  const role = String(formData.get('role') ?? '').trim()
  const summary = String(formData.get('summary') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()
  const tagsInput = String(formData.get('tags') ?? '')
  const imageUrlsInput = String(formData.get('image_urls') ?? '')

  const { data: existingCharacter } = await supabase
    .from('characters')
    .select('id')
    .eq('id', characterId)
    .eq('user_id', user.id)
    .single()

  if (!existingCharacter) {
    throw new Error('Character not found or not editable.')
  }

  const { error } = await supabase
    .from('characters')
    .update({
      name,
      role: role || null,
      summary: summary || null,
      notes: notes || null,
      is_public: formData.get('is_public') === 'on',
      strength: parseStat(formData.get('strength')),
      dexterity: parseStat(formData.get('dexterity')),
      constitution: parseStat(formData.get('constitution')),
      intelligence: parseStat(formData.get('intelligence')),
      wisdom: parseStat(formData.get('wisdom')),
      charisma: parseStat(formData.get('charisma')),
    })
    .eq('id', characterId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  await syncTagsAndImages(characterId, tagsInput, imageUrlsInput)

  revalidatePath('/characters')
  revalidatePath(`/characters/${characterId}`)
  redirect(`/characters/${characterId}`)
}

export async function deleteCharacterAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const characterId = String(formData.get('character_id') ?? '')
  if (!characterId) {
    throw new Error('Character id is required.')
  }

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/characters')
  revalidatePath('/dashboard')
  redirect('/characters')
}
