'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMode, ChatMessage } from '@/types';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatInput } from './ChatInput';
import { Bot, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ChatContainer() {
  const [currentMode, setCurrentMode] = useState<ChatMode>('APTET Assistant');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or loading starts/stops
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const sendMessage = async (contentToSend: string) => {
    const trimmed = contentToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      mode: currentMode,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare multi-turn conversation payload for /api/chat
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'క్షమించండి, ప్రస్తుతం AI response అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.'
        );
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        mode: currentMode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const displayError =
        err instanceof Error
          ? err.message
          : 'క్షమించండి, ప్రస్తుతం AI response అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.';

      setErrorMessage(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRetryLast = () => {
    if (messages.length === 0 || isLoading) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] border-brand-border bg-brand-card overflow-hidden rounded-2xl shadow-xs">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-brand-text tracking-tight">
              Ask AI
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Special APTET
            </span>
          </div>
          <p className="text-xs text-brand-text-muted mt-0.5">
            Ask anything about your TET preparation • తెలుగు &amp; English
          </p>
        </div>

        {/* Clean status pill */}
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-200/60 self-start sm:self-center">
          <Bot className="w-4 h-4 text-emerald-600" />
          <span>Educational Assistant Active</span>
        </div>
      </div>

      {/* Error / Alert Banner */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetryLast}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold px-1.5 py-0.5 cursor-pointer"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages area or Empty State */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState onSelectPrompt={handleSelectPrompt} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-brand-primary text-white rounded-br-xs'
                      : 'bg-brand-bg-paper border border-brand-border text-brand-text rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      msg.role === 'user' ? 'text-white/70' : 'text-brand-text-subtle'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-accent text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 text-xs shadow-2xs animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-brand-bg-paper border border-brand-border rounded-2xl rounded-bl-xs px-4 py-3 text-xs text-brand-text-muted flex items-center gap-2">
                  <span>TET Assist ఆలోచిస్తోంది</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
    </Card>
  );
}
