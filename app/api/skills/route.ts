import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch user's skills progress
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('skills_progress')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }

  return NextResponse.json({ skillsProgress: profile?.skills_progress || {} });
}

// POST: Update skills progress
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
    const { skillId, currentRound, status, roundScore, passed } = body;

    if (!skillId) {
      return NextResponse.json({ error: 'skillId is required' }, { status: 400 });
    }

    // Get current skills_progress
    const { data: profile, error: fetchError } = await supabase
      .from('users')
      .select('skills_progress')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const skillsProgress = profile?.skills_progress || {};
    const currentSkillProgress = skillsProgress[skillId] || {
      currentRound: 1,
      status: 'not_started',
      roundScores: [null, null, null],
      finalScore: null,
      credentialHash: null,
    };

    // Update the skill progress
    if (roundScore !== undefined && currentRound !== undefined) {
      currentSkillProgress.roundScores[currentRound - 1] = roundScore;
    }

    if (status) {
      currentSkillProgress.status = status;
    }

    if (currentRound !== undefined) {
      currentSkillProgress.currentRound = currentRound;
    }

    // Calculate final score if all rounds are complete
    const completedScores = currentSkillProgress.roundScores.filter((s: number | null) => s !== null);
    if (completedScores.length === 3) {
      currentSkillProgress.finalScore = Math.round(
        completedScores.reduce((a: number, b: number) => a + b, 0) / 3
      );
      currentSkillProgress.status = 'completed';
    }

    // Update the database
    const updatedSkillsProgress = {
      ...skillsProgress,
      [skillId]: currentSkillProgress,
    };

    const { error: updateError } = await supabase
      .from('users')
      .update({ skills_progress: updatedSkillsProgress })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update skills' }, { status: 500 });
    }

    // Record the attempt
    if (roundScore !== undefined && currentRound !== undefined) {
      await supabase.from('attempts').insert({
        user_id: user.id,
        skill_id: skillId,
        round_number: currentRound,
        score: roundScore,
        passed: passed ?? roundScore >= 70,
      });
    }

    return NextResponse.json({
      success: true,
      skillsProgress: updatedSkillsProgress,
    });
  } catch (error) {
    console.error('Error updating skills:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
