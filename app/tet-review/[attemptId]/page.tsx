'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type ReviewItem = {
  question_id: number;
  question_order: number;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  selected_option: number | null;
  correct_option: number;
  is_correct: boolean | null;
};

type ReviewResponse = {
  result: {
    score: number;
    totalMarks: number;
    answered: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    status: 'completed' | 'expired';
  };
  review: ReviewItem[];
};

const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'] as const;

export default function TetReviewPage() {
  const router = useRouter();
  const params = useParams<{ attemptId: string }>();
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.attemptId) return;

    fetch('/api/tet/attempts/' + params.attemptId + '/review', { cache: 'no-store' })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || 'Failed to load review.');
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load review.'));
  }, [params.attemptId]);

  if (error) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unable to load review</h1>
          <p className="mt-2 text-red-600">{error}</p>
          <button onClick={() => router.push('/tests')} className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">
            Back to Tests
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main className="min-h-screen grid place-items-center">Loading review...</main>;
  }

  const { result, review } = data;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-emerald-600">TET ASSIST</p>
          <h1 className="mt-1 text-2xl font-bold">Test Review</h1>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Score" value={`${result.score}/${result.totalMarks}`} />
            <Stat label="Correct" value={result.correct} />
            <Stat label="Incorrect" value={result.incorrect} />
            <Stat label="Unanswered" value={result.unanswered} />
          </div>
        </header>

        {review.map((item) => (
          <article key={item.question_id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-emerald-700">Question {item.question_order}</span>
              <span className={item.is_correct ? 'text-sm font-bold text-emerald-700' : item.selected_option === null ? 'text-sm font-bold text-slate-500' : 'text-sm font-bold text-red-700'}>
                {item.is_correct ? 'Correct' : item.selected_option === null ? 'Unanswered' : 'Incorrect'}
              </span>
            </div>
            <h2 className="mt-3 font-semibold leading-7">{item.question}</h2>

            <div className="mt-4 space-y-2">
              {optionKeys.map((key, index) => {
                const option = index + 1;
                const isCorrect = option === item.correct_option;
                const isSelected = option === item.selected_option;
                return (
                  <div
                    key={key}
                    className={[
                      'rounded-xl border p-3',
                      isCorrect ? 'border-emerald-500 bg-emerald-50' :
                      isSelected ? 'border-red-400 bg-red-50' :
                      'border-slate-200',
                    ].join(' ')}
                  >
                    <b className="mr-2">{String.fromCharCode(64 + option)}.</b>
                    {item[key]}
                    {isCorrect && <span className="ml-2 text-xs font-bold text-emerald-700">Correct Answer</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-xs font-bold text-red-700">Your Answer</span>}
                  </div>
                );
              })}
            </div>
          </article>
        ))}

        <button onClick={() => router.push('/tests')} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
          Back to Tests
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <b className="block text-xl">{value}</b>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
