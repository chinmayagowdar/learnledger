import { NextRequest, NextResponse } from 'next/server';
import { mockCredentials, mockUser } from '@/lib/mock-data';
import { generateBlockchainHash } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockCredentials,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, score, title, issuer } = body;

    const newCredential = {
      id: `cred-${Date.now()}`,
      title,
      issuer,
      credentialId: `CRED-${Date.now()}`,
      blockchainHash: generateBlockchainHash({
        credentialId: `CRED-${Date.now()}`,
        userId: mockUser.id,
        timestamp: new Date().toISOString(),
      }),
      date: new Date().toISOString().split('T')[0],
      assessmentId,
      score,
      isVerified: true,
      views: 0,
      shareCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: newCredential,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create credential' },
      { status: 500 }
    );
  }
}
