'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { CharactersTab } from '@/components/profile/CharactersTab';
import { BookmarksTab } from '@/components/profile/BookmarksTab';
import { Alert } from '@/components/ui/Alert';
import { formatRelativeTime } from '@/utils/format';
import { AvatarFallbackSVG, BROKEN_IMAGE_FALLBACK } from '@/lib/svg-constants';
import type { User } from '@supabase/supabase-js';

type TabType = 'characters' | 'bookmarks';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  
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
      <div className="px-4 py-6 sm:px-0">
        <Alert type="error" message={error || 'Failed to load profile'} />
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {saveSuccess && (
            <Alert type="success" message="Profile updated successfully!" />
          )}

          {saveError && <Alert type="error" message={saveError} />}

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
                          e.currentTarget.src = BROKEN_IMAGE_FALLBACK;
                        }}
                      />
                    ) : (
                      <AvatarFallbackSVG />
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <AvatarFallbackSVG />
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
                      {user?.last_sign_in_at ? formatRelativeTime(user.last_sign_in_at) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div id="library" className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Library
                  </h3>
                  {activeTab === 'characters' && (
                    <Link
                      href="/characters/new"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition"
                    >
                      New Character
                    </Link>
                  )}
                </div>

                {/* Tab Controls */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('characters')}
                    className={`px-4 py-2 font-medium transition border-b-2 ${
                      activeTab === 'characters'
                        ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Your Characters
                  </button>
                  <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`px-4 py-2 font-medium transition border-b-2 ${
                      activeTab === 'bookmarks'
                        ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Bookmarks
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'characters' && user && (
                  <CharactersTab userId={user.id} />
                )}
                {activeTab === 'bookmarks' && (
                  <BookmarksTab />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
