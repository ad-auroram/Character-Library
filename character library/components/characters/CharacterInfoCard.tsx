'use client';

import Link from 'next/link';

interface CharacterInfoCardProps {
  id: string;
  name: string;
  role: string | null;
  updatedAt: string;
  isPublic?: boolean;
  avatarUrl?: string;
  showVisibility?: boolean;
  showEditLink?: boolean;
  avatarSizeClassName?: string;
}

export function CharacterInfoCard({
  id,
  name,
  role,
  updatedAt,
  isPublic,
  avatarUrl,
  showVisibility = true,
  showEditLink = true,
  avatarSizeClassName = 'h-28 w-28',
}: CharacterInfoCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 min-h-40">
      <div className="shrink-0">
        {avatarUrl ? (
          <div
            className={`${avatarSizeClassName} rounded-full border border-gray-200 dark:border-gray-700 bg-cover bg-center`}
            style={{ backgroundImage: `url('${avatarUrl}')` }}
            aria-label={`${name} icon`}
            role="img"
          />
        ) : (
          <div
            className={`${avatarSizeClassName} rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-2xl font-semibold text-gray-700 dark:text-gray-200`}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{role || 'No role set'}</p>

        {showVisibility && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Visibility: {isPublic ? 'Public' : 'Private'}
          </p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Updated {new Date(updatedAt).toLocaleString()}
        </p>

        <div className="mt-4 flex gap-3">
          <Link href={`/characters/${id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            View
          </Link>
          {showEditLink && (
            <Link href={`/characters/${id}/edit`} className="text-gray-700 dark:text-gray-300 hover:underline">
              Edit
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
