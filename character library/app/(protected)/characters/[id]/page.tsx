import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeleteCharacterForm } from '@/components/characters/DeleteCharacterForm'
import { BookmarkButton } from '@/components/characters/BookmarkButton'
import { CharacterSpellsSection } from '@/components/characters/CharacterSpellsSection'
import { CharacterExportSection } from '@/components/characters/CharacterExportSection'

interface CharacterTagRow {
  tag_id: number
  tags: {
    name: string
  }[] | null
}

interface CharacterImageRow {
  image_url: string
  alt_text: string | null
  sort_order: number
}

interface CharacterSpellRow {
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

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: character } = await supabase
    .from('characters')
    .select(
      'id, user_id, name, role, summary, notes, is_public, strength, dexterity, constitution, intelligence, wisdom, charisma, updated_at'
    )
    .eq('id', id)
    .single()

  if (!character) {
    notFound()
  }

  const isOwner = character.user_id === user?.id
  if (!isOwner && !character.is_public) {
    notFound()
  }

  const { data: tagRows } = await supabase
    .from('character_tags')
    .select('tag_id, tags(name)')
    .eq('character_id', id)

  const { data: imageRows } = await supabase
    .from('character_images')
    .select('image_url, alt_text, sort_order')
    .eq('character_id', id)
    .order('sort_order', { ascending: true })

  const { data: spellRows } = await supabase
    .from('character_spells')
    .select(
      'id, spell_index, name, level, school, casting_time, range, duration, ritual, concentration, description, api_url'
    )
    .eq('character_id', id)
    .order('created_at', { ascending: false })

  const tags = ((tagRows ?? []) as CharacterTagRow[])
    .flatMap((row) => row.tags ?? [])
    .map((tag) => tag.name)
    .filter((name): name is string => Boolean(name))

  const images = (imageRows ?? []) as CharacterImageRow[]
  const spells = (spellRows ?? []) as CharacterSpellRow[]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{character.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{character.role || 'No role set'}</p>
          </div>

          <div className="flex items-center gap-3">
            <BookmarkButton characterId={character.id} />
            <Link href="/characters" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
              Back
            </Link>
            {isOwner && (
              <Link
                href={`/characters/${character.id}/edit`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Visibility: {character.is_public ? 'Public' : 'Private'}
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Summary</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {character.summary || 'No summary yet.'}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Core Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Strength', character.strength],
              ['Dexterity', character.dexterity],
              ['Constitution', character.constitution],
              ['Intelligence', character.intelligence],
              ['Wisdom', character.wisdom],
              ['Charisma', character.charisma],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-gray-50 dark:bg-gray-900 p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tags</h2>
          {tags.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No tags yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Image Gallery</h2>
          {images.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No images yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <img
                  key={`${image.image_url}-${image.sort_order}`}
                  src={image.image_url}
                  alt={image.alt_text || `${character.name} image`}
                  className="w-full h-100 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Notes</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{character.notes || 'No notes yet.'}</p>
        </section>

        <CharacterSpellsSection characterId={character.id} isOwner={isOwner} initialSpells={spells} />

        {isOwner && <CharacterExportSection characterId={character.id} />}

        {isOwner && (
          <div className="pt-2">
            <DeleteCharacterForm characterId={character.id} />
          </div>
        )}
      </div>
    </div>
  )
}
