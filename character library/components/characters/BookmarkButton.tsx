'use client';

import { useState, useEffect } from 'react';
import {
  toggleBookmarkAction,
  isCharacterBookmarkedAction,
} from '@/app/(protected)/characters/bookmark-actions';

interface BookmarkButtonProps {
  characterId: string;
  disabled?: boolean;
}

export function BookmarkButton({ characterId, disabled = false }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const bookmarked = await isCharacterBookmarkedAction(characterId);
        setIsBookmarked(bookmarked);
      } catch (err) {
        console.error('Error checking bookmark status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookmark();
  }, [characterId]);

  const handleToggleBookmark = async () => {
    setError(null);
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      const result = await toggleBookmarkAction(characterId);
      if (!result.success) {
        setIsBookmarked(previousState);
        setError(result.error || 'Failed to update bookmark');
      } else {
        setIsBookmarked(result.isBookmarked ?? !previousState);
      }
    } catch (err) {
      setIsBookmarked(previousState);
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleToggleBookmark}
        disabled={isLoading || disabled}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        className={`p-2 rounded-lg transition ${
          isLoading || disabled
            ? 'cursor-not-allowed opacity-50'
            : isBookmarked
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {isLoading ? (
          <svg
            className="w-6 h-6 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 3h12v16l-6-4.5L6 19V3z"
            />
          </svg>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
