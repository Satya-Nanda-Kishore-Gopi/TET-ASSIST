/**
 * Supabase Database Entity Definitions for TET Assist
 */

export type DocumentType =
  | 'government_paper'
  | 'previous_year'
  | 'model_paper'
  | 'question_bank'
  | 'answer_key'
  | 'syllabus'
  | 'study_material'
  | 'user_pdf';

export type ExamIdentifier =
  | 'special_aptet'
  | 'aptet'
  | 'ctet'
  | 'other';

export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'processed'
  | 'failed';

export type TestType =
  | 'official'
  | 'previous_year'
  | 'model'
  | 'practice'
  | 'mock';

export type QuestionOption = 'A' | 'B' | 'C' | 'D';

export interface DatabaseDocument {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  storage_path: string;
  document_type: DocumentType;
  subject: string | null;
  exam: ExamIdentifier;
  year: number | null;
  language: string;
  status: DocumentStatus;
  user_id?: string | null;
  related_document_id?: string | null;
  raw_text?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseQuestion {
  id: string;
  document_id: string | null;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: QuestionOption | null;
  subject: string | null;
  topic: string | null;
  subtopic: string | null;
  year: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  explanation: string | null;
  confidence?: 'high' | 'medium' | 'low';
  fingerprint?: string | null;
  created_at: string;
}

export interface DatabaseSubject {
  id: string;
  name: string;
  display_name: string;
  exam: ExamIdentifier | string;
  created_at: string;
}

export interface DatabaseTopic {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DatabaseQuestionTopic {
  question_id: string;
  topic_id: string;
}

export interface DatabaseTest {
  id: string;
  title: string;
  description: string | null;
  test_type: TestType;
  document_id: string | null;
  subject: string | null;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
}

export interface DatabaseTestQuestion {
  test_id: string;
  question_id: string;
  question_order: number;
}

export interface DatabaseUserTestAttempt {
  id: string;
  user_id: string | null;
  test_id: string;
  score: number | null;
  total_marks: number;
  started_at: string;
  completed_at: string | null;
}

export interface DatabaseUserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: QuestionOption | string;
  is_correct: boolean | null;
  created_at: string;
}
