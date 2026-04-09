import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface CharacterListItem {
  id: string
  name: string
  role: string | null
  is_public: boolean
  updated_at: string
  avatar_url?: string
}

export default async function CharactersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: characters, error } = await supabase
    .from('characters')
    .select('id, name, role, is_public, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const items: CharacterListItem[] = characters ?? []

  if (items.length > 0) {
    const characterIds = items.map((item) => item.id)
    const { data: imageRows } = await supabase
      .from('character_images')
      .select('character_id, image_url, sort_order')
      .in('character_id', characterIds)
      .order('sort_order', { ascending: true })

    const firstImageByCharacter = new Map<string, string>()
    for (const row of imageRows ?? []) {
      if (!firstImageByCharacter.has(row.character_id)) {
        firstImageByCharacter.set(row.character_id, row.image_url)
      }
    }

    for (const item of items) {
      item.avatar_url = firstImageByCharacter.get(item.id)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Character Library</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your characters.</p>
          </div>
          <Link
            href="/characters/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
          >
            New Character
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No characters yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first character to get started.</p>
            <Link
              href="/characters/new"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Create Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((character) => (
              <article key={character.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 min-h-40">
                <div className="shrink-0">
                  {character.avatar_url ? (
                    <div
                      className="h-32 w-32 rounded-full border border-gray-200 dark:border-gray-700 bg-cover bg-center"
                      style={{ backgroundImage: `url('${character.avatar_url}')` }}
                      aria-label={`${character.name} icon`}
                      role="img"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-3xl font-semibold text-gray-700 dark:text-gray-200">
                      {character.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{character.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{character.role || 'No role set'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Visibility: {character.is_public ? 'Public' : 'Private'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Updated {new Date(character.updated_at).toLocaleString()}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link href={`/characters/${character.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      View
                    </Link>
                    <Link href={`/characters/${character.id}/edit`} className="text-gray-700 dark:text-gray-300 hover:underline">
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
