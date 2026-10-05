import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { DatabaseTest, TestType } from '@/lib/supabase/types';

export interface GenerateTestOptions {
  title: string;
  description?: string;
  testType: TestType;
  documentId?: string;
  subject?: string;
  durationMinutes?: number;
  questionIds?: string[];
  limit?: number;
}

export interface GeneratedTestResult {
  test: DatabaseTest;
  questionCount: number;
  questionIds: string[];
}

export class TestGenerator {
  /**
   * Generates a structured Test in Supabase by linking questions from the Question Bank
   */
  static async generateTest(options: GenerateTestOptions): Promise<GeneratedTestResult> {
    const supabase = createAdminClient() || createClient();

    if (!supabase) {
      throw new Error('Supabase client is not available.');
    }

    let selectedQuestionIds: string[] = [];

    if (options.questionIds && options.questionIds.length > 0) {
      selectedQuestionIds = options.questionIds;
    } else if (options.documentId) {
      // Fetch all questions from the specific source document
      const { data: questions, error: qErr } = await supabase
        .from('questions')
        .select('id, question_number')
        .eq('document_id', options.documentId)
        .order('question_number', { ascending: true });

      if (qErr) {
        throw new Error(`Failed to query questions for document: ${qErr.message}`);
      }

      selectedQuestionIds = (questions || []).map((q: { id: string }) => q.id);
    } else if (options.subject) {
      // Fetch questions by subject
      const query = supabase
        .from('questions')
        .select('id')
        .ilike('subject', `%${options.subject}%`)
        .limit(options.limit || 30);

      const { data: questions } = await query;
      selectedQuestionIds = (questions || []).map((q: { id: string }) => q.id);
    } else {
      // General selection
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .limit(options.limit || 30);

      selectedQuestionIds = (questions || []).map((q: { id: string }) => q.id);
    }

    // Insert Test into 'tests' table
    const { data: testData, error: testError } = await supabase
      .from('tests')
      .insert({
        title: options.title,
        description: options.description || null,
        test_type: options.testType,
        document_id: options.documentId || null,
        subject: options.subject || 'All Subjects',
        duration_minutes: options.durationMinutes || 150,
        total_questions: selectedQuestionIds.length,
      })
      .select()
      .single();

    if (testError || !testData) {
      throw new Error(`Failed to create test record: ${testError?.message}`);
    }

    // Link Questions into 'test_questions' table
    if (selectedQuestionIds.length > 0) {
      const testQuestionRows = selectedQuestionIds.map((qId, index) => ({
        test_id: testData.id,
        question_id: qId,
        question_order: index + 1,
      }));

      const { error: linkError } = await supabase
        .from('test_questions')
        .insert(testQuestionRows);

      if (linkError) {
        console.warn('Warning: Could not link test_questions:', linkError.message);
      }
    }

    return {
      test: testData as DatabaseTest,
      questionCount: selectedQuestionIds.length,
      questionIds: selectedQuestionIds,
    };
  }

  /**
   * Generates an official test paper automatically whenever an official document is processed
   */
  static async generateOfficialTestFromDocument(
    documentId: string,
    documentTitle: string,
    _year?: number
  ): Promise<GeneratedTestResult> {
    return this.generateTest({
      title: `${documentTitle} • Official Simulation`,
      description: `Official Special APTET examination paper with verified questions from the Department of School Education.`,
      testType: 'official',
      documentId,
      subject: 'All Subjects',
      durationMinutes: 150,
    });
  }

  /**
   * Retrieves tests from the database, falling back to curated tests if database is empty
   */
  static async getTests(testType?: TestType): Promise<DatabaseTest[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const supabase = createClient();
      if (!supabase) return [];

      let query = supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data as DatabaseTest[];
    } catch {
      return [];
    }
  }
}
