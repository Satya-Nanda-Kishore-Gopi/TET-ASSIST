'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Clock, HelpCircle, Award, CheckCircle2 } from 'lucide-react';
import { MOCK_TESTS_1A } from '@/lib/services/tet/paper1AQuestions';

export interface TetTest {
  id: string;
  title: string;
  description: string | null;
  test_type: string;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
}

export function TestsView() {
  const router = useRouter();
  // Initialize immediately with the 10 Paper 1A mock tests to avoid layout shifts
  const [mockTests, setMockTests] = useState<TetTest[]>(MOCK_TESTS_1A);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMocks() {
      try {
        const res = await fetch('/api/tet/tests');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.tests) && data.tests.length > 0) {
          setMockTests(data.tests);
        }
      } catch (err) {
        console.warn('Fetched tests fallback to static list:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMocks();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header — Clean Educational Design */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Special APTET Paper 1A • 10 Functional Mock Tests</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Mock Tests (మాక్ పరీక్షలు)
        </h1>

        <p className="text-xs sm:text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Full 120-question practice papers adhering to the official syllabus: 30 CDP, 30 Mathematics, 30 Telugu, and 30 English. Instant evaluation and Gemini explanations.
        </p>
      </div>

      {/* 10 Mock Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
        {mockTests.slice(0, 10).map((testItem, index) => {
          const testNumber = String(index + 1).padStart(2, '0');
          const testName = `Mock Test ${testNumber}`;

          return (
            <Card
              key={testItem.id}
              className="border border-brand-border hover:border-brand-primary/40 transition-all bg-white shadow-2xs hover:shadow-xs rounded-2xl"
            >
              <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  {/* Top Bar: Number Tag & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-brand-primary font-bold text-xs tracking-wider border border-emerald-100">
                      {testName.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live & Ready
                    </span>
                  </div>

                  {/* Title & Exam Subtitle */}
                  <div>
                    <h3 className="text-lg font-bold text-brand-text">
                      {testName}
                    </h3>
                    <p className="text-xs font-medium text-brand-secondary font-telugu mt-0.5">
                      Special APTET Paper 1A • పేపర్ 1A మాక్ టెస్ట్
                    </p>
                  </div>

                  {/* Test Specifications: Questions, Marks, Time */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-brand-bg-paper border border-brand-border-light text-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-brand-text-muted text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>Questions</span>
                      </div>
                      <p className="text-sm font-bold text-brand-text">
                        {testItem.total_questions || 120}
                      </p>
                    </div>

                    <div className="space-y-0.5 border-x border-brand-border-light">
                      <div className="flex items-center justify-center gap-1 text-brand-text-muted text-[11px]">
                        <Award className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>Marks</span>
                      </div>
                      <p className="text-sm font-bold text-brand-text">
                        {testItem.total_questions || 120}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-brand-text-muted text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>Minutes</span>
                      </div>
                      <p className="text-sm font-bold text-brand-text">
                        {testItem.duration_minutes || 150}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push(`/tet-test?testId=${testItem.id}`)}
                    className="w-full justify-center gap-2 font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white py-3 rounded-xl shadow-xs cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Test</span>
                    <span className="font-telugu font-normal text-xs text-white/80">
                      (పరీక్ష ప్రారంభించండి)
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
