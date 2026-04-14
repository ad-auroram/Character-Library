import { createClient } from '@/lib/supabase/server';
import { PublicCharactersSection } from '@/components/characters/PublicCharactersSection';

interface PublicCharacter {
  id: string;
  name: string;
  role: string | null;
  is_public: boolean;
  updated_at: string;
  avatar_url?: string;
  tags: string[];
}

interface CharacterTagRow {
  character_id: string;
  tags: { name: string } | { name: string }[] | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { count: characterCount } = await supabase
    .from('characters')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id ?? '');

  const { data: publicCharactersData, error: publicCharactersError } = await supabase
    .from('characters')
    .select('id, name, role, is_public, updated_at')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (publicCharactersError) {
    throw new Error(publicCharactersError.message);
  }

  const publicCharacters: PublicCharacter[] = (publicCharactersData ?? []).map((character) => ({
    ...character,
    tags: [],
  }));

  if (publicCharacters.length > 0) {
    const characterIds = publicCharacters.map((character) => character.id);
    const { data: imageRows } = await supabase
      .from('character_images')
      .select('character_id, image_url, sort_order')
      .in('character_id', characterIds)
      .order('sort_order', { ascending: true });

    const firstImageByCharacter = new Map<string, string>();
    for (const row of imageRows ?? []) {
      if (!firstImageByCharacter.has(row.character_id)) {
        firstImageByCharacter.set(row.character_id, row.image_url);
      }
    }

    for (const character of publicCharacters) {
      character.avatar_url = firstImageByCharacter.get(character.id);
    }

    const { data: tagRows } = await supabase
      .from('character_tags')
      .select('character_id, tags(name)')
      .in('character_id', characterIds);

    const tagsByCharacter = new Map<string, string[]>();
    for (const row of (tagRows ?? []) as CharacterTagRow[]) {
      const tagRecords = Array.isArray(row.tags)
        ? row.tags
        : row.tags
          ? [row.tags]
          : [];
      const names = tagRecords.map((tag) => tag.name).filter(Boolean);
      if (names.length > 0) {
        const existing = tagsByCharacter.get(row.character_id) ?? [];
        tagsByCharacter.set(row.character_id, [...existing, ...names]);
      }
    }

    for (const character of publicCharacters) {
      character.tags = tagsByCharacter.get(character.id) ?? [];
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Welcome back, {user?.user_metadata?.full_name || user?.email}!
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 overflow-hidden rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Your Characters
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">{characterCount ?? 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 overflow-hidden rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Account Status
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">Active</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 overflow-hidden rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Member Since
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(user?.created_at || '').toLocaleDateString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PublicCharactersSection characters={publicCharacters} />
      </div>
    </div>
  );
}
