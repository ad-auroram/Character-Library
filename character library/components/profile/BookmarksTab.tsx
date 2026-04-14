'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookmarkedCharactersAction } from '@/app/(protected)/characters/bookmark-actions';
import { CharacterInfoCard } from '@/components/characters/CharacterInfoCard';
import { loadCharacterAvatars } from '@/lib/character-utils';

interface BookmarkedCharacter {
  id: string;
  name: string;
  role: string | null;
  is_public: boolean;
  updated_at: string;
  avatar_url?: string;
}

export function BookmarksTab() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const bookmarkedCharacters = await getBookmarkedCharactersAction();

        if (bookmarkedCharacters.length > 0) {
          const characterIds = bookmarkedCharacters.map((char) => char.id);
          const avatarMap = await loadCharacterAvatars(characterIds);

          const bookmarksWithAvatars: BookmarkedCharacter[] =
            bookmarkedCharacters.map((char) => ({
              id: char.id,
              name: char.name,
              role: char.role,
              is_public: char.is_public,
              updated_at: char.updated_at,
              avatar_url: avatarMap.get(char.id),
            }));

          setBookmarks(bookmarksWithAvatars);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load bookmarks'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

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

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          No bookmarks yet. Find characters to bookmark on the dashboard or
          browse public characters.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
        >
          Explore Characters
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {bookmarks.map((character) => (
        <CharacterInfoCard
          key={character.id}
          id={character.id}
          name={character.name}
          role={character.role}
          updatedAt={character.updated_at}
          isPublic={character.is_public}
          avatarUrl={character.avatar_url}
          showVisibility={true}
        />
      ))}
    </div>
  );
}
