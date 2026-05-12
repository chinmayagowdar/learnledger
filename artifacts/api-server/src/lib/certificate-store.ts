import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const fullUrl = url.startsWith('http') ? url : `https://${url}.supabase.co`;
  _supabase = createClient(fullUrl, key);
  return _supabase;
}

export interface Certificate {
  certificate_id: string;
  recipient_name: string;
  skill_title: string;
  issued_by: string;
  issued_at: string;
  expires_at: string;
}

/** Look up a certificate by ID and verify the name case-insensitively against Supabase. */
export async function verifyCertificate(
  id: string,
  name: string,
): Promise<{ valid: true; certificate: Certificate } | { valid: false; reason: string }> {
  const supabase = getSupabase();

  const { data: credData, error } = await supabase
    .from('credentials')
    .select('credential_id, title, issuer, date, score, user_id')
    .eq('credential_id', id)
    .single();

  if (error || !credData) {
    return { valid: false, reason: 'Certificate not found' };
  }

  // Fetch profile to verify name
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', credData.user_id)
    .single();

  if (profile && profile.name.toLowerCase() !== name.trim().toLowerCase()) {
    return { valid: false, reason: 'Name does not match certificate records' };
  }

  return {
    valid: true,
    certificate: {
      certificate_id: credData.credential_id,
      recipient_name: profile?.name ?? name,
      skill_title: credData.title,
      issued_by: credData.issuer,
      issued_at: credData.date,
      expires_at: new Date(
        new Date(credData.date).setFullYear(new Date(credData.date).getFullYear() + 1),
      )
        .toISOString()
        .split('T')[0],
    },
  };
}

/** Add a new certificate. Used by admin issue endpoint — writes to Supabase. */
export async function issueCertificate(cert: Certificate & { user_id?: string }): Promise<void> {
  if (!cert.user_id) return;
  const supabase = getSupabase();
  await supabase.from('credentials').insert({
    user_id: cert.user_id,
    title: cert.skill_title,
    issuer: cert.issued_by,
    credential_id: cert.certificate_id,
    blockchain_hash: `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`,
    date: cert.issued_at,
    assessment_id: 'admin-issued',
    score: 100,
    is_verified: true,
  });
}

/** Return all credentials (admin). */
export async function listCertificates(): Promise<Certificate[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('credentials')
    .select('credential_id, title, issuer, date, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (data ?? []).map((row: any) => ({
    certificate_id: row.credential_id,
    recipient_name: row.profiles?.name ?? 'Unknown',
    skill_title: row.title,
    issued_by: row.issuer,
    issued_at: row.date,
    expires_at: '',
  }));
}
