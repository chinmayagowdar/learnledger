import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/issue-credential
 * Issue a credential for a user who has completed all 3 rounds of a skill
 * 
 * Body: {
 *   userId: string,
 *   skillId: string,
 *   skillName: string,
 *   roundScores: number[] (array of 3 scores)
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, skillId, skillName, roundScores } = body;

    // Validate input
    if (!userId || !skillId || !skillName || !roundScores || roundScores.length !== 3) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, skillId, skillName, roundScores (array of 3)' },
        { status: 400 }
      );
    }

    // Check if user is admin or issuing to themselves
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = currentUserData?.role === 'admin';
    const isSelf = user.id === userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Forbidden: Can only issue credentials for yourself unless admin' },
        { status: 403 }
      );
    }

    // Check if credential already exists for this user+skill
    const { data: existingCred } = await supabase
      .from('credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single();

    if (existingCred) {
      return NextResponse.json(
        { error: 'Credential already exists for this skill' },
        { status: 409 }
      );
    }

    // Calculate final score (average of 3 rounds)
    const finalScore = Math.round(roundScores.reduce((a: number, b: number) => a + b, 0) / 3);

    // Generate SHA-256 hash: userId + skillId + finalScore + timestamp
    const timestamp = new Date().toISOString();
    const hashInput = `${userId}${skillId}${finalScore}${timestamp}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${hash}`;

    // Insert credential
    const { data: credential, error: insertError } = await supabase
      .from('credentials')
      .insert({
        user_id: userId,
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
      return NextResponse.json(
        { error: 'Failed to create credential' },
        { status: 500 }
      );
    }

    // Update user's skills_progress to mark as completed with credentialHash
    const { data: userData, error: fetchUserError } = await supabase
      .from('users')
      .select('skills_progress')
      .eq('id', userId)
      .single();

    if (fetchUserError) {
      console.error('Error fetching user:', fetchUserError);
    } else {
      const skillsProgress = userData?.skills_progress || {};
      skillsProgress[skillId] = {
        roundsCompleted: [1, 2, 3],
        credentialHash: hash,
        status: 'completed',
      };

      await supabase
        .from('users')
        .update({ skills_progress: skillsProgress })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      credential: {
        id: credential.id,
        hash: credential.hash,
        finalScore: credential.final_score,
        verificationUrl: credential.verification_url,
        issuedAt: credential.issued_at,
      },
    });

  } catch (error) {
    console.error('Error issuing credential:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
