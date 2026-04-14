'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface BookmarkResult {
  success: boolean;
  isBookmarked?: boolean;
  error?: string;
}

interface CharacterWithBookmark {
  id: string;
  name: string;
  role: string | null;
  summary: string | null;
  is_public: boolean;
  updated_at: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

/**
 * Toggle bookmark for a character. If already bookmarked, remove it. Otherwise, create it.
 */
export async function toggleBookmarkAction(
  characterId: string
): Promise<BookmarkResult> {
  const client = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await client
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('character_id', characterId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected for first bookmark)
      throw new Error(`Failed to check bookmark: ${checkError.message}`);
    }

    if (existingBookmark) {
      // Bookmark exists, so delete it
      const { error: deleteError } = await client
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('character_id', characterId);

      if (deleteError) {
        throw new Error(`Failed to remove bookmark: ${deleteError.message}`);
      }

      revalidatePath(`/characters/${characterId}`);
      revalidatePath('/profile');
      revalidatePath('/dashboard');

      return { success: true, isBookmarked: false };
    } else {
      // Bookmark doesn't exist, so create it
      const { error: insertError } = await client.from('bookmarks').insert({
        user_id: user.id,
        character_id: characterId,
      });

      if (insertError) {
        throw new Error(`Failed to create bookmark: ${insertError.message}`);
      }

      revalidatePath(`/characters/${characterId}`);
      revalidatePath('/profile');
      revalidatePath('/dashboard');

      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error('Bookmark action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a character is bookmarked by the current user.
 */
export async function isCharacterBookmarkedAction(
  characterId: string
): Promise<boolean> {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await client
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('character_id', characterId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected, not an error)
    console.error('Error checking bookmark status:', error);
  }

  return data !== null;
}

/**
 * Get all bookmarked character IDs for the current user.
 */
export async function getBookmarkedCharacterIdsAction(): Promise<string[]> {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await client
    .from('bookmarks')
    .select('character_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarked character IDs:', error);
    return [];
  }

  return (data ?? []).map((row) => row.character_id);
}

/**
 * Get all bookmarked characters for the current user with their metadata.
 */
export async function getBookmarkedCharactersAction(): Promise<
  CharacterWithBookmark[]
> {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await client.from('bookmarks').select(`
    character_id,
    characters (
      id,
      name,
      role,
      summary,
      is_public,
      updated_at,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma
    )
  `).eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarked characters:', error);
    return [];
  }

  // Normalize the response to flatten the nested characters
  return (data ?? [])
    .filter((row: any) => row.characters)
    .map((row: any) => ({
      ...row.characters,
      id: row.characters.id,
    })) as CharacterWithBookmark[];
}
