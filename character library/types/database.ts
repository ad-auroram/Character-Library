/**
 * Database types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          user_id: string
          name: string
          role: string | null
          summary: string | null
          notes: string | null
          is_public: boolean
          strength: number
          dexterity: number
          constitution: number
          intelligence: number
          wisdom: number
          charisma: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          role?: string | null
          summary?: string | null
          notes?: string | null
          is_public?: boolean
          strength?: number
          dexterity?: number
          constitution?: number
          intelligence?: number
          wisdom?: number
          charisma?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          role?: string | null
          summary?: string | null
          notes?: string | null
          is_public?: boolean
          strength?: number
          dexterity?: number
          constitution?: number
          intelligence?: number
          wisdom?: number
          charisma?: number
          created_at?: string
          updated_at?: string
        }
      }
      character_images: {
        Row: {
          id: string
          character_id: string
          image_url: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          character_id: string
          image_url: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          image_url?: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      character_tags: {
        Row: {
          character_id: string
          tag_id: number
          created_at: string
        }
        Insert: {
          character_id: string
          tag_id: number
          created_at?: string
        }
        Update: {
          character_id?: string
          tag_id?: number
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          character_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          character_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          character_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
