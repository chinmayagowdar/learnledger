import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
        };
      };
      user_assessments: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          status: 'pending' | 'in-progress' | 'completed';
          score: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          assessment_id: string;
          status: 'pending' | 'in-progress' | 'completed';
          score?: number | null;
          completed_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'in-progress' | 'completed';
          score?: number | null;
          completed_at?: string | null;
        };
      };
      credentials: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          issuer: string;
          credential_id: string;
          blockchain_hash: string;
          date: string;
          assessment_id: string;
          score: number;
          is_verified: boolean;
          views: number;
          share_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          issuer: string;
          credential_id: string;
          blockchain_hash: string;
          date: string;
          assessment_id: string;
          score: number;
          is_verified?: boolean;
          views?: number;
          share_count?: number;
        };
        Update: {
          views?: number;
          share_count?: number;
        };
      };
      round_results: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          round: number;
          score: number;
          total: number;
          percentage: number;
          passed: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          assessment_id: string;
          round: number;
          score: number;
          total: number;
          percentage: number;
          passed: boolean;
        };
      };
    };
  };
};
