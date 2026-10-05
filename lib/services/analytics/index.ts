import { PreparationMetrics } from '@/types';

/**
 * Analytics Service Interface Stub
 * Clean boundary for preparation analytics, subject mastery, weak-area detection, and repeated questions
 */

export class AnalyticsService {
  /**
   * Return initial baseline metrics (honest empty state, no fabricated user data)
   */
  static getInitialMetrics(): PreparationMetrics {
    return {
      preparationPercentage: 0,
      testsCompleted: 0,
      averageScore: null,
      totalTimeMinutes: 0,
      streakDays: 0,
    };
  }

  /**
   * Future implementation: Compute overall analytics from test attempt logs
   */
  static async computeUserAnalytics(_userId: string) {
    return null;
  }
}
