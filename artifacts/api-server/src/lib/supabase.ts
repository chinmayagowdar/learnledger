import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  logger.warn(
    'Supabase credentials missing. Database operations will not work.',
    { url: !!supabaseUrl, key: !!supabaseServiceRoleKey }
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export type Database = {
  public: {
    Tables: {
      certificates: {
        Row: {
          id: string;
          certificate_id: string;
          recipient_name: string;
          skill_title: string;
          issued_by: string;
          issued_at: string;
          expires_at: string | null;
          blockchain_hash: string | null;
          is_verified: boolean;
          views: number;
          share_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          certificate_id: string;
          recipient_name: string;
          skill_title: string;
          issued_by?: string;
          issued_at: string;
          expires_at?: string | null;
          blockchain_hash?: string | null;
          is_verified?: boolean;
          views?: number;
          share_count?: number;
        };
        Update: {
          blockchain_hash?: string | null;
          is_verified?: boolean;
          views?: number;
          share_count?: number;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_size: number;
          file_hash: string;
          original_text: string | null;
          parsed_data: Record<string, any> | null;
          ai_score: number | null;
          ai_feedback: string | null;
          blockchain_hash: string | null;
          is_verified: boolean;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          file_name: string;
          file_size: number;
          file_hash: string;
          original_text?: string | null;
          parsed_data?: Record<string, any> | null;
          ai_score?: number | null;
          ai_feedback?: string | null;
          blockchain_hash?: string | null;
          is_verified?: boolean;
          views?: number;
        };
        Update: {
          parsed_data?: Record<string, any> | null;
          ai_score?: number | null;
          ai_feedback?: string | null;
          blockchain_hash?: string | null;
          is_verified?: boolean;
          views?: number;
        };
      };
      blockchain_records: {
        Row: {
          id: string;
          tx_hash: string;
          entity_type: string;
          entity_id: string;
          document_hash: string;
          block_number: number;
          timestamp: string;
          sender_address: string | null;
          status: string;
          chain_id: string;
          created_at: string;
        };
        Insert: {
          tx_hash: string;
          entity_type: string;
          entity_id: string;
          document_hash: string;
          block_number: number;
          timestamp: string;
          sender_address?: string | null;
          status?: string;
          chain_id?: string;
        };
      };
    };
  };
};
