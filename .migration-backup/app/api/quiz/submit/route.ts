import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { skill, round, answers } = await request.json();

    if (!skill || !round || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate score
    let score = 0;
    const maxScore = Object.keys(answers).length;

    // In a real app, you'd verify answers against your database
    Object.entries(answers).forEach(([questionId, selectedIndex]) => {
      // This is simplified - in production, validate against stored questions
      if (selectedIndex !== null) {
        score += 1;
      }
    });

    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= 70;

    return NextResponse.json({
      success: true,
      score,
      maxScore,
      percentage,
      passed,
      skill,
      round,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Failed to process quiz submission' }, { status: 500 });
  }
}
