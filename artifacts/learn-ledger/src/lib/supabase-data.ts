import { supabase } from './supabase';
import type { Credential } from './store';

// ── Credentials ────────────────────────────────────────────────────────────

export async function fetchCredentials(userId: string): Promise<Credential[]> {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchCredentials:', error); return []; }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    credentialId: row.credential_id,
    blockchainHash: row.blockchain_hash,
    date: row.date,
    assessmentId: row.assessment_id,
    score: row.score,
    isVerified: row.is_verified,
    views: row.views,
    shareCount: row.share_count,
  }));
}

export async function saveCredential(userId: string, credential: Credential): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('credentials')
    .insert({
      user_id: userId,
      title: credential.title,
      issuer: credential.issuer,
      credential_id: credential.credentialId,
      blockchain_hash: credential.blockchainHash,
      date: credential.date,
      assessment_id: credential.assessmentId,
      score: credential.score,
      is_verified: credential.isVerified,
      views: credential.views ?? 0,
      share_count: credential.shareCount ?? 0,
    })
    .select('id')
    .single();

  if (error) { console.error('saveCredential:', error); return null; }
  return data;
}

export async function incrementCredentialViews(credentialId: string) {
  await supabase.rpc('increment_credential_views', { cred_id: credentialId });
}

// ── User Assessments ───────────────────────────────────────────────────────

export async function fetchUserAssessments(userId: string) {
  const { data, error } = await supabase
    .from('user_assessments')
    .select('*')
    .eq('user_id', userId);

  if (error) { console.error('fetchUserAssessments:', error); return []; }
  return data ?? [];
}

export async function upsertAssessmentStatus(
  userId: string,
  assessmentId: string,
  status: 'pending' | 'in-progress' | 'completed',
  score?: number,
) {
  const { error } = await supabase
    .from('user_assessments')
    .upsert(
      {
        user_id: userId,
        assessment_id: assessmentId,
        status,
        score: score ?? null,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,assessment_id' },
    );

  if (error) console.error('upsertAssessmentStatus:', error);
}

// ── Round Results ──────────────────────────────────────────────────────────

export async function saveRoundResult(
  userId: string,
  assessmentId: string,
  round: number,
  score: number,
  total: number,
  percentage: number,
  passed: boolean,
) {
  const { error } = await supabase.from('round_results').insert({
    user_id: userId,
    assessment_id: assessmentId,
    round,
    score,
    total,
    percentage,
    passed,
  });
  if (error) console.error('saveRoundResult:', error);
}

// ── Profile ────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) { console.error('fetchProfile:', error); return null; }
  return data;
}

// ── Resumes ────────────────────────────────────────────────────────────────

export interface ResumeRecord {
  id: string;
  user_id: string | null;
  original_name: string;
  file_hash: string;
  file_size: number;
  mime_type: string;
  extracted_data: Record<string, unknown> | null;
  score: number | null;
  feedback: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export async function createResume(
  userId: string,
  originalName: string,
  fileHash: string,
  fileSize: number,
  mimeType: string,
): Promise<ResumeRecord | null> {
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      original_name: originalName,
      file_hash: fileHash,
      file_size: fileSize,
      mime_type: mimeType,
      status: 'pending',
    })
    .select()
    .single();

  if (error) { console.error('createResume:', error); return null; }
  return data as ResumeRecord;
}

export async function updateResumeStatus(
  resumeId: string,
  status: 'pending' | 'processing' | 'completed' | 'error',
  updates?: {
    extracted_data?: Record<string, unknown>;
    score?: number;
    feedback?: string;
    error_message?: string;
  },
): Promise<boolean> {
  const { error } = await supabase
    .from('resumes')
    .update({ status, ...updates })
    .eq('id', resumeId);

  if (error) { console.error('updateResumeStatus:', error); return false; }
  return true;
}

export async function fetchResume(resumeId: string): Promise<ResumeRecord | null> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (error) { console.error('fetchResume:', error); return null; }
  return data as ResumeRecord;
}

export async function fetchUserResumes(userId: string): Promise<ResumeRecord[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchUserResumes:', error); return []; }
  return (data ?? []) as ResumeRecord[];
}

export async function verifyResumeByHash(
  resumeId: string,
  fileHash: string,
): Promise<ResumeRecord | null> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('file_hash', fileHash)
    .single();

  if (error) { console.error('verifyResumeByHash:', error); return null; }
  return data as ResumeRecord;
}
