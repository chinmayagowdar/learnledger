import { NextRequest, NextResponse } from 'next/server';
import { mockQuestions } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const questions = mockQuestions[assessmentId as keyof typeof mockQuestions] || [];

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
