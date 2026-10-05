import React from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled = false }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-3 sm:p-4 bg-brand-card border-t border-brand-border rounded-b-2xl shadow-sm"
    >
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-end gap-2 bg-brand-bg-paper p-2 rounded-2xl border border-brand-border focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20 transition-all">
        {/* Attachment Button */}
        <div className="flex items-center gap-1 self-start sm:self-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary-light/50"
            title="Attach document / PDF (Upcoming)"
            aria-label="Attach document"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Microphone Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary-light/50"
            title="Voice input in Telugu / English (Upcoming)"
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Text input area */}
        <textarea
          rows={1}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="మీ ప్రశ్నను టైప్ చేయండి... (Type your question in Telugu or English)"
          className="flex-1 max-h-32 min-h-[42px] py-2 px-3 bg-transparent text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none resize-none leading-relaxed font-sans"
        />

        {/* Send Button */}
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            variant="accent"
            size="icon"
            disabled={!value.trim() || disabled}
            className="w-10 h-10 rounded-xl shrink-0"
            title="Send query"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-brand-text-subtle">
        <span>Press Enter to send • Shift+Enter for new line</span>
        <span className="hidden sm:inline">Google Gemini AI integration ready</span>
      </div>
    </form>
  );
}
