import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface RoundResult {
  round: string;
  score: number;
  maxScore: number;
  percentage: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { skill, rounds, userId } = await request.json();

    if (!skill || !rounds || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify all rounds passed
    const allPassed = rounds.every((r: RoundResult) => r.percentage >= 70);
    
    if (!allPassed) {
      return NextResponse.json({ error: 'Not all rounds passed' }, { status: 400 });
    }

    // Generate blockchain-style hash
    const hashInput = `${userId}-${skill}-${Date.now()}-${Math.random()}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Generate credential
    const credential = {
      id: `cred-${Date.now()}`,
      userId,
      skill,
      title: skill.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      blockchainHash: hash,
      rounds: rounds.map((r: RoundResult) => ({
        round: r.round,
        score: r.score,
        percentage: r.percentage,
      })),
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: true,
      views: 0,
    };

    return NextResponse.json({
      success: true,
      credential,
      verificationUrl: `/verify/${hash}`,
    });
  } catch (error) {
    console.error('Credential generation error:', error);
    return NextResponse.json({ error: 'Failed to generate credential' }, { status: 500 });
  }
}
