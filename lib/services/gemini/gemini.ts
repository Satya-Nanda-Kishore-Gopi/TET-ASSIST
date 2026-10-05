import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '@/lib/constants/ai';

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  message: string;
}

/**
 * Service to interact securely with Google Gemini API on the server.
 * Never invoke this on client components.
 */
export class GeminiChatService {
  private static clientInstance: GoogleGenAI | null = null;

  /**
   * Lazily retrieve the GoogleGenAI client using server environment variable
   */
  private static getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in .env.local.'
      );
    }

    if (!this.clientInstance) {
      this.clientInstance = new GoogleGenAI({ apiKey: apiKey.trim() });
    }

    return this.clientInstance;
  }

  /**
   * Generate an AI response from Gemini given conversation history and optional knowledge base context
   */
  static async generateChatResponse(
    messages: ChatMessagePayload[],
    knowledgeContext?: string
  ): Promise<GeminiResponse> {
    const ai = this.getClient();

    // Map conversation messages to Gemini's format:
    // User role is 'user', assistant role is 'model'
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }],
    }));

    const candidateModels = Array.from(
      new Set([
        process.env.GEMINI_MODEL || AI_CONFIG.defaultModel,
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-3.8-pro',
      ])
    ).filter(Boolean);

    // If knowledge base context was retrieved, inject into system instruction as verified ground truth
    const effectiveSystemInstruction =
      knowledgeContext && knowledgeContext.trim().length > 0
        ? `${AI_CONFIG.systemInstruction}\n\n=== AUTHENTIC TET ASSIST KNOWLEDGE BASE CONTEXT ===\nThe following verified materials, questions, and official syllabus excerpts were retrieved from the TET Assist knowledge base. ALWAYS prioritize this authentic Andhra Pradesh Special APTET material in your pedagogical explanations, question references, and answers:\n\n${knowledgeContext}`
        : AI_CONFIG.systemInstruction;

    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: effectiveSystemInstruction,
            temperature: AI_CONFIG.temperature,
          },
        });

        const text = response.text?.trim();

        if (text) {
          return { message: text };
        }
      } catch (err: unknown) {
        lastError = err;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(
          `[GeminiChatService] Model "${model}" failed, trying candidate fallback:`,
          errorMessage.substring(0, 160)
        );
      }
    }

    throw lastError || new Error('All candidate Gemini models failed to respond.');
  }
}
