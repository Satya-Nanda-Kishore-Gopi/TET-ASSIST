import { StudyPlanItem } from '@/types';

/**
 * Study Plan Service Interface Stub
 * Clean boundary for adaptive schedule generation, daily tasks, and exam timeline tracking
 */

export class StudyPlanService {
  /**
   * Future implementation: Generate an AI-tailored study plan based on exam date & diagnostic scores
   */
  static async generateStudyPlan(_targetScore: number, _dailyHours: number): Promise<StudyPlanItem[]> {
    throw new Error('Study-plan engine will be connected in future phase.');
  }

  /**
   * Future implementation: Retrieve today's study plan tasks
   */
  static async getTodaysPlan(): Promise<StudyPlanItem[]> {
    return [];
  }
}
