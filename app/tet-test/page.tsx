'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle2, XCircle, Loader2, Globe } from 'lucide-react';

type Question = {
  question_id: number;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_order: number;
};

type Test = {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
};

type Feedback = {
  isCorrect: boolean;
  correctOption: number;
  selectedOption: number;
};

type TranslatedContent = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

function TetTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId') || 'c97f31ea-1125-4ff7-84bc-d9e52f2c3803';

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Immediate feedback map: question_id -> Feedback
  const [feedbackMap, setFeedbackMap] = useState<Record<number, Feedback>>({});
  const [evaluatingMap, setEvaluatingMap] = useState<Record<number, boolean>>({});

  // Question Language toggle: question_id -> 'en' | 'te'
  const [questionLangMap, setQuestionLangMap] = useState<Record<number, 'en' | 'te'>>({});
  // Question Translation cache: question_id -> TranslatedContent
  const [translationMap, setTranslationMap] = useState<Record<number, TranslatedContent>>({});
  const [translatingMap, setTranslatingMap] = useState<Record<number, boolean>>({});

  // Gemini Explanation language toggle: question_id -> 'en' | 'te'
  const [explanationLangMap, setExplanationLangMap] = useState<Record<number, 'en' | 'te'>>({});
  // Gemini Explanation cache: `${question_id}_${lang}` -> explanation text
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({});
  const [explainingMap, setExplainingMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const r = await fetch('/api/tet/tests/' + testId);
        const d = await r.json();
        if (!r.ok || !d.success) throw new Error(d.error || 'Failed to load test.');
        if (!isMounted) return;
        setTest(d.test);
        setQuestions(d.questions);
        setSeconds(d.test.duration_minutes * 60);

        const a = await fetch('/api/tet/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: d.test.id || testId }),
        });
        const ad = await a.json();
        if (!a.ok || !ad.success) throw new Error(ad.error || 'Failed to start test.');
        if (!isMounted) return;
        setAttemptId(ad.attemptId);
        setSeconds(ad.durationMinutes * 60);
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Failed to start test.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [testId]);

  useEffect(() => {
    if (!attemptId || submitting || seconds <= 0) return;
    const t = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [attemptId, submitting, seconds]);

  useEffect(() => {
    if (seconds === 0 && attemptId && !submitting) submit(true);
  }, [seconds, attemptId, submitting]);

  const time = useMemo(
    () =>
      String(Math.floor(seconds / 60)).padStart(2, '0') +
      ':' +
      String(seconds % 60).padStart(2, '0'),
    [seconds]
  );

  const q = questions[current];
  const qId = q?.question_id;
  const currentLang = qId ? questionLangMap[qId] || 'en' : 'en';
  const currentFeedback = qId ? feedbackMap[qId] : undefined;
  const isEvaluating = qId ? Boolean(evaluatingMap[qId]) : false;
  const isTranslating = qId ? Boolean(translatingMap[qId]) : false;
  const currentTranslation = qId ? translationMap[qId] : undefined;

  const currentExplanationLang = qId ? explanationLangMap[qId] || 'en' : 'en';
  const explanationKey = qId ? `${qId}_${currentExplanationLang}` : '';
  const currentExplanation = explanationKey ? explanationMap[explanationKey] : undefined;
  const isExplaining = qId ? Boolean(explainingMap[qId]) : false;

  // Active question text & options based on language toggle
  const displayQuestion =
    currentLang === 'te' && currentTranslation ? currentTranslation.question : q?.question;
  const displayOptionA =
    currentLang === 'te' && currentTranslation ? currentTranslation.option_a : q?.option_a;
  const displayOptionB =
    currentLang === 'te' && currentTranslation ? currentTranslation.option_b : q?.option_b;
  const displayOptionC =
    currentLang === 'te' && currentTranslation ? currentTranslation.option_c : q?.option_c;
  const displayOptionD =
    currentLang === 'te' && currentTranslation ? currentTranslation.option_d : q?.option_d;

  const opts = [displayOptionA, displayOptionB, displayOptionC, displayOptionD];

  // Request Gemini Explanation
  async function fetchExplanation(
    questionObj: Question,
    feedback: Feedback,
    lang: 'en' | 'te'
  ) {
    const key = `${questionObj.question_id}_${lang}`;
    if (explanationMap[key]) return;

    setExplainingMap((prev) => ({ ...prev, [questionObj.question_id]: true }));
    try {
      const res = await fetch('/api/tet/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionObj.question,
          options: {
            a: questionObj.option_a,
            b: questionObj.option_b,
            c: questionObj.option_c,
            d: questionObj.option_d,
          },
          selectedOption: feedback.selectedOption,
          correctOption: feedback.correctOption,
          subject: questionObj.subject,
          language: lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setExplanationMap((prev) => ({ ...prev, [key]: data.explanation }));
      } else {
        setExplanationMap((prev) => ({
          ...prev,
          [key]: 'Explanation temporarily unavailable.',
        }));
      }
    } catch {
      setExplanationMap((prev) => ({
        ...prev,
        [key]: 'Explanation temporarily unavailable.',
      }));
    } finally {
      setExplainingMap((prev) => ({ ...prev, [questionObj.question_id]: false }));
    }
  }

  // Handle Question Language Toggle
  async function toggleQuestionLanguage(targetLang: 'en' | 'te') {
    if (!q) return;
    setQuestionLangMap((prev) => ({ ...prev, [q.question_id]: targetLang }));

    if (targetLang === 'te' && !translationMap[q.question_id]) {
      setTranslatingMap((prev) => ({ ...prev, [q.question_id]: true }));
      try {
        const res = await fetch('/api/tet/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.question,
            options: {
              a: q.option_a,
              b: q.option_b,
              c: q.option_c,
              d: q.option_d,
            },
            subject: q.subject,
          }),
        });
        const data = await res.json();
        if (data.success && data.translated) {
          setTranslationMap((prev) => ({
            ...prev,
            [q.question_id]: data.translated,
          }));
        }
      } catch (err) {
        console.warn('Failed to translate question:', err);
      } finally {
        setTranslatingMap((prev) => ({ ...prev, [q.question_id]: false }));
      }
    }
  }

  // Handle Explanation Language Toggle
  function toggleExplanationLanguage(targetLang: 'en' | 'te') {
    if (!q || !currentFeedback) return;
    setExplanationLangMap((prev) => ({ ...prev, [q.question_id]: targetLang }));
    fetchExplanation(q, currentFeedback, targetLang);
  }

  // Choose option with immediate server-side feedback
  async function choose(option: number) {
    if (!attemptId || !q || submitting || isEvaluating) return;
    // Do not allow changing answer once evaluated
    if (feedbackMap[q.question_id]) return;

    setAnswers((a) => ({ ...a, [q.question_id]: option }));
    setEvaluatingMap((prev) => ({ ...prev, [q.question_id]: true }));

    try {
      const r = await fetch('/api/tet/attempts/' + attemptId + '/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.question_id, selectedOption: option }),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || 'Could not evaluate answer.');

      const feedback: Feedback = {
        isCorrect: Boolean(d.isCorrect),
        correctOption: Number(d.correctOption),
        selectedOption: Number(d.selectedOption),
      };

      setFeedbackMap((prev) => ({ ...prev, [q.question_id]: feedback }));

      // Automatically trigger Gemini explanation in current preferred language
      const explLang = explanationLangMap[q.question_id] || (currentLang === 'te' ? 'te' : 'en');
      setExplanationLangMap((prev) => ({ ...prev, [q.question_id]: explLang }));
      fetchExplanation(q, feedback, explLang);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save answer.');
    } finally {
      setEvaluatingMap((prev) => ({ ...prev, [q.question_id]: false }));
    }
  }

  async function submit(expired = false) {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/tet/attempts/' + attemptId + '/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expired }),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || 'Could not submit test.');
      sessionStorage.setItem('tet-result', JSON.stringify(d.result));
      router.push('/tet-result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit test.');
      setSubmitting(false);
    }
  }

  if (loading) return <main className="min-h-screen grid place-items-center">Loading TET test...</main>;
  if (error && !q)
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unable to start test</h1>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </main>
    );
  if (!q || !test) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-20">
      <div className="mx-auto max-w-6xl">
        {/* Test Header */}
        <header className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-brand-border">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-brand-primary tracking-wider uppercase">TET ASSIST</span>
              <span className="text-xs text-brand-secondary font-medium">• Special APTET</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">{test.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Question {current + 1} of {questions.length} • <span className="text-brand-secondary">{q.subject}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700">
              Answered {Object.keys(answers).length}/{questions.length}
            </span>
            <span className="rounded-xl bg-red-50 px-3.5 py-2 text-base sm:text-lg font-bold text-red-700 border border-red-100">
              {time}
            </span>
          </div>
        </header>

        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Main Question Card */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7 border border-slate-200 flex flex-col justify-between">
            <div>
              {/* Question Top Bar: Order + Subject + Language Toggle */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Question {q.question_order}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {q.subject}
                  </span>
                </div>

                {/* Language Toggle: తెలుగు | English */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
                  <div className="flex items-center gap-1 pl-1 text-[11px] text-slate-500">
                    <Globe className="w-3 h-3" />
                    <span>భాష:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleQuestionLanguage('te')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      currentLang === 'te'
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:text-emerald-700'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleQuestionLanguage('en')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      currentLang === 'en'
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:text-emerald-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Translation in progress indicator */}
              {isTranslating && (
                <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-emerald-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Translating question and options into natural Telugu...</span>
                </div>
              )}

              {/* Question Text — 18-21px mobile, 20-24px desktop */}
              <h2 className="mt-3 text-lg sm:text-xl lg:text-[22px] font-bold leading-relaxed text-slate-900 font-sans">
                {displayQuestion}
              </h2>

              {/* Options List — 16-18px readable typography with comfortable touch targets */}
              <div className="mt-6 space-y-3">
                {opts.map((text, i) => {
                  const n = i + 1;
                  const isSelected = answers[q.question_id] === n;
                  const isCorrect = currentFeedback && currentFeedback.correctOption === n;
                  const isWrongSelected =
                    currentFeedback && !currentFeedback.isCorrect && currentFeedback.selectedOption === n;

                  let optionStyle = 'border-slate-200 bg-white hover:border-emerald-600/60 hover:bg-emerald-50/20 text-slate-900';

                  if (currentFeedback) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs';
                    } else if (isWrongSelected) {
                      optionStyle = 'border-red-500 bg-red-50 text-red-950 font-semibold shadow-xs';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold';
                  }

                  return (
                    <button
                      key={n}
                      disabled={Boolean(currentFeedback) || isEvaluating}
                      onClick={() => choose(n)}
                      className={`w-full min-h-[52px] rounded-xl border p-4 text-left transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <b className="font-bold text-base text-slate-700 shrink-0 mt-0.5">
                          {String.fromCharCode(64 + n)}.
                        </b>
                        <span className="text-base sm:text-[17px] leading-relaxed">{text}</span>
                      </div>

                      {/* Right feedback badge indicator */}
                      {currentFeedback && isCorrect && (
                        <span className="shrink-0 ml-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Answer</span>
                        </span>
                      )}
                      {currentFeedback && isWrongSelected && (
                        <span className="shrink-0 ml-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Your Choice</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Evaluating spinner status */}
              {isEvaluating && (
                <div className="mt-4 p-3 rounded-xl bg-slate-100 text-slate-700 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span className="font-medium">Checking official answer...</span>
                </div>
              )}

              {/* Immediate Feedback Banner */}
              {currentFeedback && (
                <div
                  className={`mt-5 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    currentFeedback.isCorrect
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                      : 'bg-red-50/90 border-red-200 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentFeedback.isCorrect ? (
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm sm:text-base">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>✓ Correct Answer!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-red-700 text-sm sm:text-base">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span>✕ Incorrect Answer</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-semibold flex items-center gap-2 text-slate-700">
                    <span>
                      Your Answer: <b>Option {String.fromCharCode(64 + currentFeedback.selectedOption)}</b>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-800 font-bold">
                      Correct Answer: Option {String.fromCharCode(64 + currentFeedback.correctOption)}
                    </span>
                  </div>
                </div>
              )}

              {/* Gemini AI Detailed Explanation Area */}
              {currentFeedback && (
                <div className="mt-5 p-5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 text-slate-900 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-sm text-indigo-950">Gemini AI Pedagogy Explanation</span>
                    </div>

                    {/* Explanation Language Toggle: English | తెలుగు */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-indigo-200 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => toggleExplanationLanguage('en')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          currentExplanationLang === 'en'
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExplanationLanguage('te')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          currentExplanationLang === 'te'
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        తెలుగు వివరణ
                      </button>
                    </div>
                  </div>

                  {isExplaining ? (
                    <div className="py-4 text-xs font-medium text-indigo-700 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Generating detailed Gemini pedagogy explanation...</span>
                    </div>
                  ) : (
                    <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                      {currentExplanation || 'Explanation temporarily unavailable.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={current === 0}
                onClick={() => setCurrent((v) => v - 1)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-default"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-medium">
                {currentFeedback ? 'Answer Evaluated' : 'Select an option to evaluate'}
              </span>
              {current === questions.length - 1 ? (
                <button
                  disabled={submitting}
                  onClick={() => submit(false)}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrent((v) => v + 1)}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          </section>

          {/* Right Question Palette — Compact on mobile */}
          <aside className="rounded-2xl bg-white p-4 shadow-2xs border border-brand-border h-fit">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Questions Palette
              </h3>
              <span className="text-[11px] font-medium text-slate-500">
                {Object.keys(answers).length} / {questions.length} answered
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-5 gap-1.5 max-h-[220px] lg:max-h-[520px] overflow-y-auto p-1">
              {questions.map((x, i) => {
                const fb = feedbackMap[x.question_id];
                const isCur = current === i;

                let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
                if (fb) {
                  btnStyle = fb.isCorrect
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-red-500 text-white border-red-600';
                } else if (answers[x.question_id]) {
                  btnStyle = 'bg-emerald-600 text-white';
                }

                return (
                  <button
                    key={x.question_id}
                    onClick={() => setCurrent(i)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${btnStyle} ${
                      isCur ? 'ring-2 ring-emerald-600 ring-offset-1 font-extrabold shadow-xs' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span>Correct Answer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500 shrink-0" />
                <span>Incorrect Answer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 shrink-0" />
                <span>Unanswered</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function TetTestPage() {
  return (
    <Suspense fallback={<main className="min-h-screen grid place-items-center">Loading TET test...</main>}>
      <TetTestContent />
    </Suspense>
  );
}