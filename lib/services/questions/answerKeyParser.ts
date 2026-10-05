import {
  ParsedQuestion,
  QuestionOptionLetter,
  normalizeOptionKey,
} from './questionParser';

/**
 * Answer Key Parser Architecture
 * Parses standalone answer key documents or text tables into a question-to-answer mapping.
 * Enforces the strict rule: NEVER guess or hallucinate answers. If uncertain, leave as null.
 */
export class AnswerKeyParser {
  /**
   * Parses an answer key string into a Map of questionNumber -> QuestionOptionLetter
   * 
   * Supported formats:
   * 1. Delimited pairs: "1 - A, 2 - 3, 3: B, 4. (2)"
   * 2. Table rows:
   *    Q.No  Answer
   *    1     2
   *    2     4
   * 3. Condensed grid: "1(2) 2(3) 3(1) 4(4)"
   */
  static parseAnswerKeyText(rawText: string): Map<number, QuestionOptionLetter> {
    const keyMap = new Map<number, QuestionOptionLetter>();
    if (!rawText || rawText.trim().length === 0) return keyMap;

    // Pattern 1: Look for "Q.1: 2", "1 - A", "1. (3)", "1) B", "1 = 4", "1: 2"
    const pairRegex =
      /(?:Q(?:uestion)?\.?\s*)?(\d+)\s*[\.\):=\-–—\s]+\(?([1-4A-Da-d])\)?/g;

    let match: RegExpExecArray | null;
    while ((match = pairRegex.exec(rawText)) !== null) {
      const qNum = parseInt(match[1], 10);
      const optKey = normalizeOptionKey(match[2]);

      if (!isNaN(qNum) && optKey && !keyMap.has(qNum)) {
        keyMap.set(qNum, optKey);
      }
    }

    // Pattern 2: Compact grid style: "1(2) 2(4) 3(1)"
    if (keyMap.size === 0) {
      const compactRegex = /(\d+)\(([1-4A-Da-d])\)/g;
      while ((match = compactRegex.exec(rawText)) !== null) {
        const qNum = parseInt(match[1], 10);
        const optKey = normalizeOptionKey(match[2]);
        if (!isNaN(qNum) && optKey && !keyMap.has(qNum)) {
          keyMap.set(qNum, optKey);
        }
      }
    }

    return keyMap;
  }

  /**
   * Matches and merges answer key entries into a list of parsed questions.
   * Matches by questionNumber. Does NOT overwrite answers if not confidently found.
   */
  static applyAnswerKeyToQuestions(
    questions: ParsedQuestion[],
    answerKeyMap: Map<number, QuestionOptionLetter>
  ): { updated: ParsedQuestion[]; matchedCount: number } {
    let matchedCount = 0;

    const updated = questions.map((q) => {
      if (q.questionNumber && answerKeyMap.has(q.questionNumber)) {
        const matchedAnswer = answerKeyMap.get(q.questionNumber)!;
        matchedCount++;
        return {
          ...q,
          correctAnswer: matchedAnswer,
        };
      }
      return q;
    });

    return { updated, matchedCount };
  }
}
