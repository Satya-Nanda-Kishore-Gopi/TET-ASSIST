/**
 * Supabase Service Interface Stub
 * Clean boundary for future authentication, database queries, and storage
 */

export interface SupabaseClientConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export class SupabaseService {
  /**
   * Future implementation: Initialize Supabase client
   */
  static getClient() {
    throw new Error('Supabase client will be configured when environment keys are provided.');
  }

  /**
   * Future implementation: Check current user session
   */
  static async getCurrentSession() {
    return null;
  }
}
