import { TestPaper } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseTest } from '@/lib/supabase/types';

export * from './testGenerator';

/**
 * Tests Service Layer
 * Clean boundary for question bank, test generation, test session management, scoring, and response recording
 */
export class TestsService {
  /**
   * Return 10 Official Government Papers
   */
  static getOfficialPapers(): TestPaper[] {
    return Array.from({ length: 10 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `official-paper-${num}`,
        code: `AP-TET-SP-${num}`,
        title: `Test ${num}`,
        teluguTitle: `ప్రభుత్వ అధికారిక పేపర్ ${num}`,
        category: 'official',
        paperType: 'Paper I (Classes I to V - Special Education)',
        totalQuestions: 150,
        totalMarks: 150,
        durationMinutes: 150,
        isLocked: i > 0,
        status: i === 0 ? 'available' : 'coming_soon',
        subjects: [
          'Child Development & Pedagogy (Special Education)',
          'Language I (Telugu)',
          'Language II (English)',
          'Mathematics',
          'Environmental Studies',
        ],
      };
    });
  }

  /**
   * Retrieve previous year papers
   */
  static getPreviousPapers(): TestPaper[] {
    return [
      {
        id: 'prev-paper-2024',
        code: 'APTET-2024-SP',
        title: 'Special APTET Paper - 2024',
        teluguTitle: 'స్పెషల్ ఏపీ టెట్ - 2024',
        category: 'previous',
        paperType: 'Paper I (Classes I to V - Special Education)',
        year: 2024,
        totalQuestions: 150,
        totalMarks: 150,
        durationMinutes: 150,
        isLocked: false,
        status: 'available',
        subjects: ['CDP', 'Telugu', 'English', 'Mathematics', 'EVS'],
      },
      {
        id: 'prev-paper-2023',
        code: 'APTET-2023-SP',
        title: 'Special APTET Paper - 2023',
        teluguTitle: 'స్పెషల్ ఏపీ టెట్ - 2023',
        category: 'previous',
        paperType: 'Paper I (Classes I to V - Special Education)',
        year: 2023,
        totalQuestions: 150,
        totalMarks: 150,
        durationMinutes: 150,
        isLocked: false,
        status: 'available',
        subjects: ['CDP', 'Telugu', 'English', 'Mathematics', 'EVS'],
      },
      {
        id: 'prev-paper-2022',
        code: 'APTET-2022-SP',
        title: 'Special APTET Paper - 2022',
        teluguTitle: 'స్పెషల్ ఏపీ టెట్ - 2022',
        category: 'previous',
        paperType: 'Paper I (Classes I to V - Special Education)',
        year: 2022,
        totalQuestions: 150,
        totalMarks: 150,
        durationMinutes: 150,
        isLocked: true,
        status: 'coming_soon',
        subjects: ['CDP', 'Telugu', 'English', 'Mathematics', 'EVS'],
      },
    ];
  }

  /**
   * Retrieve model papers
   */
  static getModelPapers(): TestPaper[] {
    return [
      {
        id: 'model-paper-01',
        code: 'SP-MODEL-01',
        title: 'Special Education Model Exam 1',
        teluguTitle: 'స్పెషల్ ఎడ్యుకేషన్ మోడల్ పేపర్ 1',
        category: 'model',
        paperType: 'Paper I (Classes I to V - Special Education)',
        totalQuestions: 150,
        totalMarks: 150,
        durationMinutes: 150,
        isLocked: false,
        status: 'available',
        subjects: ['CDP Special', 'Telugu', 'English', 'Mathematics', 'EVS'],
      },
      {
        id: 'model-paper-02',
        code: 'SP-MODEL-02',
        title: 'Special Education Model Exam 2',
        teluguTitle: 'స్పెషల్ ఎడ్యుకేషన్ మోడల్ పేపర్ 2',
        category: 'model',
        paperType: 'Paper I (Classes I to V - Special Education)',
        totalQuestions: 150,
        totalMarks: 150,
        durationMinutes: 150,
        isLocked: true,
        status: 'coming_soon',
        subjects: ['CDP Special', 'Telugu', 'English', 'Mathematics', 'EVS'],
      },
    ];
  }

  /**
   * Retrieve live tests from database
   */
  static async getLiveDatabaseTests(): Promise<DatabaseTest[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const supabase = createClient();
      if (!supabase) return [];
      const { data } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
      return data || [];
    } catch {
      return [];
    }
  }
}
