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
