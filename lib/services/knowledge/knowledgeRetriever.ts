import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { QuestionBankService } from '@/lib/services/questions';
import { StudyService } from '@/lib/services/study';

export interface RetrievedKnowledgeContext {
  contextText: string;
  sourceCount: number;
  sources: string[];
}

export class KnowledgeRetriever {
  /**
   * Retrieves relevant syllabus, study notes, and authentic questions matching the student's prompt.
   * Feeds directly into Gemini's context window as verified ground truth.
   */
  static async retrieveContext(userQuery: string): Promise<RetrievedKnowledgeContext> {
    const cleanQuery = userQuery.trim().toLowerCase();
    const sources: string[] = [];
    const contextSnippets: string[] = [];

    // Extract core keywords from prompt
    const keywords = cleanQuery
      .replace(/[?,.!"']/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    // 1. Search Question Bank for matching authentic Special APTET questions & explanations
    try {
      const questions = await QuestionBankService.getQuestions({
        search: keywords.slice(0, 3).join(' '),
        limit: 3,
      });

      if (questions.length > 0) {
        contextSnippets.push('### Authentic Special APTET Questions & Verified Solutions:');
        questions.forEach((q) => {
          const docTitle = q.document?.title || 'Special APTET Examination';
          if (!sources.includes(docTitle)) sources.push(docTitle);

          let snippet = `Question: ${q.question_text}\n`;
          snippet += `Options: (A) ${q.option_a} | (B) ${q.option_b} | (C) ${q.option_c} | (D) ${q.option_d}\n`;
          if (q.correct_answer) {
            snippet += `Official Answer: Option (${q.correct_answer})\n`;
          }
          if (q.explanation) {
            snippet += `Pedagogical Rationale: ${q.explanation}\n`;
          }
          contextSnippets.push(snippet.trim());
        });
      }
    } catch (err) {
      console.warn('[KnowledgeRetriever] Question bank search error:', err);
    }

    // 2. Search Study Topic Modules for curriculum weightage and key concepts
    try {
      const modules = await StudyService.getTopicModules();
      const matchedModules = modules.filter((m) => {
        const textToMatch = `${m.title} ${m.teluguTitle} ${m.summary} ${m.keyPoints.join(' ')}`.toLowerCase();
        return keywords.some((k) => textToMatch.includes(k));
      });

      if (matchedModules.length > 0) {
        contextSnippets.push('\n### Curriculum Guidelines & Foundational Concepts:');
        matchedModules.slice(0, 2).forEach((m) => {
          if (m.sourceDocTitle && !sources.includes(m.sourceDocTitle)) {
            sources.push(m.sourceDocTitle);
          }
          let modText = `Topic: ${m.title} (${m.teluguTitle})\n`;
          modText += `Summary: ${m.summary}\n`;
          modText += `Key Pedagogical Points:\n- ${m.keyPoints.join('\n- ')}\n`;
          contextSnippets.push(modText.trim());
        });
      }
    } catch (err) {
      console.warn('[KnowledgeRetriever] Study module search error:', err);
    }

    // 3. Search Supabase documents table for raw_text matching if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (supabase && keywords.length > 0) {
          const mainKeyword = keywords[0];
          const { data: docs } = await supabase
            .from('documents')
            .select('title, document_type, raw_text, subject')
            .not('raw_text', 'is', null)
            .ilike('raw_text', `%${mainKeyword}%`)
            .limit(2);

          if (docs && docs.length > 0) {
            docs.forEach((doc) => {
              if (doc.raw_text) {
                if (!sources.includes(doc.title)) sources.push(doc.title);
                // Extract 500-char window around keyword
                const idx = doc.raw_text.toLowerCase().indexOf(mainKeyword);
                const start = Math.max(0, idx - 100);
                const end = Math.min(doc.raw_text.length, idx + 400);
                const excerpt = doc.raw_text.substring(start, end).replace(/\s+/g, ' ').trim();

                contextSnippets.push(
                  `Excerpt from [${doc.title} (${doc.document_type})]: "...${excerpt}..."`
                );
              }
            });
          }
        }
      } catch (err) {
        console.warn('[KnowledgeRetriever] Document raw_text search error:', err);
      }
    }

    const compiledText = contextSnippets.join('\n\n');

    return {
      contextText: compiledText,
      sourceCount: sources.length,
      sources,
    };
  }
}
