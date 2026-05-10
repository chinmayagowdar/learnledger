import { NextRequest, NextResponse } from 'next/server';
import { mockAssessments } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from Firestore
    // For demo, return mock data
    return NextResponse.json({
      success: true,
      data: mockAssessments,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
