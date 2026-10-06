import { createAdminClient } from '@/lib/supabase/admin';
import { TetTestService } from './tetTestService';

export interface StartAttemptResult {
  attemptId: string;
  testId: string;
  startedAt: string;
  durationMinutes: number;
  remainingSeconds: number;
}

export interface AttemptState {
  attemptId: string;
  testId: string;
  status: 'in_progress' | 'completed' | 'expired';
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number;
  remainingSeconds: number;
  answers: Record<number, number>;
}

export interface AttemptReviewItem {
  question_id: number;
  question_order: number;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  selected_option: number | null;
  correct_option: number;
  is_correct: boolean | null;
}

export interface SubmitAttemptResult {
  attemptId: string;
  testId: string;
  score: number;
  totalMarks: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  completedAt: string;
  status: 'completed' | 'expired';
}

interface LocalAttemptRecord {
  id: string;
  test_id: string;
  user_id: string | null;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_marks: number;
  status: 'in_progress' | 'completed' | 'expired';
}

const localAttempts = new Map<string, LocalAttemptRecord>();
const localAnswers = new Map<string, Map<number, { selected_option: number; is_correct: boolean }>>();

export class TetAttemptService {
  private static getClient() {
    const supabase = createAdminClient();
    if (!supabase) throw new Error('Supabase client is not configured.');
    return supabase;
  }

  private static async getAttemptRow(attemptId: string) {
    const local = localAttempts.get(attemptId);
    if (local) return local;

    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('tet_attempts')
      .select('id,test_id,user_id,started_at,completed_at,score,total_marks,status')
      .eq('id', attemptId)
      .single();

    if (error || !data) throw new Error('Attempt not found.');
    return data;
  }

  private static getRemainingSeconds(startedAt: string, durationMinutes: number) {
    const endMs = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    return Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
  }

  static async startAttempt(testId: string, userId?: string | null): Promise<StartAttemptResult> {
    const test = await TetTestService.getTest(testId);

    if (test.questions.length !== test.test.total_questions) {
      throw new Error('Test configuration is incomplete.');
    }

    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from('tet_attempts')
        .insert({
          test_id: testId,
          user_id: userId || null,
          total_marks: test.test.total_questions,
        })
        .select('id,test_id,started_at')
        .single();

      if (!error && data) {
        return {
          attemptId: data.id,
          testId: data.test_id,
          startedAt: data.started_at,
          durationMinutes: test.test.duration_minutes,
          remainingSeconds: this.getRemainingSeconds(data.started_at, test.test.duration_minutes),
        };
      }
    } catch (err) {
      console.warn('[TetAttemptService.startAttempt] Supabase insert warning:', err);
    }

    // Fallback: local session attempt store
    const fallbackId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    localAttempts.set(fallbackId, {
      id: fallbackId,
      test_id: testId,
      user_id: userId || null,
      started_at: startedAt,
      completed_at: null,
      score: null,
      total_marks: test.test.total_questions,
      status: 'in_progress',
    });
    localAnswers.set(fallbackId, new Map());

