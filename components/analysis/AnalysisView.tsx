'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3, PieChart, TrendingUp, History, AlertTriangle, ArrowRight, LucideIcon } from 'lucide-react';

type Section = 'overall' | 'subject' | 'history' | 'weak';
type HistoryRow = {
  attemptId: string;
  testTitle: string;
  completedAt: string | null;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  status: 'completed' | 'expired';
};
type AnalysisData = {
  attempts: HistoryRow[];
  summary: {
    testsAttempted: number;
    averageScore: number;
    averagePercentage: number;
    bestScore: number;
    bestPercentage: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
  };
  subjects: Array<{
    subject: string;
    answered: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    totalQuestions: number;
  }>;
};

const sections: Array<{ id: Section; label: string; telugu: string; icon: LucideIcon }> = [
  { id: 'overall', label: 'Overall Progress', telugu: 'మొత్తం పురోగతి', icon: TrendingUp },
  { id: 'subject', label: 'Subject Performance', telugu: 'సబ్జెక్ట్ పనితీరు', icon: PieChart },
  { id: 'history', label: 'Test History', telugu: 'పరీక్షల చరిత్ర', icon: History },
  { id: 'weak', label: 'Weak Subjects', telugu: 'బలహీన సబ్జెక్టులు', icon: AlertTriangle },
];

export function AnalysisView() {
  const [active, setActive] = useState<Section>('overall');
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tet/analysis', { cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load analysis.');
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analysis.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Performance Intelligence</Badge>
          <Badge variant="neutral">Live Test Data</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text">పరీక్షా విశ్లేషణ (Preparation Analysis)</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-brand-text-muted max-w-2xl">Your performance is calculated from completed TET attempts stored in Supabase.</p>
          <Link href="/test-history"><Button size="sm" variant="secondary">Full Test History</Button></Link>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-brand-border no-scrollbar">
        {sections.map((section) => {
          const Icon = section.icon;
          const activeClass = active === section.id ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-text-muted border border-brand-border-light';
          return (
            <button key={section.id} onClick={() => setActive(section.id)} className={'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap ' + activeClass}>
              <Icon className="w-4 h-4" />{section.label}
            </button>
          );
        })}
      </div>

      {loading && <Card><CardContent className="p-10 text-center text-sm text-brand-text-muted">Loading your analysis...</CardContent></Card>}
      {error && <Card><CardContent className="p-6 text-red-700">{error}</CardContent></Card>}

      {!loading && !error && data && data.summary.testsAttempted === 0 && (
        <Card><CardContent className="p-10">
          <EmptyState
            icon={BarChart3}
            title="No completed tests yet"
            titleTelugu="ఇంకా పూర్తి చేసిన పరీక్షలు లేవు"
            description="Complete a mock test to generate real performance analysis."
            descriptionTelugu="మీ నిజమైన పనితీరు విశ్లేషణ కోసం ఒక మాక్ టెస్ట్ పూర్తి చేయండి."
            action={<Link href="/tests"><Button variant="accent">Go to Tests <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>}
          />
        </CardContent></Card>
      )}

      {!loading && !error && data && data.summary.testsAttempted > 0 && (
        <>
          {active === 'overall' && <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="Tests Attempted" value={data.summary.testsAttempted} />
              <Metric label="Average Score" value={data.summary.averageScore + '/120'} />
              <Metric label="Average Accuracy" value={data.summary.averagePercentage + '%'} />
              <Metric label="Best Score" value={data.summary.bestScore + '/120'} />
            </div>
            <Card><CardContent className="p-6">
              <h3 className="font-bold text-lg">Answer Summary</h3>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Metric label="Correct" value={data.summary.totalCorrect} />
                <Metric label="Incorrect" value={data.summary.totalIncorrect} />
                <Metric label="Unanswered" value={data.summary.totalUnanswered} />
              </div>
            </CardContent></Card>
          </div>}

          {active === 'subject' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.subjects.map((subject) => (
              <Card key={subject.subject}><CardContent className="p-5">
                <div className="flex justify-between items-center"><h3 className="font-bold">{subject.subject}</h3><span className="font-bold text-emerald-700">{subject.accuracy}%</span></div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: subject.accuracy + '%' }} /></div>
                <p className="mt-2 text-xs text-brand-text-muted">{subject.correct} correct • {subject.incorrect} incorrect • {subject.answered} answered</p>
              </CardContent></Card>
            ))}
          </div>}

          {active === 'history' && <HistoryTable attempts={data.attempts} />}

          {active === 'weak' && <div className="grid gap-3">
            {[...data.subjects].sort((a, b) => a.accuracy - b.accuracy).map((subject) => (
              <Card key={subject.subject}><CardContent className="p-5 flex items-center justify-between">
                <div><h3 className="font-bold">{subject.subject}</h3><p className="text-xs text-brand-text-muted">{subject.correct} correct out of {subject.answered} answered</p></div>
                <Badge variant={subject.accuracy < 60 ? 'accent' : 'neutral'}>{subject.accuracy}%</Badge>
              </CardContent></Card>
            ))}
          </div>}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white border border-brand-border p-5"><span className="text-xs text-brand-text-muted">{label}</span><b className="block mt-1 text-2xl text-brand-text">{value}</b></div>;
}

function HistoryTable({ attempts }: { attempts: HistoryRow[] }) {
  if (!attempts.length) return <Card><CardContent className="p-8 text-center text-brand-text-muted">No completed attempts yet.</CardContent></Card>;
  return <div className="space-y-3">
    {attempts.map((attempt) => (
      <Card key={attempt.attemptId}><CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="font-bold">{attempt.testTitle}</h3><p className="text-xs text-brand-text-muted">{attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'Completed'} • {attempt.status}</p></div>
        <div className="flex items-center gap-4"><div className="text-right"><b className="block text-lg">{attempt.score}/{attempt.totalMarks}</b><span className="text-xs text-brand-text-muted">{attempt.percentage}%</span></div><Link href={'/tet-review/' + attempt.attemptId}><Button size="sm" variant="secondary">Review</Button></Link></div>
      </CardContent></Card>
    ))}
  </div>;
}
