import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseDocument, DocumentType } from '@/lib/supabase/types';

export interface DocumentFilter {
  exam?: string;
  documentType?: DocumentType;
  status?: string;
}

export interface DocumentProcessResponse {
  documentId: string;
  status: 'processed' | 'failed';
  pageCount: number;
  questionsFound: number;
  questionsInserted: number;
  questionsSkipped: number;
  errors: string[];
}

export class DocumentService {
  /**
   * Curated default documents for Special APTET when database is newly initialized or offline
   */
  private static fallbackMaterials: DatabaseDocument[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Special APTET Official Question Paper 2024 (Paper I)',
      description: 'Department of School Education official paper covering Child Development & Special Pedagogy, Language I & II, Math, and EVS.',
      file_name: 'special_aptet_paper1_2024.pdf',
      storage_path: 'special-aptet/government/special_aptet_paper1_2024.pdf',
      document_type: 'government_paper',
      subject: 'Child Development & Pedagogy (Special Education)',
      exam: 'special_aptet',
      year: 2024,
      language: 'Telugu & English',
      status: 'uploaded',
      metadata: {
        file_size_bytes: 2450000,
        page_count: 16,
      },
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Special APTET Official Answer Key 2024 (Initial Key)',
      description: 'Government-released final validated answer keys for Special APTET Paper I series.',
      file_name: 'special_aptet_key_2024.pdf',
      storage_path: 'special-aptet/government/special_aptet_key_2024.pdf',
      document_type: 'answer_key',
      subject: 'All Subjects',
      exam: 'special_aptet',
      year: 2024,
      language: 'Telugu & English',
      status: 'uploaded',
      metadata: {
        file_size_bytes: 320000,
        page_count: 4,
      },
      created_at: '2024-02-05T00:00:00Z',
      updated_at: '2024-02-05T00:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Special APTET Previous Year Paper 2023',
      description: 'Authentic previous examination paper with detailed questions across inclusive classroom pedagogy and special education.',
      file_name: 'special_aptet_pyq_2023.pdf',
      storage_path: 'special-aptet/previous-year/special_aptet_pyq_2023.pdf',
      document_type: 'previous_year',
      subject: 'Child Development & Pedagogy (Special Education)',
      exam: 'special_aptet',
      year: 2023,
      language: 'Telugu & English',
      status: 'processed',
      metadata: {
        page_count: 14,
        questions_found: 30,
        questions_imported: 30,
        questions_skipped: 0,
      },
      created_at: '2023-11-10T00:00:00Z',
      updated_at: '2023-11-10T00:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      title: 'Child Development & Inclusive Pedagogy Compendium',
      description: 'Foundational concepts on developmental milestones, learning disabilities, RPwD Act 2016, and assistive technologies.',
      file_name: 'child_dev_inclusive_pedagogy.pdf',
      storage_path: 'special-aptet/study-material/child_dev_inclusive_pedagogy.pdf',
      document_type: 'study_material',
      subject: 'Child Development & Pedagogy (Special Education)',
      exam: 'special_aptet',
      year: 2024,
      language: 'Telugu & English',
      status: 'processed',
      metadata: {
        page_count: 24,
        questions_found: 25,
        questions_imported: 25,
      },
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
  ];

  /**
   * Retrieve documents from Supabase with optional filters
   */
  static async getDocuments(filter?: DocumentFilter): Promise<DatabaseDocument[]> {
    if (!isSupabaseConfigured()) {
      return this.filterFallbackMaterials(filter);
    }

    try {
      const supabase = createClient();
      if (!supabase) return this.filterFallbackMaterials(filter);

      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.exam) {
        query = query.eq('exam', filter.exam);
      }
      if (filter?.documentType) {
        query = query.eq('document_type', filter.documentType);
      }
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Return fallback preloaded material if database table is empty
        return this.filterFallbackMaterials(filter);
      }

      return data as DatabaseDocument[];
    } catch {
      return this.filterFallbackMaterials(filter);
    }
  }

  /**
   * Retrieve a specific document by its ID
   */
  static async getDocumentById(id: string): Promise<DatabaseDocument | null> {
    if (!isSupabaseConfigured()) {
      return this.fallbackMaterials.find((d) => d.id === id) || null;
    }

    try {
      const supabase = createClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return this.fallbackMaterials.find((d) => d.id === id) || null;
      }

      return data as DatabaseDocument;
    } catch {
      return null;
    }
  }

  /**
   * Triggers server-side PDF processing pipeline for a specific document
   */
  static async triggerProcessing(documentId: string): Promise<DocumentProcessResponse> {
    const res = await fetch('/api/documents/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to process document');
    }

    return data.result as DocumentProcessResponse;
  }

  /**
   * Upload document via server API
   */
  static async uploadDocumentViaApi(formData: FormData): Promise<DatabaseDocument> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Document upload failed.');
    }

    return data.document as DatabaseDocument;
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase credentials not configured.');
    }

    const supabase = createClient();
    if (!supabase) throw new Error('Supabase client unavailable.');

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  private static filterFallbackMaterials(filter?: DocumentFilter): DatabaseDocument[] {
    return this.fallbackMaterials.filter((item) => {
      if (filter?.exam && item.exam !== filter.exam) return false;
      if (filter?.documentType && item.document_type !== filter.documentType) return false;
      if (filter?.status && item.status !== filter.status) return false;
      return true;
    });
  }
}