    return {
      attemptId: fallbackId,
      testId,
      startedAt,
      durationMinutes: test.test.duration_minutes,
      remainingSeconds: this.getRemainingSeconds(startedAt, test.test.duration_minutes),
    };
  }

  static async getAttemptState(attemptId: string): Promise<AttemptState> {
    const attempt = await this.getAttemptRow(attemptId);
    const test = await TetTestService.getTest(attempt.test_id);

    let status = attempt.status as AttemptState['status'];
    let remainingSeconds =
      status === 'in_progress'
        ? this.getRemainingSeconds(attempt.started_at, test.test.duration_minutes)
        : 0;

    if (status === 'in_progress' && remainingSeconds <= 0) {
      await this.submitAttempt(attemptId, true);
      status = 'expired';
      remainingSeconds = 0;
    }

    let answersMap: Record<number, number> = {};
    if (localAnswers.has(attemptId)) {
      const stored = localAnswers.get(attemptId)!;
      answersMap = Object.fromEntries(
        Array.from(stored.entries()).map(([qId, val]) => [qId, val.selected_option])
      );
    } else {
      const supabase = this.getClient();
      const { data: answers, error } = await supabase
        .from('tet_attempt_answers')
        .select('question_id,selected_option')
        .eq('attempt_id', attemptId);

      if (error) throw new Error(error.message);
      answersMap = Object.fromEntries(
        (answers || []).map((row) => [row.question_id, row.selected_option])
      );
    }

    return {
      attemptId,
      testId: attempt.test_id,
      status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      durationMinutes: test.test.duration_minutes,
      remainingSeconds,
      answers: answersMap,
    };
  }

  static async saveAnswer(
    attemptId: string,
    questionId: number,
    selectedOption: number
  ) {
    if (!Number.isInteger(selectedOption) || selectedOption < 1 || selectedOption > 4) {
      throw new Error('Selected option must be between 1 and 4.');
    }

    const attempt = await this.getAttemptRow(attemptId);
    if (attempt.status !== 'in_progress') {
      throw new Error('This attempt is already closed.');
    }

    const test = await TetTestService.getTest(attempt.test_id);
    const remainingSeconds = this.getRemainingSeconds(attempt.started_at, test.test.duration_minutes);
    if (remainingSeconds <= 0) {
      await this.submitAttempt(attemptId, true);
      throw new Error('Time has expired. The test was submitted automatically.');
    }

    const linkedQuestion = test.questions.find((q) => q.question_id === questionId);
    if (!linkedQuestion) throw new Error('Question does not belong to this test.');

    const isCorrect = selectedOption === linkedQuestion.correct_option;
    const correctOption = linkedQuestion.correct_option;

    const localAns = localAnswers.get(attemptId);
    if (localAns) {
      localAns.set(questionId, {
        selected_option: selectedOption,
        is_correct: isCorrect,
      });
      return {
        saved: true,
        isCorrect,
        correctOption,
        selectedOption,
      };
    }

    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from('tet_attempt_answers')
        .upsert(
          {
            attempt_id: attemptId,
            question_id: questionId,
            selected_option: selectedOption,
            is_correct: isCorrect,
            answered_at: new Date().toISOString(),
          },
          { onConflict: 'attempt_id,question_id' }
        );

      if (error) {
        console.warn('[TetAttemptService.saveAnswer] Supabase answer note:', error.message);
        if (!localAnswers.has(attemptId)) localAnswers.set(attemptId, new Map());
        localAnswers.get(attemptId)!.set(questionId, {
          selected_option: selectedOption,
          is_correct: isCorrect,
        });
      }
    } catch (err) {
      console.warn('[TetAttemptService.saveAnswer] Upsert fallback:', err);
      if (!localAnswers.has(attemptId)) localAnswers.set(attemptId, new Map());
      localAnswers.get(attemptId)!.set(questionId, {
        selected_option: selectedOption,
        is_correct: isCorrect,
      });
    }

    return {
      saved: true,
      isCorrect,
      correctOption,
      selectedOption,
    };
  }

  static async submitAttempt(
    attemptId: string,
    expired = false
  ): Promise<SubmitAttemptResult> {
    const attempt = await this.getAttemptRow(attemptId);
    if (attempt.status !== 'in_progress') {
      throw new Error('This attempt has already been submitted.');
    }

    const test = await TetTestService.getTest(attempt.test_id);
    const serverExpired =
      this.getRemainingSeconds(attempt.started_at, test.test.duration_minutes) <= 0;
    const completedAt = new Date().toISOString();
    const status = expired || serverExpired ? 'expired' : 'completed';
    const total = test.test.total_questions;

    const localAns = localAnswers.get(attemptId);
    if (localAns) {
      const rows = Array.from(localAns.values());
      const correct = rows.filter((r) => r.is_correct === true).length;
      const answered = rows.length;
      const unanswered = Math.max(total - answered, 0);
      const incorrect = Math.max(answered - correct, 0);

      attempt.status = status;
      attempt.completed_at = completedAt;
      attempt.score = correct;

      return {
        attemptId,
        testId: attempt.test_id,
        score: correct,
        totalMarks: total,
        answered,
        correct,
        incorrect,
        unanswered,
        completedAt,
        status,
      };
    }

    const supabase = this.getClient();
    const { data: answers, error: answerError } = await supabase
      .from('tet_attempt_answers')
      .select('question_id,selected_option,is_correct')
      .eq('attempt_id', attemptId);

    if (answerError) throw new Error(answerError.message);

    const rows = answers || [];
    const correct = rows.filter((row) => row.is_correct === true).length;
    const answered = rows.length;
    const unanswered = Math.max(total - answered, 0);
    const incorrect = Math.max(answered - correct, 0);

    const { error: updateError } = await supabase
      .from('tet_attempts')
      .update({
        score: correct,
        completed_at: completedAt,
        status,
      })
      .eq('id', attemptId)
      .eq('status', 'in_progress');

    if (updateError) throw new Error(updateError.message);

    return {
      attemptId,
      testId: attempt.test_id,
      score: correct,
      totalMarks: total,
      answered,
      correct,
      incorrect,
      unanswered,
      completedAt,
      status,
    };
  }

  static async getCompletedReview(attemptId: string): Promise<{
    result: SubmitAttemptResult;
    review: AttemptReviewItem[];
  }> {
    const attempt = await this.getAttemptRow(attemptId);
    if (attempt.status === 'in_progress') {
      throw new Error('Test has not been submitted yet.');
    }

    const test = await TetTestService.getTest(attempt.test_id);
    const total = test.test.total_questions;

    const localAns = localAnswers.get(attemptId);
    if (localAns) {
      const rows = Array.from(localAns.values());
      const correct = rows.filter((r) => r.is_correct === true).length;
      const answered = rows.length;

      const result: SubmitAttemptResult = {
        attemptId,
        testId: attempt.test_id,
        score: attempt.score ?? correct,
        totalMarks: total,
        answered,
        correct,
        incorrect: Math.max(answered - correct, 0),
        unanswered: Math.max(total - answered, 0),
        completedAt: attempt.completed_at || new Date().toISOString(),
        status: attempt.status as 'completed' | 'expired',
      };

      return {
        result,
        review: test.questions.map((question) => {
          const answer = localAns.get(question.question_id);
          return {
            question_id: question.question_id,
            question_order: question.question_order,
            subject: question.subject,
            question: question.question,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            selected_option: answer?.selected_option ?? null,
            correct_option: question.correct_option,
            is_correct: answer?.is_correct ?? null,
          };
        }),
      };
    }

    const supabase = this.getClient();
    const { data: answers, error } = await supabase
      .from('tet_attempt_answers')
      .select('question_id,selected_option,is_correct')
      .eq('attempt_id', attemptId);

    if (error) throw new Error(error.message);

    const answerMap = new Map(
      (answers || []).map((row) => [
        row.question_id,
        {
          selected_option: row.selected_option,
          is_correct: row.is_correct,
        },
      ])
    );

    const correct = (answers || []).filter((row) => row.is_correct === true).length;
    const answered = (answers || []).length;

    const result: SubmitAttemptResult = {
      attemptId,
      testId: attempt.test_id,
      score: attempt.score ?? correct,
      totalMarks: total,
      answered,
      correct,
      incorrect: Math.max(answered - correct, 0),
      unanswered: Math.max(total - answered, 0),
      completedAt: attempt.completed_at || new Date().toISOString(),
      status: attempt.status as 'completed' | 'expired',
    };

    return {
      result,
      review: test.questions.map((question) => {
        const answer = answerMap.get(question.question_id);
        return {
          question_id: question.question_id,
          question_order: question.question_order,
          subject: question.subject,
          question: question.question,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          selected_option: answer?.selected_option ?? null,
          correct_option: question.correct_option,
          is_correct: answer?.is_correct ?? null,
        };
      }),
    };
  }
}
