export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user_id: string
          match_type: 'singles' | 'doubles'
          opponent_name: string
          opponent_user_id: string | null
          partner_name: string | null
          partner_user_id: string | null
          opponent_partner_name: string | null
          opponent_partner_user_id: string | null
          location: string | null
          played_at: string
          result: 'win' | 'loss' | 'draw' | null
          notes: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_type?: 'singles' | 'doubles'
          opponent_name: string
          opponent_user_id?: string | null
          partner_name?: string | null
          partner_user_id?: string | null
          opponent_partner_name?: string | null
          opponent_partner_user_id?: string | null
          location?: string | null
          played_at?: string
          result?: 'win' | 'loss' | 'draw' | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_type?: 'singles' | 'doubles'
          opponent_name?: string
          opponent_user_id?: string | null
          partner_name?: string | null
          partner_user_id?: string | null
          opponent_partner_name?: string | null
          opponent_partner_user_id?: string | null
          location?: string | null
          played_at?: string
          result?: 'win' | 'loss' | 'draw' | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_user_id_fkey"
            columns: ["opponent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_partner_user_id_fkey"
            columns: ["partner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_partner_user_id_fkey"
            columns: ["opponent_partner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      match_sets: {
        Row: {
          id: string
          match_id: string
          set_number: number
          player_score: number
          opponent_score: number
          tiebreak_player: number | null
          tiebreak_opponent: number | null
        }
        Insert: {
          id?: string
          match_id: string
          set_number: number
          player_score: number
          opponent_score: number
          tiebreak_player?: number | null
          tiebreak_opponent?: number | null
        }
        Update: {
          id?: string
          match_id?: string
          set_number?: number
          player_score?: number
          opponent_score?: number
          tiebreak_player?: number | null
          tiebreak_opponent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_sets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          cover_image_url: string | null
          is_public: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string
          cover_image_url?: string | null
          is_public?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          cover_image_url?: string | null
          is_public?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'admin' | 'moderator' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'admin' | 'moderator' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'admin' | 'moderator' | 'member'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type MatchSet = Database['public']['Tables']['match_sets']['Row']
export type MatchSetInsert = Database['public']['Tables']['match_sets']['Insert']
export type MatchSetUpdate = Database['public']['Tables']['match_sets']['Update']

export type Group = Database['public']['Tables']['groups']['Row']
export type GroupInsert = Database['public']['Tables']['groups']['Insert']
export type GroupUpdate = Database['public']['Tables']['groups']['Update']

export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupMemberInsert = Database['public']['Tables']['group_members']['Insert']
export type GroupMemberUpdate = Database['public']['Tables']['group_members']['Update']

// Extended types with relations
export type MatchWithSets = Match & {
  match_sets: MatchSet[]
}

export type MatchWithProfiles = Match & {
  match_sets: MatchSet[]
  opponent_profile?: Profile | null
  partner_profile?: Profile | null
  opponent_partner_profile?: Profile | null
}

export type GroupWithMembers = Group & {
  group_members: (GroupMember & { profiles: Profile })[]
  member_count?: number
}
