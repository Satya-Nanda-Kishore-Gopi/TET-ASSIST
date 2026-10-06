'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, ArrowLeft, CheckCircle2, XCircle, HelpCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SessionResult {
  attemptId?: string;
  testId?: string;
  score: number;
  totalMarks: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  answered: number;
  status: string;
}

export default function TetResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('tet-result');
    if (!raw) {
      router.replace('/tests');
      return;
    }
    try {
      setResult(JSON.parse(raw));
    } catch {
      router.replace('/tests');
    }
  }, [router]);

  if (!result) {
    return (
      <main className="min-h-screen grid place-items-center bg-brand-bg p-6 text-brand-text">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-brand-secondary">Loading test results...</p>
        </div>
      </main>
    );
  }

  const percentage = result.totalMarks
    ? Math.round((result.score / result.totalMarks) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-brand-bg p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-10 text-center shadow-xs border border-brand-border space-y-6">
        {/* Brand & Badge */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-primary tracking-wider uppercase">
            TET Assist • Special APTET Paper 1A
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
            Test Completed 🎉
          </h1>
          <p className="text-xs sm:text-sm text-brand-secondary font-telugu font-medium">
            పరీక్ష విజయవంతంగా సమర్పించబడింది
          </p>
        </div>

        {/* Score Display Card */}
        <div className="py-6 px-4 rounded-2xl bg-brand-bg-paper border border-brand-border-light space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-subtle">
            Your Score • మీ మార్కులు
          </span>
          <div className="text-5xl sm:text-6xl font-extrabold text-brand-primary font-sans">
            {result.score} <span className="text-2xl sm:text-3xl text-brand-text-subtle font-medium">/ {result.totalMarks || 120}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-brand-secondary">
            {percentage}% Accuracy
          </p>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Correct */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Correct</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold">{result.correct}</p>
          </div>

          {/* Incorrect */}
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-950 space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-red-800">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Incorrect</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold">{result.incorrect}</p>
          </div>

          {/* Unanswered */}
          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-600">
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Unanswered</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold">{result.unanswered}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {result.attemptId && (
            <button
              onClick={() => router.push(`/tet-review/${result.attemptId}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white hover:bg-brand-primary-hover shadow-xs cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Review Answers (సమీక్షించండి)</span>
            </button>
          )}

          <button
            onClick={() => router.push('/tests')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-6 py-3 text-sm font-semibold text-brand-text hover:bg-brand-bg-paper cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tests (మాక్ పరీక్షలు)</span>
          </button>
        </div>
      </div>
    </main>
  );
}