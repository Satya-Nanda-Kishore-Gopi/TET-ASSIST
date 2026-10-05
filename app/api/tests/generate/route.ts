import { NextRequest, NextResponse } from 'next/server';
import { TestGenerator } from '@/lib/services/tests/testGenerator';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object.' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      testType = 'official',
      documentId,
      subject,
      durationMinutes = 150,
      limit,
    } = body as {
      title?: string;
      description?: string;
      testType?: 'official' | 'previous_year' | 'model' | 'practice' | 'mock';
      documentId?: string;
      subject?: string;
      durationMinutes?: number;
      limit?: number;
    };

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Test title is required.' },
        { status: 400 }
      );
    }

    const result = await TestGenerator.generateTest({
      title: title.trim(),
      description,
      testType,
      documentId,
      subject,
      durationMinutes,
      limit,
    });

    return NextResponse.json(
      {
        message: 'Test generated successfully from question bank.',
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /api/tests/generate] Error:', errorMsg);

    return NextResponse.json(
      { error: errorMsg || 'Failed to generate test.' },
      { status: 500 }
    );
  }
}
