'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Attempt = {
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

export default function TestHistoryPage() {
  const [history, setHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tet/history', { cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load history.');
        setHistory(json.history || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-bold text-emerald-600">TET ASSIST</p>
          <h1 className="mt-1 text-2xl font-bold">Test History</h1>
          <p className="mt-1 text-sm text-slate-500">Your completed Special APTET test attempts.</p>
        </div>

        {loading && <div className="rounded-2xl bg-white p-8 text-center">Loading history...</div>}
        {error && <div className="rounded-2xl bg-red-50 p-5 text-red-700">{error}</div>}

        {!loading && !error && history.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center">
            <h2 className="text-lg font-bold">No completed tests yet</h2>
            <p className="mt-2 text-sm text-slate-500">Complete a mock test to see your results here.</p>
            <Link href="/tests" className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">Go to Tests</Link>
          </div>
        )}

        <div className="space-y-3">
          {history.map((attempt) => (
            <div key={attempt.attemptId} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold">{attempt.testTitle}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'Completed'} • {attempt.status}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div><b className="block text-xl">{attempt.score}/{attempt.totalMarks}</b><span className="text-xs text-slate-500">Score</span></div>
                  <div><b className="block text-xl">{attempt.percentage}%</b><span className="text-xs text-slate-500">Accuracy</span></div>
                  <div className="text-xs text-slate-500">
                    <div>{attempt.correct} correct</div>
                    <div>{attempt.incorrect} incorrect</div>
                    <div>{attempt.unanswered} unanswered</div>
                  </div>
                  <Link href={'/tet-review/' + attempt.attemptId} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Review</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
