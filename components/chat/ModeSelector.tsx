import React from 'react';
import { ChatMode } from '@/types';
import { Bot, BookOpen, FileText, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  currentMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
}

const modes: Array<{
  id: ChatMode;
  label: string;
  telugu: string;
  icon: LucideIcon;
  description: string;
  isAvailable?: boolean;
}> = [
  {
    id: 'APTET Assistant',
    label: 'APTET Assistant',
    telugu: 'సిలబస్ & పెడగోగి సహాయకుడు',
    icon: Bot,
    description: 'Syllabus, pedagogy, and exam questions',
    isAvailable: true,
  },
  {
    id: 'APTET Material',
    label: 'APTET Material',
    telugu: 'అధికారిక మెటీరియల్ ఆధారంగా',
    icon: BookOpen,
    description: 'Queries strictly from preloaded textbooks',
    isAvailable: false,
  },
  {
    id: 'My PDF',
    label: 'My PDF',
    telugu: 'నా పిడిఎఫ్ నోట్స్ నుండి',
    icon: FileText,
    description: 'Ask questions from your uploaded files',
    isAvailable: false,
  },
  {
    id: 'General AI',
    label: 'General AI',
    telugu: 'సాధారణ ఏఐ మోడ్',
    icon: Sparkles,
    description: 'Broader educational queries',
    isAvailable: false,
  },
];

export function ModeSelector({ currentMode, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-brand-bg-paper rounded-2xl border border-brand-border-light">
      <span className="text-xs font-bold text-brand-text-subtle uppercase px-2 tracking-wider">
        Mode:
      </span>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer',
              isSelected
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-text-muted hover:text-brand-primary hover:bg-white/80'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{mode.label}</span>
            {!mode.isAvailable && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded font-normal',
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
                )}
              >
                Upcoming
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
