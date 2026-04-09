import type { User, Session } from '@supabase/supabase-js';

/**
 * Auth context type
 */
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Profile type for user profiles table
 */
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Form types
 */
export interface SignUpFormData {
  email: string;
  password: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface UpdateProfileFormData {
  full_name?: string;
  avatar_url?: string;
}
