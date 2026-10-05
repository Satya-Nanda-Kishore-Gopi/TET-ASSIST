import { createAdminClient } from '@/lib/supabase/admin';

export interface TetTest {
  id: string;
  title: string;
  description: string | null;
  test_type: string;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
}

export interface TetQuestion {
  question_id: number;
  subject: string;
  question_number: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  question_order: number;
}

export interface TetTestWithQuestions {
  test: TetTest;
  questions: TetQuestion[];
}

export class TetTestService {
  static readonly PAPER_1A_TEST_ID =
    'c97f31ea-1125-4ff7-84bc-d9e52f2c3803';

  private static getClient() {
    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }
    return supabase;
  }

  static async getTest(testId: string): Promise<TetTestWithQuestions> {
    const supabase = this.getClient();

    const { data: test, error: testError } = await supabase
      .from('tet_tests')
      .select('id,title,description,test_type,duration_minutes,total_questions,created_at')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      throw new Error(testError?.message || 'TET test not found.');
    }

    const { data: links, error: linkError } = await supabase
      .from('tet_test_questions')
      .select('question_id,question_order')
      .eq('test_id', testId)
      .order('question_order', { ascending: true });

    if (linkError) {
      throw new Error(`Failed to load test questions: ${linkError.message}`);
    }

    const questionIds = (links || []).map((row) => row.question_id);

    if (questionIds.length === 0) {
      return { test, questions: [] };
    }

    const { data: questions, error: questionError } = await supabase
      .from('question_bank')
      .select(
        'question_id,subject,question_number,question,option_a,option_b,option_c,option_d,correct_option'
      )
      .in('question_id', questionIds);

    if (questionError) {
      throw new Error(`Failed to load question bank: ${questionError.message}`);
    }

    const byId = new Map(
      (questions || []).map((question) => [question.question_id, question])
    );

    const orderedQuestions: TetQuestion[] = (links || [])
      .map((link) => {
        const question = byId.get(link.question_id);
        if (!question) return null;

        return {
          ...question,
          question_order: link.question_order,
        };
      })
      .filter((question): question is TetQuestion => question !== null);

    if (orderedQuestions.length !== questionIds.length) {
      throw new Error('One or more linked questions are missing from question_bank.');
    }

    return {
      test,
      questions: orderedQuestions,
    };
  }

  static async getCurrentPaper1A(): Promise<TetTestWithQuestions> {
    return this.getTest(this.PAPER_1A_TEST_ID);
  }
}
