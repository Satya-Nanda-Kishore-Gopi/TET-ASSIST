import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestedPrompts = [
  {
    title: "Explain Piaget's theory",
    teluguTitle: 'పియాజె సిద్ధాంతం వివరణ',
    prompt: "Explain Piaget's theory of cognitive development with examples for primary school teachers.",
  },
  {
    title: 'Give me 5 CDP questions',
    teluguTitle: '5 ముఖ్యమైన CDP ప్రశ్నలు',
    prompt: 'Give me 5 high-yield Child Development & Pedagogy questions for Special APTET Paper 1A with explanations.',
  },
  {
    title: 'Explain this question in Telugu',
    teluguTitle: 'తెలుగులో వివరణ ఇవ్వండి',
    prompt: 'RPwD Act 2016 లోని ముఖ్యమైన 21 వైకల్యాలు మరియు TET పరీక్షలో అడిగే ముఖ్య ప్రశ్నలను తెలుగులో వివరించండి.',
  },
  {
    title: 'What is formative assessment?',
    teluguTitle: 'రూపణ మూల్యాంకనం అంటే ఏమిటి?',
    prompt: 'What is formative assessment? Explain the difference between assessment of learning and assessment for learning.',
  },
];

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto">
      {/* Bot Icon with soft educational halo */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-brand-primary mb-4 shadow-2xs">
        <Bot className="w-8 h-8 stroke-[1.8]" />
      </div>

      <div className="space-y-1.5 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Ask AI
        </h2>
        <p className="text-sm sm:text-base font-medium text-brand-secondary">
          &ldquo;Ask anything about your TET preparation.&rdquo;
        </p>
        <p className="text-xs text-brand-text-muted max-w-md mx-auto pt-1 font-telugu">
          మీ Special APTET సందేహాలు, పెడగాగి భావనలు మరియు ప్రశ్నలను అడగండి.
        </p>
      </div>

      {/* Suggested prompts chips */}
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-brand-text-subtle">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
          <span>ఉదాహరణ ప్రశ్నలు (Example prompts):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestedPrompts.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 text-left rounded-xl bg-white hover:bg-emerald-50/50 border border-brand-border hover:border-brand-primary/40 transition-all duration-150 group shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  &ldquo;{item.title}&rdquo;
                </span>
                <span className="text-[11px] text-brand-secondary font-telugu font-medium">
                  {item.teluguTitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
