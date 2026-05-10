import { NextRequest, NextResponse } from 'next/server';
import { mockQuestions } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;
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
