import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, skillId, adminUserId } = await request.json();

    if (!userId || !skillId || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, skillId, adminUserId' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Verify admin user has admin role
    const adminDoc = await db.collection('users').doc(adminUserId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    // Get user document
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Reset skill progress
    await userRef.update({
      [`skills.${skillId}`]: { roundsCompleted: [] },
    });

    // Find and mark any credentials for this skill as revoked
    const credentialsSnapshot = await db
      .collection('credentials')
      .where('userId', '==', userId)
      .where('skillId', '==', skillId)
      .get();

    const batch = db.batch();
    credentialsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { 
        isRevoked: true, 
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: adminUserId,
      });
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Reset progress for skill ${skillId} and revoked ${credentialsSnapshot.size} credential(s)`,
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return NextResponse.json(
      { error: 'Failed to reset progress' },
      { status: 500 }
    );
  }
}
