import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// This route uses the service role key to set up the first admin
// It should only be accessible during initial setup
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Create admin client with service role
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const body = await request.json();
    const { userId, setupKey } = body;

    // Verify setup key (should be set as an environment variable)
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!expectedSetupKey || setupKey !== expectedSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (checkError) {
      console.error('Error checking for admins:', checkError);
      return NextResponse.json(
        { error: 'Failed to check admin status' },
        { status: 500 }
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'An admin already exists. Use the admin panel to manage roles.' },
        { status: 400 }
      );
    }

    // Promote the user to admin
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (updateError) {
      console.error('Error promoting user to admin:', updateError);
      return NextResponse.json(
        { error: 'Failed to promote user to admin' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin successfully',
    });
  } catch (error) {
    console.error('Error in admin setup:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// GET: Check if admin setup is needed
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ needsSetup: false, error: 'Not configured' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: admins, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  if (error) {
    return NextResponse.json({ needsSetup: false, error: 'Check failed' });
  }

  return NextResponse.json({
    needsSetup: !admins || admins.length === 0,
  });
}
