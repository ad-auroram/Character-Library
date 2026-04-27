'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { CharacterInfoCard } from '@/components/characters/CharacterInfoCard';
import { loadCharacterAvatars } from '@/lib/character-utils';

interface CharacterListItem {
  id: string;
  name: string;
  role: string | null;
  is_public: boolean;
  updated_at: string;
  avatar_url?: string;
}

interface CharactersTabProps {
  userId: string;
}

export function CharactersTab({ userId }: CharactersTabProps) {
  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const supabase = createSupabaseClient();

        const { data: charactersData, error: charactersError } = await supabase
          .from('characters')
          .select('id, name, role, is_public, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (charactersError) throw charactersError;

        const items: CharacterListItem[] = charactersData ?? [];

        if (items.length > 0) {
          const characterIds = items.map((item) => item.id);
          const avatarMap = await loadCharacterAvatars(characterIds);

          for (const item of items) {
            item.avatar_url = avatarMap.get(item.id);
          }
        }

        setCharacters(items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load characters'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [userId]);

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          No characters yet.
        </p>
        <Link
          href="/characters/new"
          className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition"
        >
          Create Character
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {characters.map((character) => (
        <CharacterInfoCard
          key={character.id}
          id={character.id}
          name={character.name}
          role={character.role}
          updatedAt={character.updated_at}
          isPublic={character.is_public}
          avatarUrl={character.avatar_url}
          showEditLink={true}
        />
      ))}
    </div>
  );
}
