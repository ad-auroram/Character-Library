'use client';

import { useMemo, useState } from 'react';
import { CharacterInfoCard } from '@/components/characters/CharacterInfoCard';

interface PublicCharacterItem {
  id: string;
  name: string;
  role: string | null;
  is_public: boolean;
  updated_at: string;
  avatar_url?: string;
  tags: string[];
}

interface PublicCharactersSectionProps {
  characters: PublicCharacterItem[];
}

export function PublicCharactersSection({ characters }: PublicCharactersSectionProps) {
  const [query, setQuery] = useState('');

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return characters;

    return characters.filter((character) => {
      const nameMatch = character.name.toLowerCase().includes(normalizedQuery);
      const tagMatch = character.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      return nameMatch || tagMatch;
    });
  }, [characters, query]);

  return (
    <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Characters</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse public characters by name or tags.</p>
        </div>
        <div className="w-full md:w-80">
          <label htmlFor="character-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            id="character-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or tag"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {filteredCharacters.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-400">
          No characters match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCharacters.map((character) => (
            <CharacterInfoCard
              key={character.id}
              id={character.id}
              name={character.name}
              role={character.role}
              updatedAt={character.updated_at}
              isPublic={character.is_public}
              avatarUrl={character.avatar_url}
              showVisibility={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
