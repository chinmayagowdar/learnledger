import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    if (!hash) {
      return NextResponse.json({ error: 'Hash required' }, { status: 400 });
    }

    // In a real app, look up credential in database by hash
    // For now, return mock verification
    const credential = {
      id: `cred-mock`,
      skill: 'React Advanced',
      title: 'React Advanced Certification',
      blockchainHash: hash,
      issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: true,
      issuer: 'LearnLedger Academy',
      recipientName: 'John Doe',
      recipientEmail: 'john@example.com',
      views: 42,
      score: 92,
    };

    return NextResponse.json({
      success: true,
      verified: true,
      credential,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Failed to verify credential' }, { status: 500 });
  }
}
