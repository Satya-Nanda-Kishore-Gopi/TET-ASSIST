export type ExamType = 'Special APTET' | 'APTET General';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  exam: ExamType;
  targetScore: number | null;
  preferredLanguage: 'telugu' | 'english' | 'bilingual';
  dailyStudyHours: number | null;
  examDate?: string | null;
}

export type ChatMode = 'APTET Assistant' | 'APTET Material' | 'My PDF' | 'General AI';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  teluguContent?: string;
  timestamp: string;
  mode?: ChatMode;
  attachments?: string[];
}

export type TestCategory =
  | 'official'
  | 'previous'
  | 'model'
  | 'practice'
  | 'mock';

export interface TestPaper {
  id: string;
  code: string;
  title: string;
  teluguTitle?: string;
  category: TestCategory;
  paperType: 'Paper I (Classes I to V - Special Education)' | 'Paper II (Classes VI to VIII - Special Education)';
  year?: number;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  isLocked: boolean;
  status: 'available' | 'locked' | 'coming_soon';
  subjects: string[];
}

export interface StudyTopic {
  id: string;
  name: string;
  teluguName?: string;
  subject: string;
  category: 'important' | 'concept' | 'revision' | 'frequent' | 'weak';
  frequencyScore?: number;
  masteryPercentage?: number;
  recommendedTimeMinutes?: number;
}

export interface StudyPlanItem {
  id: string;
  dayNumber: number;
  date?: string;
  title: string;
  teluguTitle?: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface PreparationMetrics {
  preparationPercentage: number;
  testsCompleted: number;
  averageScore: number | null;
  totalTimeMinutes: number;
  streakDays: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  teluguTitle?: string;
  category: 'official_material' | 'user_document';
  sizeBytes?: number;
  pagesCount?: number;
  uploadedAt?: string;
  isPreloaded: boolean;
}
