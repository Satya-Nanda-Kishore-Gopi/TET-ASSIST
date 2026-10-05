import crypto from 'crypto';

export type QuestionOptionLetter = 'A' | 'B' | 'C' | 'D';

export interface ParsedQuestion {
  questionNumber: number | null;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: QuestionOptionLetter | null;
  subject: string | null;
  topic: string | null;
  subtopic: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  explanation: string | null;
  confidence: 'high' | 'medium' | 'low';
  fingerprint: string;
}

export interface ParseQuestionsOptions {
  defaultSubject?: string | null;
  defaultYear?: number | null;
}

/**
 * Normalizes option designators (1, 2, 3, 4, A, B, C, D, a, b, c, d) into standard 'A' | 'B' | 'C' | 'D'
 */
export function normalizeOptionKey(key: string): QuestionOptionLetter | null {
  const clean = key.trim().toUpperCase();
  if (clean === 'A' || clean === '1') return 'A';
  if (clean === 'B' || clean === '2') return 'B';
  if (clean === 'C' || clean === '3') return 'C';
  if (clean === 'D' || clean === '4') return 'D';
  return null;
}

/**
 * Generates a deterministic hash based on normalized question text and options.
 * Used for duplicate prevention across multiple processing runs.
 */
export function generateQuestionFingerprint(
  questionText: string,
  optionA: string,
  optionB: string,
  optionC: string,
  optionD: string
): string {
  const normalized = [
    questionText.replace(/\s+/g, ' ').trim().toLowerCase(),
    optionA.replace(/\s+/g, ' ').trim().toLowerCase(),
    optionB.replace(/\s+/g, ' ').trim().toLowerCase(),
    optionC.replace(/\s+/g, ' ').trim().toLowerCase(),
    optionD.replace(/\s+/g, ' ').trim().toLowerCase(),
  ].join('||');

  return crypto
    .createHash('sha256')
    .update(normalized, 'utf8')
    .digest('hex')
    .substring(0, 32);
}

/**
 * Evaluates the parsing confidence level:
 * - high: question number + valid text + all 4 options detected
 * - medium: question number + valid text + 2 or 3 options detected
 * - low: incomplete question or irregular formatting
 */
export function calculateConfidence(
  questionNumber: number | null,
  questionText: string,
  options: { A: string; B: string; C: string; D: string }
): 'high' | 'medium' | 'low' {
  const hasValidText = questionText.trim().length >= 10;
  const optionCount = [options.A, options.B, options.C, options.D].filter(
    (opt) => opt.trim().length > 0
  ).length;

  if (questionNumber !== null && hasValidText && optionCount === 4) {
    return 'high';
  }

  if (hasValidText && optionCount >= 2) {
    return 'medium';
  }

  return 'low';
}

/**
 * Validates whether a parsed question is complete enough to insert into the database.
 */
export function validateParsedQuestion(
  q: ParsedQuestion,
  documentId?: string
): { isValid: boolean; reason?: string } {
  if (documentId !== undefined && !documentId) {
    return { isValid: false, reason: 'Document association is missing.' };
  }

  const cleanText = q.questionText.trim();
  if (cleanText.length < 5) {
    return { isValid: false, reason: 'Question text is too short or empty.' };
  }

  // Must have at least two valid options
  if (!q.optionA || q.optionA.trim().length === 0 || !q.optionB || q.optionB.trim().length === 0) {
    return { isValid: false, reason: 'Question contains fewer than two options.' };
  }

  return { isValid: true };
}

/**
 * Parses raw text extracted from a question paper into structured MCQs.
 * Handles diverse Andhra Pradesh / Special APTET paper formats:
 * - 1. / 1) / Q1. / Q.1 / 1 .
 * - Options: (1)/(2)/(3)/(4), (A)/(B)/(C)/(D), A./B./C./D., 1./2./3./4.
 * - Inline answer detection: "Ans: A", "Key: 2", "Answer: 3"
 */
