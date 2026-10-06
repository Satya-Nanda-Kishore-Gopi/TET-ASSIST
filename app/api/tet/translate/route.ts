import { NextRequest, NextResponse } from 'next/server';
import { GeminiChatService } from '@/lib/services/gemini/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, options, subject } = body;

    const normalizedOptions = {
      a: options?.a || options?.A || '',
      b: options?.b || options?.B || '',
      c: options?.c || options?.C || '',
      d: options?.d || options?.D || '',
    };

    if (
      !question ||
      !normalizedOptions.a ||
      !normalizedOptions.b ||
      !normalizedOptions.c ||
      !normalizedOptions.d
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required question parameters for translation.',
        },
        { status: 400 }
      );
    }

    const translated = await GeminiChatService.translateQuestionToTelugu({
      question,
      options: normalizedOptions,
      subject: subject || 'Special APTET Pedagogy',
    });

    return NextResponse.json({
      success: true,
      translated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to translate question.';
    console.error('[API /api/tet/translate]', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
