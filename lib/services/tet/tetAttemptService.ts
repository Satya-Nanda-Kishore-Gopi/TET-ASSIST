import { createAdminClient } from '@/lib/supabase/admin';
import { TetTestService } from './tetTestService';

export interface StartAttemptResult {
  attemptId: string;
  testId: string;
  startedAt: string;
  durationMinutes: number;
}

export interface SubmitAttemptResult {
  attemptId: string;
  score: number;
  totalMarks: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  completedAt: string;
  status: 'completed' | 'expired';
}

export class TetAttemptService {
  private static getClient() {
    const supabase = createAdminClient();
    if (!supabase) throw new Error('Supabase client is not configured.');
    return supabase;
  }

  static async startAttempt(testId: string, userId?: string | null): Promise<StartAttemptResult> {
    const supabase = this.getClient();
    const test = await TetTestService.getTest(testId);

    if (test.questions.length !== test.test.total_questions) {
      throw new Error('Test configuration is incomplete.');
    }

    const { data, error } = await supabase
      .from('tet_attempts')
      .insert({
        test_id: testId,
        user_id: userId || null,
        total_marks: test.test.total_questions,
      })
      .select('id,test_id,started_at')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to start test attempt.');
    }

    return {
      attemptId: data.id,
      testId: data.test_id,
      startedAt: data.started_at,
      durationMinutes: test.test.duration_minutes,
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

    const supabase = this.getClient();

    const { data: attempt, error: attemptError } = await supabase
      .from('tet_attempts')
      .select('id,test_id,status')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Attempt not found.');
    }

    if (attempt.status !== 'in_progress') {
      throw new Error('This attempt is already closed.');
    }

    const { data: question, error: questionError } = await supabase
      .from('question_bank')
      .select('question_id,correct_option')
      .eq('question_id', questionId)
      .single();

    if (questionError || !question) {
      throw new Error('Question not found.');
    }

    const { error } = await supabase
      .from('tet_attempt_answers')
      .upsert(
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct: selectedOption === question.correct_option,
          answered_at: new Date().toISOString(),
        },
        { onConflict: 'attempt_id,question_id' }
      );

    if (error) throw new Error(error.message);

    return { saved: true };
  }

  static async submitAttempt(
    attemptId: string,
    expired = false
  ): Promise<SubmitAttemptResult> {
    const supabase = this.getClient();

    const { data: attempt, error: attemptError } = await supabase
      .from('tet_attempts')
      .select('id,test_id,status')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) throw new Error('Attempt not found.');

    if (attempt.status !== 'in_progress') {
      throw new Error('This attempt has already been submitted.');
    }

    const test = await TetTestService.getTest(attempt.test_id);

    const { data: answers, error: answerError } = await supabase
      .from('tet_attempt_answers')
      .select('question_id,selected_option,is_correct')
      .eq('attempt_id', attemptId);

    if (answerError) throw new Error(answerError.message);

    const rows = answers || [];
    const correct = rows.filter((row) => row.is_correct === true).length;
    const answered = rows.length;
    const total = test.test.total_questions;
    const unanswered = Math.max(total - answered, 0);
    const incorrect = Math.max(answered - correct, 0);
    const completedAt = new Date().toISOString();
    const status = expired ? 'expired' : 'completed';

    const { error: updateError } = await supabase
      .from('tet_attempts')
      .update({
        score: correct,
        completed_at: completedAt,
        status,
      })
      .eq('id', attemptId);

    if (updateError) throw new Error(updateError.message);

    return {
      attemptId,
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
}
