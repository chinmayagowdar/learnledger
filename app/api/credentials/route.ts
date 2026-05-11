import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// GET: Fetch user's credentials
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: credentials, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }

  return NextResponse.json({ credentials: credentials || [] });
}

// POST: Issue a new credential
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { skillId, finalScore, roundScores } = body;

    if (!skillId || finalScore === undefined || !roundScores) {
      return NextResponse.json(
        { error: 'skillId, finalScore, and roundScores are required' },
        { status: 400 }
      );
    }

    // Generate a unique hash for the credential
    const hashInput = `${user.id}-${skillId}-${finalScore}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${hash}`;

    // Insert the credential
    const { data: credential, error: insertError } = await supabase
      .from('credentials')
      .insert({
        user_id: user.id,
        skill_id: skillId,
        final_score: finalScore,
        hash,
        verification_url: verificationUrl,
        round_scores: roundScores,
        views: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting credential:', insertError);
      return NextResponse.json({ error: 'Failed to issue credential' }, { status: 500 });
    }

    // Update user's skills_progress with the credential hash
    const { data: profile } = await supabase
      .from('users')
      .select('skills_progress')
      .eq('id', user.id)
      .single();

    if (profile) {
      const skillsProgress = profile.skills_progress || {};
      if (skillsProgress[skillId]) {
        skillsProgress[skillId].credentialHash = hash;
      }

      await supabase
        .from('users')
        .update({ skills_progress: skillsProgress })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      credential: {
        id: credential.id,
        hash: credential.hash,
        verificationUrl: credential.verification_url,
        finalScore: credential.final_score,
        roundScores: credential.round_scores,
        issuedAt: credential.issued_at,
      },
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
