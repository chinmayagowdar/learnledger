import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  profiles: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
  };
  skills: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string | null;
    rounds: number;
    questions_per_round: number;
    pass_threshold: number;
    created_at: string;
  };
  attempts: {
    id: string;
    user_id: string;
    skill_id: string;
    round_number: number;
    round_type: 'mcq' | 'coding' | 'proctored';
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
    answers: Record<string, unknown> | null;
    time_spent_seconds: number | null;
    camera_approved: boolean;
    created_at: string;
    completed_at: string;
  };
  credentials: {
    id: string;
    user_id: string;
    skill_id: string;
    skill_title: string;
    blockchain_hash: string;
    rounds: Array<{ round: number; score: number; percentage: number }>;
    overall_score: number;
    issued_at: string;
    expires_at: string;
    is_verified: boolean;
    views: number;
    share_count: number;
  };
};
