import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const { userId, adminUserId } = await request.json();

    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, adminUserId' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const auth = getAdminAuth();

    // Verify admin user has admin role
    const adminDoc = await db.collection('users').doc(adminUserId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
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
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user's credentials
    const credentialsSnapshot = await db
      .collection('credentials')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    credentialsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's attempts
    const attemptsSnapshot = await db
      .collection('attempts')
      .where('userId', '==', userId)
      .get();

    attemptsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user document from Firestore
    batch.delete(userRef);
    await batch.commit();

    // Delete user from Firebase Auth
    try {
      await auth.deleteUser(userId);
    } catch (authError) {
      console.warn('Could not delete user from Auth (may not exist):', authError);
    }

    return NextResponse.json({
      success: true,
      message: `User deleted along with ${credentialsSnapshot.size} credential(s) and ${attemptsSnapshot.size} attempt(s)`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
