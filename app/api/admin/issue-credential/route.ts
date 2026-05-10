import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { generateBlockchainHash } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const { userId, skillId, skillName, finalScore, roundScores, adminUserId } = await request.json();

    if (!userId || !skillId || !skillName || finalScore === undefined || !roundScores || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Generate blockchain hash
    const blockchainHash = generateBlockchainHash({
      credentialId: `cred-${userId}-${skillId}-${Date.now()}`,
      recipientId: userId,
      timestamp: new Date().toISOString(),
    });

    // Create credential document
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const credentialRef = await db.collection('credentials').add({
      userId,
      skillId,
      skillTitle: skillName,
      blockchainHash,
      rounds: roundScores,
      issuedAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      isVerified: true,
      isManuallyIssued: true,
      issuedBy: adminUserId,
      views: 0,
      shareCount: 0,
    });

    // Update user's skill progress to completed
    await userRef.update({
      [`skills.${skillId}`]: { 
        roundsCompleted: [1, 2, 3],
        finalScore,
        credentialHash: blockchainHash,
        completedAt: FieldValue.serverTimestamp(),
      },
    });

    return NextResponse.json({
      success: true,
      credentialId: credentialRef.id,
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
