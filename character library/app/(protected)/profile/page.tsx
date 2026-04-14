'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { CharacterInfoCard } from '@/components/characters/CharacterInfoCard';
import type { User } from '@supabase/supabase-js';

interface CharacterListItem {
  id: string;
  name: string;
  role: string | null;
  is_public: boolean;
  updated_at: string;
  avatar_url?: string;
}

function formatTimeAgo(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return 'N/A';

  const timestamp = new Date(isoTimestamp).getTime();
  if (Number.isNaN(timestamp)) return 'N/A';

  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (user) {
          setUser(user);
          // Get full_name and avatar_url from user metadata
          const fullNameFromMeta = user.user_metadata?.full_name || '';
          const avatarUrlFromMeta = user.user_metadata?.avatar_url || '';
          
          setFullName(fullNameFromMeta);
          setAvatarUrl(avatarUrlFromMeta);

          const { data: charactersData, error: charactersError } = await supabase
            .from('characters')
            .select('id, name, role, is_public, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (charactersError) throw charactersError;

          const items: CharacterListItem[] = charactersData ?? [];

          if (items.length > 0) {
            const characterIds = items.map((item) => item.id);
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

            for (const item of items) {
              item.avatar_url = firstImageByCharacter.get(item.id);
            }
          }

          setCharacters(items);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
        },
      });

      if (error) throw error;

      // Update local user state
      setUser((prevUser) => {
        if (prevUser) {
          return {
            ...prevUser,
            user_metadata: {
              ...prevUser.user_metadata,
              full_name: fullName || null,
              avatar_url: avatarUrl || null,
            },
          };
        }
        return prevUser;
      });

      setSaveSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current profile data
    setFullName(user?.user_metadata?.full_name || '');
    setAvatarUrl(user?.user_metadata?.avatar_url || '');
    setSaveError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
        {error || 'Failed to load profile'}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded">
              Profile updated successfully!
            </div>
          )}

          {saveError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {saveError}
            </div>
          )}

          {isEditing ? (
            // Edit Form
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Preview with Edit Info */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 space-y-2">
                  <div className="relative h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22%23D1D5DB%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <svg
                        className="h-full w-full text-gray-400 p-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Preview
                  </p>
                </div>

                <div className="flex-grow space-y-4">
                  {/* Avatar URL Input */}
                  <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      id="avatarUrl"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter the full URL of an image you'd like to use as your profile picture
                    </p>
                  </div>

                  {/* Full Name Input */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Profile Header with Avatar and Info */}
              <div className="flex gap-6 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <svg
                        className="h-full w-full text-gray-400 p-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="flex-grow pt-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {user?.user_metadata?.full_name || (
                        <span className="text-gray-500 dark:text-gray-400 italic">Name not set</span>
                      )}
                    </h2>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Created At
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Sign In
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {formatTimeAgo(user?.last_sign_in_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div id="characters" className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Your Characters
                  </h3>
                  <Link
                    href="/characters/new"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
                  >
                    New Character
                  </Link>
                </div>

                {characters.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">No characters yet.</p>
                    <Link
                      href="/characters/new"
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
                    >
                      Create Character
                    </Link>
                  </div>
                ) : (
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
