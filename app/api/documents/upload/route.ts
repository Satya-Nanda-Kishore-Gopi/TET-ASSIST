import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DocumentProcessor } from '@/lib/services/documents/documentProcessor';
import { DocumentType } from '@/lib/supabase/types';

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  'government_paper',
  'answer_key',
  'study_material',
  'previous_year',
  'model_paper',
  'user_pdf',
];

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client is not configured on the server.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const documentType = (formData.get('documentType') as DocumentType) || 'government_paper';
    const subject = (formData.get('subject') as string) || 'Child Development & Pedagogy (Special Education)';
    const yearStr = formData.get('year') as string | null;
    const description = (formData.get('description') as string) || '';
    const autoProcess = formData.get('autoProcess') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file was provided in the upload.' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported.' },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Document title is required.' },
        { status: 400 }
      );
    }

    if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Allowed types: ${VALID_DOCUMENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine storage subfolder
    let subfolder = 'government';
    if (documentType === 'previous_year') subfolder = 'previous-year';
    else if (documentType === 'model_paper') subfolder = 'model';
    else if (documentType === 'study_material') subfolder = 'study-material';
    else if (documentType === 'user_pdf') subfolder = 'user';

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const storagePath = `special-aptet/${subfolder}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage bucket 'tet-documents'
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('tet-documents')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Storage upload warning]:', uploadError.message);
      // Even if storage bucket hasn't been set to public in dev, proceed with registering doc
    }

    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

    // Insert record in documents table with fallback if metadata column not yet added
    const insertPayload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      file_name: file.name,
      storage_path: storagePath,
      document_type: documentType,
      subject: subject.trim(),
      exam: 'special_aptet',
      year: isNaN(year) ? 2024 : year,
      language: 'Telugu & English',
      status: 'uploaded',
    };

    let { data: docData, error: dbError } = await supabase
      .from('documents')
      .insert({
        ...insertPayload,
        metadata: {
          file_size_bytes: file.size,
          original_name: file.name,
        },
      })
      .select()
      .single();

    if (dbError && dbError.message.includes("'metadata'")) {
      const fallbackInsert = await supabase
        .from('documents')
        .insert(insertPayload)
        .select()
        .single();
      docData = fallbackInsert.data;
      dbError = fallbackInsert.error;
    }

    if (dbError || !docData) {
      return NextResponse.json(
        { error: `Failed to save document metadata: ${dbError?.message}` },
        { status: 500 }
      );
    }

    let processingResult = null;
    if (autoProcess) {
      try {
        processingResult = await DocumentProcessor.processDocument(docData.id);
      } catch (procErr) {
        console.error('Auto-processing error:', procErr);
      }
    }

    return NextResponse.json(
      {
        message: 'Document uploaded successfully.',
        document: docData,
        processingResult,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /api/documents/upload] Error:', errorMsg);

    return NextResponse.json(
      { error: errorMsg || 'Failed to process document upload.' },
      { status: 500 }
    );
  }
}
