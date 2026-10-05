import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessor } from '@/lib/services/documents/documentProcessor';

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

    if (!body || typeof body !== 'object' || !('documentId' in body)) {
      return NextResponse.json(
        { error: 'Request body must contain "documentId".' },
        { status: 400 }
      );
    }

    const { documentId } = body as { documentId: unknown };

    if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
      return NextResponse.json(
        { error: '"documentId" must be a valid non-empty string.' },
        { status: 400 }
      );
    }

    // Process document through the extraction & question bank pipeline
    const result = await DocumentProcessor.processDocument(documentId.trim());

    if (result.status === 'failed') {
      return NextResponse.json(
        {
          error: 'Document processing encountered errors.',
          details: result.errors,
          result,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        message: 'Document processed successfully.',
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /api/documents/process] Error:', errorMsg);

    return NextResponse.json(
      {
        error: errorMsg || 'An unexpected error occurred while processing the document.',
      },
      { status: 500 }
    );
  }
}
