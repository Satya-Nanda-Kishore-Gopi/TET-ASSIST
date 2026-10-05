import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestedPrompts = [
  {
    title: 'Inclusive Classroom Methods',
    prompt: 'Special Education లో Inclusive classroom teaching methods మరియు accommodations వివరించండి.',
    category: 'Pedagogy',
  },
  {
    title: 'Growth vs Development',
    prompt: 'శిశు వికాసంలో Growth మరియు Development మధ్య గల ముఖ్యమైన తేడాలు ఏమిటి?',
    category: 'Child Dev',
  },
  {
    title: 'RPwD Act 2016 Key Provisions',
    prompt: 'RPwD Act 2016 ప్రకారం TET పరీక్షలో అడిగే ముఖ్యమైన disabilities మరియు legal provisions ఏమిటి?',
    category: 'Special Ed',
  },
  {
    title: 'High Weightage Topics',
    prompt: 'Special APTET Paper I లో Child Development & Pedagogy లో అత్యధిక మార్కులు వచ్చే topics ఏమిటి?',
    category: 'Syllabus',
  },
];

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto">
      {/* Bot Icon with soft halo */}
      <div className="w-16 h-16 rounded-3xl bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4 shadow-xs ring-8 ring-brand-primary-light/40">
        <Bot className="w-8 h-8 stroke-[1.8]" />
      </div>

      <div className="space-y-1 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-brand-text">
          మీ సందేహాన్ని అడగండి
        </h3>
        <p className="text-sm font-medium text-brand-secondary">
          Ask your Special APTET doubts & concepts
        </p>
        <p className="text-xs sm:text-sm text-brand-text-muted max-w-md mx-auto pt-1 leading-relaxed">
          Concepts, questions, preparation and study doubts గురించి అడగండి.
        </p>
      </div>

      {/* Suggested prompts chips */}
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-brand-text-subtle">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
          <span>ఉదాహరణ ప్రశ్నలు (Try asking one of these):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestedPrompts.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3 text-left rounded-xl bg-brand-card hover:bg-brand-bg-paper border border-brand-border/80 hover:border-brand-primary/40 transition-all duration-150 group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-primary-light text-brand-primary">
                  {item.category}
                </span>
              </div>
              <p className="text-[11px] text-brand-text-muted line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