export function parseQuestionsFromText(
  rawText: string,
  options?: ParseQuestionsOptions
): ParsedQuestion[] {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  // Clean up non-standard whitespace and page break indicators
  const normalizedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/--- Page Break ---/g, '\n\n')
    .trim();

  // Pattern to locate start of questions:
  // Matches "1. ", "1) ", "Q.1 ", "Q1. ", "15. ", etc. at the beginning of a line or block
  const questionHeaderRegex =
    /(?:^|\n\s*)(?:Q(?:uestion)?\.?\s*(\d+)|(\d+))\s*[\.\):\-]\s+/gi;

  const matches: { index: number; questionNumber: number; length: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionHeaderRegex.exec(normalizedText)) !== null) {
    const qNumStr = match[1] || match[2];
    const qNum = parseInt(qNumStr, 10);
    if (!isNaN(qNum)) {
      matches.push({
        index: match.index,
        questionNumber: qNum,
        length: match[0].length,
      });
    }
  }

  const results: ParsedQuestion[] = [];

  // If question numbering was found
  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];

      const blockStart = current.index + current.length;
      const blockEnd = next ? next.index : normalizedText.length;
      const questionBlock = normalizedText.substring(blockStart, blockEnd).trim();

      const parsed = parseSingleQuestionBlock(
        questionBlock,
        current.questionNumber,
        options
      );

      if (parsed) {
        results.push(parsed);
      }
    }
  } else {
    // Fallback: Split by double newlines and attempt to extract
    const paragraphs = normalizedText.split(/\n\s*\n/);
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i].trim();
      if (p.length > 20) {
        const parsed = parseSingleQuestionBlock(p, i + 1, options);
        if (parsed && (parsed.optionA || parsed.optionB)) {
          results.push(parsed);
        }
      }
    }
  }

  return results;
}

/**
 * Extracts question text, options (A, B, C, D), and inline answers from an isolated question block
 */
function parseSingleQuestionBlock(
  blockText: string,
  questionNumber: number | null,
  options?: ParseQuestionsOptions
): ParsedQuestion | null {
  if (!blockText || blockText.trim().length === 0) return null;

  // 1. Look for inline Answer Key (e.g. "Ans: A", "Key: (2)", "Answer: 1", "సమాధానం: 3")
  let correctAnswer: QuestionOptionLetter | null = null;
  const answerRegex =
    /(?:Ans(?:wer)?|Key|సమాధానం)[\s:\.\-]*\(?([1-4A-Da-d])\)?/i;
  const answerMatch = blockText.match(answerRegex);

  let cleanBlock = blockText;
  if (answerMatch) {
    correctAnswer = normalizeOptionKey(answerMatch[1]);
    cleanBlock = blockText.replace(answerRegex, '').trim();
  }

  // 2. Identify Options inside the block
  // Supported markers: (A), (B), (C), (D) or (1), (2), (3), (4) or A., B., C., D. or 1), 2), 3), 4)
  const optionDelimiterRegex =
    /(?:^|\n|\s{2,}|\t)(?:\(([1-4A-Da-d])\)|([A-Da-d1-4])[\.\)])\s+/g;

  const optionMatches: { index: number; key: QuestionOptionLetter; length: number }[] = [];
  let optMatch: RegExpExecArray | null;

  while ((optMatch = optionDelimiterRegex.exec(cleanBlock)) !== null) {
    const rawKey = optMatch[1] || optMatch[2];
    const key = normalizeOptionKey(rawKey);
    if (key) {
      optionMatches.push({
        index: optMatch.index,
        key,
        length: optMatch[0].length,
      });
    }
  }

  let questionText = cleanBlock;
  const optionsMap: { A: string; B: string; C: string; D: string } = {
    A: '',
    B: '',
    C: '',
    D: '',
  };

  if (optionMatches.length >= 2) {
    // Question text is everything before the first option delimiter
    questionText = cleanBlock.substring(0, optionMatches[0].index).trim();

    for (let i = 0; i < optionMatches.length; i++) {
      const currentOpt = optionMatches[i];
      const nextOpt = optionMatches[i + 1];

      const optStart = currentOpt.index + currentOpt.length;
      const optEnd = nextOpt ? nextOpt.index : cleanBlock.length;
      const optText = cleanBlock.substring(optStart, optEnd).trim();

      optionsMap[currentOpt.key] = optText;
    }
  }

  const confidence = calculateConfidence(questionNumber, questionText, optionsMap);
  const fingerprint = generateQuestionFingerprint(
    questionText,
    optionsMap.A,
    optionsMap.B,
    optionsMap.C,
    optionsMap.D
  );

  return {
    questionNumber,
    questionText: questionText.trim(),
    optionA: optionsMap.A.trim(),
    optionB: optionsMap.B.trim(),
    optionC: optionsMap.C.trim(),
    optionD: optionsMap.D.trim(),
    correctAnswer,
    subject: options?.defaultSubject || null,
    topic: null,
    subtopic: null,
    difficulty: null,
    explanation: null,
    confidence,
    fingerprint,
  };
}
