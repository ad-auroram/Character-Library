import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCharacterAction } from '@/app/(protected)/characters/actions'
import { canGenerateCharacterSummary } from '../../ai-utils'
import { CharacterSummaryField } from '../../../../../components/characters/CharacterSummaryField'

interface CharacterTagRow {
  tags: {
    name: string
  }[] | null
}

interface CharacterImageRow {
  image_url: string
  sort_order: number
}

export default async function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const showGenerateSummary = canGenerateCharacterSummary()
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: character } = await supabase
    .from('characters')
    .select(
      'id, user_id, name, role, summary, notes, is_public, strength, dexterity, constitution, intelligence, wisdom, charisma'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!character) {
    notFound()
  }

  const { data: tagRows } = await supabase
    .from('character_tags')
    .select('tags(name)')
    .eq('character_id', id)

  const { data: imageRows } = await supabase
    .from('character_images')
    .select('image_url, sort_order')
    .eq('character_id', id)
    .order('sort_order', { ascending: true })

  const tags = ((tagRows ?? []) as CharacterTagRow[])
    .flatMap((row) => row.tags ?? [])
    .map((tag) => tag.name)
    .filter((name): name is string => Boolean(name))
    .join(', ')

  const imageUrls = (imageRows ?? []) as CharacterImageRow[]
  const imageUrlInput = imageUrls.map((row) => row.image_url).join('\n')

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Character</h1>
          <Link
            href={`/characters/${character.id}`}
            className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
          >
            Back to Character
          </Link>
        </div>

        <form action={updateCharacterAction} className="space-y-6">
          <input type="hidden" name="character_id" value={character.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={character.name}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <input
                id="role"
                name="role"
                defaultValue={character.role ?? ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <CharacterSummaryField initialSummary={character.summary ?? ''} showGenerateSummary={showGenerateSummary} />

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              defaultValue={character.notes ?? ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_public"
              name="is_public"
              type="checkbox"
              defaultChecked={character.is_public}
              className="h-4 w-4"
            />
            <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
              Public character
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Core Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['strength', 'Strength', character.strength],
                ['dexterity', 'Dexterity', character.dexterity],
                ['constitution', 'Constitution', character.constitution],
                ['intelligence', 'Intelligence', character.intelligence],
                ['wisdom', 'Wisdom', character.wisdom],
                ['charisma', 'Charisma', character.charisma],
              ].map(([name, label, value]) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={Number(value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              defaultValue={tags}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="image_urls" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              id="image_urls"
              name="image_urls"
              rows={4}
              defaultValue={imageUrlInput}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition"
            >
              Save Changes
            </button>
            <Link
              href={`/characters/${character.id}`}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md font-medium text-gray-900 dark:text-white transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
