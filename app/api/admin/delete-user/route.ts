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

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { userId, adminUserId } = await request.json();

    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, adminUserId' },
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

    // Prevent admin from deleting themselves
    if (userId === adminUserId) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      );
    }

    // Get user document to check if they exist
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user's credentials
    const { data: deletedCreds } = await supabaseAdmin
      .from('credentials')
      .delete()
      .eq('user_id', userId)
      .select();

    // Delete user's attempts
    const { data: deletedAttempts } = await supabaseAdmin
      .from('attempts')
      .delete()
      .eq('user_id', userId)
      .select();

    // Delete user from public.users (cascade will handle auth.users reference)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw deleteError;
    }

    // Delete user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn('Could not delete user from Auth:', authError);
    }

    return NextResponse.json({
      success: true,
      message: `User deleted along with ${deletedCreds?.length || 0} credential(s) and ${deletedAttempts?.length || 0} attempt(s)`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
