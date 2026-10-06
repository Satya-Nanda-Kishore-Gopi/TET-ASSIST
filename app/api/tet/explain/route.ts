import { NextRequest, NextResponse } from 'next/server';
import { GeminiChatService } from '@/lib/services/gemini/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      options,
      correctOption,
      selectedOption,
      subject,
      questionContext,
      language,
    } = body;

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
      !normalizedOptions.d ||
      !Number.isInteger(Number(correctOption)) ||
      !Number.isInteger(Number(selectedOption))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required question parameters for explanation.',
        },
        { status: 400 }
      );
    }

    const { explanation } = await GeminiChatService.generateExplanation({
      question,
      options: normalizedOptions,
      correctOption: Number(correctOption),
      selectedOption: Number(selectedOption),
      subject: subject || 'Special APTET Pedagogy',
      questionContext,
      language: language === 'te' ? 'te' : 'en',
    });

    return NextResponse.json({ success: true, explanation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate explanation.';
    console.error('[API /api/tet/explain]', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
