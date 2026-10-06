import { createAdminClient } from '@/lib/supabase/admin';

export interface TetHistoryRow {
  attemptId: string;
  testId: string;
  testTitle: string;
  startedAt: string;
  completedAt: string | null;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  status: 'completed' | 'expired';
}

export interface TetAnalysis {
  attempts: TetHistoryRow[];
  summary: {
    testsAttempted: number;
    averageScore: number;
    averagePercentage: number;
    bestScore: number;
    bestPercentage: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
  };
  subjects: Array<{
    subject: string;
    answered: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
    totalQuestions: number;
  }>;
}

export class TetAnalyticsService {
  private static getClient() {
    const client = createAdminClient();
    if (!client) throw new Error('Supabase client is not configured.');
    return client;
  }

  static async getHistory(userId?: string | null): Promise<TetHistoryRow[]> {
    const supabase = this.getClient();
    let query = supabase
      .from('tet_attempts')
      .select('id,test_id,user_id,started_at,completed_at,score,total_marks,status')
      .in('status', ['completed', 'expired'])
      .order('completed_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);

    const { data: attempts, error } = await query;
    if (error) throw new Error(error.message);

    const rows = attempts || [];
    if (!rows.length) return [];

    const testIds = [...new Set(rows.map((a) => a.test_id))];
    const { data: tests, error: testError } = await supabase
      .from('tet_tests')
      .select('id,title')
      .in('id', testIds);

    if (testError) throw new Error(testError.message);

    const titleMap = new Map((tests || []).map((t) => [t.id, t.title]));

    const attemptIds = rows.map((a) => a.id);
    const { data: answers, error: answerError } = await supabase
      .from('tet_attempt_answers')
      .select('attempt_id,is_correct')
      .in('attempt_id', attemptIds);

    if (answerError) throw new Error(answerError.message);

    const answerMap = new Map<string, { correct: number; answered: number }>();
    for (const answer of answers || []) {
      const current = answerMap.get(answer.attempt_id) || { correct: 0, answered: 0 };
      current.answered += 1;
      if (answer.is_correct) current.correct += 1;
      answerMap.set(answer.attempt_id, current);
    }

    return rows.map((attempt) => {
      const counts = answerMap.get(attempt.id) || { correct: 0, answered: 0 };
      const totalMarks = attempt.total_marks || 0;
      const score = attempt.score ?? counts.correct;
      const answered = counts.answered;
      const incorrect = Math.max(answered - counts.correct, 0);
      const unanswered = Math.max(totalMarks - answered, 0);
      const percentage = totalMarks ? Math.round((score / totalMarks) * 100) : 0;

      return {
        attemptId: attempt.id,
        testId: attempt.test_id,
        testTitle: titleMap.get(attempt.test_id) || 'APTET Mock Test',
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
        score,
        totalMarks,
        percentage,
        correct: counts.correct,
        incorrect,
        unanswered,
        status: attempt.status as 'completed' | 'expired',
      };
    });
  }

  static async getAnalysis(userId?: string | null): Promise<TetAnalysis> {
    const history = await this.getHistory(userId);
    if (!history.length) {
      return {
        attempts: [],
        summary: {
          testsAttempted: 0,
          averageScore: 0,
          averagePercentage: 0,
          bestScore: 0,
          bestPercentage: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalUnanswered: 0,
        },
        subjects: [],
      };
    }

    const supabase = this.getClient();
    const attemptIds = history.map((a) => a.attemptId);

    const { data: answers, error: answerError } = await supabase
      .from('tet_attempt_answers')
      .select('attempt_id,question_id,is_correct')
      .in('attempt_id', attemptIds);

    if (answerError) throw new Error(answerError.message);

    const questionIds = [...new Set((answers || []).map((a) => a.question_id))];
    const { data: questions, error: questionError } = await supabase
      .from('question_bank')
      .select('question_id,subject')
      .in('question_id', questionIds);

    if (questionError) throw new Error(questionError.message);

    const subjectMap = new Map((questions || []).map((q) => [q.question_id, q.subject]));
    const { data: testQuestions, error: testQuestionError } = await supabase
      .from('tet_test_questions')
      .select('test_id,question_id')
      .in('test_id', [...new Set(history.map((h) => h.testId))]);

    if (testQuestionError) throw new Error(testQuestionError.message);

    const testQuestionIds = (testQuestions || [])
      .map((row) => row.question_id)
      .filter((id) => subjectMap.has(id));

    const subjects = new Map<string, { answered: number; correct: number; totalQuestions: number }>();

    for (const questionId of testQuestionIds) {
      const subject = subjectMap.get(questionId) || 'Unknown';
      const current = subjects.get(subject) || { answered: 0, correct: 0, totalQuestions: 0 };
      current.totalQuestions += 1;
      subjects.set(subject, current);
    }

    for (const answer of answers || []) {
      const subject = subjectMap.get(answer.question_id) || 'Unknown';
      const current = subjects.get(subject) || { answered: 0, correct: 0, totalQuestions: 0 };
      current.answered += 1;
      if (answer.is_correct) current.correct += 1;
      subjects.set(subject, current);
    }

    const totalCorrect = history.reduce((sum, row) => sum + row.correct, 0);
    const totalIncorrect = history.reduce((sum, row) => sum + row.incorrect, 0);
    const totalUnanswered = history.reduce((sum, row) => sum + row.unanswered, 0);
    const averageScore = Math.round(
      history.reduce((sum, row) => sum + row.score, 0) / history.length
    );
    const averagePercentage = Math.round(
      history.reduce((sum, row) => sum + row.percentage, 0) / history.length
    );
    const best = history.reduce((bestRow, row) =>
      row.percentage > bestRow.percentage ? row : bestRow
    );

    return {
      attempts: history,
      summary: {
        testsAttempted: history.length,
        averageScore,
        averagePercentage,
        bestScore: best.score,
        bestPercentage: best.percentage,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
      },
      subjects: [...subjects.entries()].map(([subject, data]) => ({
        subject,
        answered: data.answered,
        correct: data.correct,
        incorrect: data.answered - data.correct,
        unanswered: Math.max(data.totalQuestions - data.answered, 0),
        accuracy: data.answered
          ? Math.round((data.correct / data.answered) * 100)
          : 0,
        totalQuestions: data.totalQuestions,
      })),
    };
  }
}
