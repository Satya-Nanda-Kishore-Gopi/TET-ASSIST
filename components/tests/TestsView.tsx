'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TestsService } from '@/lib/services/tests';
import { Clock, HelpCircle, Award, PlayCircle, Lock } from 'lucide-react';

type TestTab = 'official' | 'previous' | 'model' | 'practice' | 'mock';

type TetTest = {
  id: string;
  title: string;
  description: string | null;
  test_type: string;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
};

export function TestsView() {
  const [activeTab, setActiveTab] = useState<TestTab>('mock');
  const [mockTests, setMockTests] = useState<TetTest[]>([]);
  const [loadingMocks, setLoadingMocks] = useState(true);
  const [mockError, setMockError] = useState('');

  const officialPapers = TestsService.getOfficialPapers();

  useEffect(() => {
    let cancelled = false;

    async function loadMocks() {
      try {
        const response = await fetch('/api/tet/tests', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load mock tests.');
        }
        if (!cancelled) setMockTests(data.tests || []);
      } catch (error) {
        if (!cancelled) {
          setMockError(error instanceof Error ? error.message : 'Failed to load mock tests.');
        }
      } finally {
        if (!cancelled) setLoadingMocks(false);
      }
    }

    loadMocks();
    return () => { cancelled = true; };
  }, []);

  const tabs: Array<{ id: TestTab; label: string; telugu: string; count?: number }> = [
    { id: 'official', label: 'Official Papers', telugu: 'ప్రభుత్వ అధికారిక పేపర్లు', count: 10 },
    { id: 'practice', label: 'Practice Tests', telugu: 'సబ్జెక్ట్ ప్రాక్టీస్', count: 5 },
    { id: 'mock', label: 'Mock Tests', telugu: 'పూర్తి మాక్ టెస్టులు', count: 10 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Special APTET</Badge>
          <Badge variant="neutral">120 Questions • 120 Marks</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          పరీక్షలు (Tests & Papers)
        </h2>
        <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Practice with full-length Special APTET Paper 1A mock examinations.
        </p>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-brand-border no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-card hover:bg-brand-bg-paper text-brand-text-muted hover:text-brand-text border border-brand-border-light'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'mock' && (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-brand-text">10 Full-Length Mock Tests</h3>
              <p className="text-xs text-brand-text-muted">
                ప్రతి మాక్‌లో CDP 30 + Mathematics 30 + Telugu 30 + English 30 questions
              </p>
            </div>
            {!loadingMocks && !mockError && (
              <span className="text-xs font-semibold text-brand-primary bg-brand-primary-light px-3 py-1 rounded-full">
                {mockTests.length}/10 Ready
              </span>
            )}
          </div>

          {loadingMocks && (
            <div className="rounded-2xl bg-white border border-brand-border p-8 text-center text-sm text-brand-text-muted">
              Loading mock tests...
            </div>
          )}

          {mockError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">
              {mockError}
            </div>
          )}

          {!loadingMocks && !mockError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTests.map((test, index) => (
                <Card key={test.id} className="border-brand-border bg-brand-card hover:border-brand-primary/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="accent">Mock {String(index + 1).padStart(2, '0')}</Badge>
                      <span className="text-xs font-semibold text-brand-primary">Ready</span>
                    </div>

                    <h4 className="font-bold text-base text-brand-text">{test.title}</h4>
                    <p className="text-xs text-brand-secondary mt-1">
                      Full Paper 1A simulation
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-brand-border-light text-xs text-brand-text-muted">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {test.total_questions}
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {test.total_questions}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {test.duration_minutes}m
                      </div>
                    </div>

                    <Link href={`/tet-test?testId=${test.id}`} className="block mt-4">
                      <Button className="w-full justify-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Start Test
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab !== 'mock' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 text-sm text-amber-900 flex gap-3">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">This section is not connected yet.</p>
              <p className="text-xs mt-1">The fully functional Paper 1A mock series is available under Mock Tests.</p>
            </div>
          </div>

          {activeTab === 'official' && officialPapers.slice(0, 2).map((paper) => (
            <Card key={paper.id}><CardContent className="p-5"><b>{paper.title}</b><p className="text-sm text-brand-text-muted mt-1">Coming soon</p></CardContent></Card>
          ))}
          {activeTab === 'practice' && (
            <Card><CardContent className="p-5"><b>Subject-wise Practice Tests</b><p className="text-sm text-brand-text-muted mt-1">Coming soon</p></CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
