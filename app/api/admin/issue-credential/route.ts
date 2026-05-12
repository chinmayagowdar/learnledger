import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { userId, skillId, skillName, finalScore, roundScores, adminUserId } = await request.json();

    if (!userId || !skillId || !skillName || finalScore === undefined || !roundScores || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify admin user has admin role
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single();

    if (adminError || adminUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    // Get user document
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('skills_progress')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate blockchain hash using SHA-256
    const timestamp = new Date().toISOString();
    const hashInput = `${userId}${skillId}${finalScore}${timestamp}`;
    const blockchainHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Create credential document
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${blockchainHash}`;

    const { data: credential, error: credError } = await supabaseAdmin
      .from('credentials')
      .insert({
        user_id: userId,
        skill_id: skillId,
        final_score: finalScore,
        hash: blockchainHash,
        verification_url: verificationUrl,
        round_scores: roundScores.map((r: { percentage: number }) => Math.round(r.percentage)),
        views: 0,
      })
      .select()
      .single();

    if (credError) {
      throw credError;
    }

    // Update user's skill progress to completed
    const skillsProgress = user.skills_progress || {};
    skillsProgress[skillId] = {
      roundsCompleted: [1, 2, 3],
      credentialHash: blockchainHash,
      status: 'completed',
    };

    await supabaseAdmin
      .from('users')
      .update({ skills_progress: skillsProgress })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      credentialId: credential.id,
      blockchainHash,
      message: `Credential issued for ${skillName}`,
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    return NextResponse.json(
      { error: 'Failed to issue credential' },
      { status: 500 }
    );
  }
}
