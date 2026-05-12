import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { userId, skillId, adminUserId } = await request.json();

    if (!userId || !skillId || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, skillId, adminUserId' },
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

    // Reset skill progress
    const skillsProgress = user.skills_progress || {};
    skillsProgress[skillId] = { roundsCompleted: [] };

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ skills_progress: skillsProgress })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Delete any credentials for this skill
    const { data: deletedCreds, error: deleteError } = await supabaseAdmin
      .from('credentials')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .select();

    if (deleteError) {
      console.warn('Error deleting credentials:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: `Reset progress for skill ${skillId} and deleted ${deletedCreds?.length || 0} credential(s)`,
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return NextResponse.json(
      { error: 'Failed to reset progress' },
      { status: 500 }
    );
  }
}
