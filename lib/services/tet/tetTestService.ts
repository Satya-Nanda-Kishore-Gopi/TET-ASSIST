import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_TESTS_1A, getMockTestWithQuestions } from './paper1AQuestions';

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
    try {
      const supabase = this.getClient();

      const { data: test, error: testError } = await supabase
        .from('tet_tests')
        .select('id,title,description,test_type,duration_minutes,total_questions,created_at')
        .eq('id', testId)
        .single();

      if (!testError && test) {
        const { data: links, error: linkError } = await supabase
          .from('tet_test_questions')
          .select('question_id,question_order')
          .eq('test_id', testId)
          .order('question_order', { ascending: true });

        if (!linkError && links && links.length > 0) {
          const questionIds = links.map((row) => row.question_id);

          const { data: questions, error: questionError } = await supabase
            .from('question_bank')
            .select(
              'question_id,subject,question_number,question,option_a,option_b,option_c,option_d,correct_option'
            )
            .in('question_id', questionIds);

          if (!questionError && questions && questions.length === questionIds.length) {
            const byId = new Map(
              questions.map((question) => [question.question_id, question])
            );

            const orderedQuestions: TetQuestion[] = links
              .map((link) => {
                const question = byId.get(link.question_id);
                if (!question) return null;

                return {
                  ...question,
                  question_order: link.question_order,
                };
              })
              .filter((question): question is TetQuestion => question !== null);

            if (orderedQuestions.length === questionIds.length) {
              return {
                test,
                questions: orderedQuestions,
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn('[TetTestService.getTest] Supabase notice:', err);
    }

    const fallbackTest = getMockTestWithQuestions(testId);
    if (fallbackTest) {
      return fallbackTest;
    }

    throw new Error('TET test not found.');
  }

  static async listPaper1AMockTests(): Promise<TetTest[]> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from('tet_tests')
        .select('id,title,description,test_type,duration_minutes,total_questions,created_at')
        .in('test_type', ['PAPER_1A_MOCK', 'PAPER_1A'])
        .order('title', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[TetTestService.listPaper1AMockTests] Database query notice:', err);
    }

    return MOCK_TESTS_1A;
  }

  static async getCurrentPaper1A(): Promise<TetTestWithQuestions> {
    return this.getTest(this.PAPER_1A_TEST_ID);
  }
}
