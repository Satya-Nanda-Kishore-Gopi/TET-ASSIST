import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '@/lib/constants/ai';

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  message: string;
}

export interface TetExplanationRequest {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: number;
  selectedOption: number;
  subject: string;
  questionContext?: string;
  language?: 'te' | 'en' | 'auto';
}

export interface TetTranslationRequest {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  subject: string;
}

export interface TetTranslationResponse {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
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
    const rawApiKey = process.env.GEMINI_API_KEY;

    if (!rawApiKey || rawApiKey.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in .env.local.'
      );
    }

    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');

    if (!this.clientInstance) {
      this.clientInstance = new GoogleGenAI({ apiKey });
    }

    return this.clientInstance;
  }

  /**
   * Candidate models ordered by speed, capability, and availability
   */
  private static getCandidateModels(): string[] {
    return Array.from(
      new Set([
        process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-3.8-pro',
      ])
    ).filter(Boolean);
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

    const candidateModels = this.getCandidateModels();

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

  /**
   * Generate detailed educational explanation for a TET question
   */
  static async generateExplanation(params: TetExplanationRequest): Promise<{ explanation: string }> {
    const ai = this.getClient();

    const optionLabels: Record<number, string> = {
      1: 'Option A',
      2: 'Option B',
      3: 'Option C',
      4: 'Option D',
    };

    const optionTexts: Record<number, string> = {
      1: params.options.a,
      2: params.options.b,
      3: params.options.c,
      4: params.options.d,
    };

    const correctLabel = optionLabels[params.correctOption] || `Option ${params.correctOption}`;
    const correctText = optionTexts[params.correctOption] || '';
    const selectedLabel = optionLabels[params.selectedOption] || `Option ${params.selectedOption}`;
    const selectedText = optionTexts[params.selectedOption] || '';
    const isUserCorrect = params.selectedOption === params.correctOption;

    const containsTelugu =
      /[\u0C00-\u0C7F]/.test(params.question) ||
      params.subject.toLowerCase().includes('telugu');

    const targetLanguage =
      params.language === 'en'
        ? 'en'
        : params.language === 'te' || containsTelugu
        ? 'te'
        : 'en';

    const systemInstruction = `You are TET Assist's expert pedagogy instructor for the Special APTET (Andhra Pradesh Teacher Eligibility Test - Classes I to VIII Special Education).
Your role is to explain mock test questions with pedagogical precision, clarity, and encouragement.

CRITICAL MANDATORY RULES:
1. The official correct answer is ALREADY DETERMINED and CANNOT be changed: ${correctLabel} (${correctText}).
   You MUST explain why this official answer is correct. You must NEVER contradict, debate, or change the official correct answer.
2. The student selected: ${selectedLabel} (${selectedText}). The student's answer was ${isUserCorrect ? 'CORRECT' : 'INCORRECT'}.
3. Structure your response strictly into these 5 clearly labeled sections:
   ### A. Correct Answer
   ### B. Why This Answer is Correct
   ### C. Why the Other Options are Incorrect
   ### D. Important Concept to Remember
   ### E. Exam Tip
4. Language Guidelines:
   ${
     targetLanguage === 'te'
       ? '- The question is in Telugu or Language I (Telugu). Explain in natural, clear Telugu. Preserve Telugu script for terms and options. Where helpful, include English technical terms in parentheses (e.g., స్క్యాఫోల్డింగ్ (Scaffolding)).'
       : '- Explain clearly in English. If the question contains Telugu quotes or terminology, preserve them accurately.'
   }
5. Subject-Specific Instructions:
   - For Child Development & Pedagogy (CDP) & Special Education: Explain the educational/psychological concept (e.g., Piaget, Vygotsky, Kohlberg, Inclusive Education, RPwD Act 2016, Learning Disabilities) clearly and concisely. If the student chose an incorrect option, clarify why that misconception is common.
   - For Mathematics: Show step-by-step mathematical reasoning or calculations clearly (formulas, steps, and intermediate results).
   - For Language I (Telugu) / Language II (English): Explain grammar rules, vocabulary, syntax, or pedagogy of language teaching clearly.
6. Tone: Warm, professional, educational, and focused on helping the teacher aspirant succeed in APTET.`;

    const userPrompt = `Please explain this TET mock exam question:
- Subject: ${params.subject}
${params.questionContext ? `- Context: ${params.questionContext}\n` : ''}
- Question: ${params.question}
- Option A: ${params.options.a}
- Option B: ${params.options.b}
- Option C: ${params.options.c}
- Option D: ${params.options.d}
- Student's Answer: ${selectedLabel} (${selectedText}) - [${isUserCorrect ? 'CORRECT' : 'INCORRECT'}]
- Official Correct Answer: ${correctLabel} (${correctText})

Please provide the detailed explanation following the required 5 sections (A, B, C, D, E).`;

    const candidateModels = this.getCandidateModels();
    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            temperature: 0.5,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return { explanation: text };
        }
      } catch (err: unknown) {
        lastError = err;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(
          `[GeminiChatService.generateExplanation] Model "${model}" failed, trying candidate fallback:`,
          errorMessage.substring(0, 160)
        );
      }
    }

    throw lastError || new Error('All candidate Gemini models failed to generate explanation.');
  }

  /**
   * Translate a TET exam question and options to natural, educationally accurate Telugu
   */
  static async translateQuestionToTelugu(
    params: TetTranslationRequest
  ): Promise<TetTranslationResponse> {
    const isAlreadyTelugu =
      params.subject.toLowerCase().includes('telugu') ||
      (params.question.match(/[\u0C00-\u0C7F]/g) || []).length > 20;

    // If already in Telugu, return original directly without calling Gemini
    if (isAlreadyTelugu) {
      return {
        question: params.question,
        option_a: params.options.a,
        option_b: params.options.b,
        option_c: params.options.c,
        option_d: params.options.d,
      };
    }

    const ai = this.getClient();

    const isEnglishSubject =
      params.subject.toLowerCase().includes('english') ||
      params.subject.toLowerCase().includes('language ii');

    const isMath =
      params.subject.toLowerCase().includes('math') ||
      params.subject.toLowerCase().includes('mathematics');

    const systemInstruction = `You are a Telugu educational translator for TET/APTET examination preparation (Andhra Pradesh Teacher Eligibility Test).
Translate the following examination question and its four options from English into natural, clear Telugu.

The translation must preserve the exact meaning and educational intent of the original question.

MANDATORY RULES:
1. Translate the COMPLETE question and all four options.
2. Natural Telugu: Easy to understand, grammatically correct, suitable for Telugu-medium teachers/students, educationally accurate, and faithful to the original meaning. Do not use simple word-by-word translation.
3. Do NOT add new information.
4. Do NOT remove information.
5. Do NOT change the meaning.
6. Do NOT change numbers, dates, ages, names, formulas, mathematical values, scientific symbols, or units.
7. Do NOT change the order of options (Option A stays Option A, Option B stays Option B, etc.).
8. Do NOT determine which answer is correct.

SUBJECT-SPECIFIC RULES:
${
  isEnglishSubject
    ? `- IMPORTANT FOR ENGLISH-SUBJECT QUESTIONS:
  Translate the question instructions into Telugu where appropriate.
  If the question is testing an English word, sentence, grammar rule, vocabulary, comprehension, spelling, synonym, antonym, parts of speech, etc., DO NOT translate the actual English content being tested.
  For example: If Question is 'Choose the correct synonym of "Happy".', display '“Happy” అనే పదానికి సరైన పర్యాయపదాన్ని ఎంచుకోండి.'
  Options should preserve the English words if those English words are what the student is being tested on.`
    : isMath
    ? `- For Mathematics: Translate the question and explanatory text into Telugu while strictly preserving mathematical expressions, equations, numbers, symbols, units, and calculations.`
    : `- For CDP / Educational Pedagogy: Translate the complete question and options into clear educational Telugu terminology.`
}

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "question": "<translated question in Telugu>",
  "option_a": "<translated option A in Telugu>",
  "option_b": "<translated option B in Telugu>",
  "option_c": "<translated option C in Telugu>",
  "option_d": "<translated option D in Telugu>"
}`;

    const userPrompt = `Question:
${params.question}

Option A:
${params.options.a}

Option B:
${params.options.b}

Option C:
${params.options.c}

Option D:
${params.options.d}`;

    const candidateModels = this.getCandidateModels();
    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim();
        if (text) {
          let jsonStr = text;
          if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsed = JSON.parse(jsonStr);
          if (
            parsed &&
            typeof parsed.question === 'string' &&
            typeof parsed.option_a === 'string' &&
            typeof parsed.option_b === 'string' &&
            typeof parsed.option_c === 'string' &&
            typeof parsed.option_d === 'string'
          ) {
            return {
              question: parsed.question.trim(),
              option_a: parsed.option_a.trim(),
              option_b: parsed.option_b.trim(),
              option_c: parsed.option_c.trim(),
              option_d: parsed.option_d.trim(),
            };
          }
        }
      } catch (err: unknown) {
        lastError = err;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(
          `[GeminiChatService.translateQuestionToTelugu] Model "${model}" failed, trying candidate fallback:`,
          errorMessage.substring(0, 160)
        );
      }
    }

    throw lastError || new Error('All candidate Gemini models failed to translate question.');
  }
}

