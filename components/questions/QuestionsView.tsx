'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  QuestionBankService,
  QuestionWithDocument,
} from '@/lib/services/questions';
import { DocumentService } from '@/lib/services/documents';
import { DatabaseDocument } from '@/lib/supabase/types';
import {
  Search,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  Calendar,
  Layers,
  FileText,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Files,
} from 'lucide-react';

export function QuestionsView() {
  const [questions, setQuestions] = useState<QuestionWithDocument[]>([]);
  const [documents, setDocuments] = useState<DatabaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [qData, dData] = await Promise.all([
          QuestionBankService.getQuestions(),
          DocumentService.getDocuments({ exam: 'special_aptet' }),
        ]);
        setQuestions(qData);
        setDocuments(dData);
      } catch (err) {
        console.error('Failed to load questions or documents:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Subject filter
      if (selectedSubject !== 'all') {
        const sub = (q.subject || '').toLowerCase();
        if (!sub.includes(selectedSubject.toLowerCase())) {
          return false;
        }
      }

      // Document filter
      if (selectedDocumentId !== 'all') {
        if (selectedDocumentId === 'official_only') {
          if (q.document?.document_type !== 'government_paper') {
            return false;
          }
        } else if (q.document_id !== selectedDocumentId) {
          return false;
        }
      }

      // Year filter
      if (selectedYear !== 'all') {
        if (q.year !== parseInt(selectedYear, 10)) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesText = q.question_text.toLowerCase().includes(query);
        const matchesOptions =
          q.option_a.toLowerCase().includes(query) ||
          q.option_b.toLowerCase().includes(query) ||
          q.option_c.toLowerCase().includes(query) ||
          q.option_d.toLowerCase().includes(query);
        const matchesSubject = (q.subject || '').toLowerCase().includes(query);

        if (!matchesText && !matchesOptions && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }, [questions, selectedSubject, selectedDocumentId, selectedYear, searchQuery]);

  // Statistics
  const officialCount = questions.filter(
    (q) => q.document?.document_type === 'government_paper'
  ).length;

  const answeredCount = questions.filter((q) => q.correct_answer !== null).length;

  const toggleAnswer = (id: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllAnswers = () => {
    const allShown = filteredQuestions.every((q) => showAnswers[q.id]);
    const newState: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => {
      newState[q.id] = !allShown;
    });
    setShowAnswers(newState);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Question Bank</Badge>
            <Badge variant="accent" size="sm" className="gap-1">
              <Award className="w-3 h-3" />
              <span>Special APTET Repository</span>
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
            ప్రశ్నల నిధి (Question Bank)
          </h2>
          <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
            Browse verified Special APTET questions extracted from official government papers and model examinations. Document provenance is strictly preserved for every question.
          </p>
        </div>

        {/* Header Action Link to Documents */}
        <Link href="/documents">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="gap-2 shadow-xs shrink-0 font-semibold"
          >
            <Files className="w-4 h-4 text-brand-accent" />
            <span>Manage Source Documents</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-brand-text-muted font-medium">Total Questions</span>
              <p className="text-xl font-extrabold text-brand-text">{questions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-brand-text-muted font-medium">Official Government Papers</span>
              <p className="text-xl font-extrabold text-amber-900">{officialCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-brand-text-muted font-medium">Verified Answer Keys</span>
              <p className="text-xl font-extrabold text-emerald-900">{answeredCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-5 rounded-2xl bg-brand-card border border-brand-border space-y-4 shadow-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ప్రశ్నలోని పదాలు లేదా భావనల ద్వారా శోధించండి (Search question text, options, keywords...)"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          {/* Subject Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Subject</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text font-medium"
            >
              <option value="all">All Subjects (అన్ని విభాగాలు)</option>
              <option value="Child Development">Child Development & Pedagogy (Special)</option>
              <option value="Telugu">Language I (Telugu)</option>
              <option value="English">Language II (English)</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Environmental Studies">Environmental Studies</option>
            </select>
          </div>

          {/* Source Document Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Source Document</span>
            </label>
            <select
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text font-medium truncate"
            >
              <option value="all">All Source Documents</option>
              <option value="official_only">★ Official Government Papers Only</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Year Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Exam Year</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text font-medium"
            >
              <option value="all">All Years (అన్ని సంవత్సరాలు)</option>
              <option value="2024">2024 Exam</option>
              <option value="2023">2023 Exam</option>
              <option value="2022">2022 Exam</option>
            </select>
          </div>

          {/* Toggle Reveal Answers Button */}
          <div className="space-y-1 flex flex-col justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAllAnswers}
              className="w-full gap-2 text-xs font-semibold h-[35px]"
            >
              <Eye className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Toggle Answer Keys</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
            Showing {filteredQuestions.length} Questions
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16 bg-brand-card rounded-2xl border border-brand-border text-brand-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            <span className="text-sm">ప్రశ్నలు లోడ్ అవుతున్నాయి... (Loading questions...)</span>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isAnswerShown = Boolean(showAnswers[q.id]);
              const isGovPaper = q.document?.document_type === 'government_paper';

              return (
                <Card
                  key={q.id}
                  className={`border transition-all bg-brand-card hover:border-brand-primary/40 ${
                    isGovPaper ? 'border-amber-200/80 shadow-xs' : 'border-brand-border'
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-primary text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                          {q.question_number}
                        </span>

                        {/* Document Source Badge (Preserving document_id provenance) */}
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 ${
                            isGovPaper
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-brand-primary-light text-brand-primary'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>
                            {isGovPaper ? '★ Official Paper: ' : ''}
                            {q.document?.title || 'Special APTET Paper'}
                          </span>
                        </span>

                        {/* Subject Badge */}
                        {q.subject && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-brand-bg-paper text-brand-text-muted border border-brand-border-light">
                            {q.subject}
                          </span>
                        )}
                      </div>

                      {/* Year & Confidence Indicator */}
                      <div className="flex items-center gap-2 text-xs">
                        {q.year && (
                          <span className="text-[11px] text-brand-text-subtle font-medium">
                            {q.year} Exam
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            q.confidence === 'high'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.confidence === 'medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.confidence || 'high'} confidence
                        </span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-base font-semibold text-brand-text leading-relaxed whitespace-pre-wrap">
                      {q.question_text}
                    </p>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {[
                        { key: 'A', text: q.option_a },
                        { key: 'B', text: q.option_b },
                        { key: 'C', text: q.option_c },
                        { key: 'D', text: q.option_d },
                      ].map((opt) => {
                        const isCorrect = q.correct_answer === opt.key;
                        const highlightCorrect = isAnswerShown && isCorrect;

                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-xl border text-sm flex items-start gap-2.5 transition-all ${
                              highlightCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                                : 'bg-brand-bg-paper/70 border-brand-border-light text-brand-text hover:bg-brand-bg-paper'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                                highlightCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-brand-primary-light text-brand-primary'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="flex-1 leading-snug">{opt.text}</span>
                            {highlightCorrect && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer: Answer Key & Explanation */}
                    <div className="pt-3 border-t border-brand-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        {q.correct_answer ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleAnswer(q.id)}
                              className="font-bold text-brand-accent hover:underline flex items-center gap-1.5 cursor-pointer"
                            >
                              {isAnswerShown ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Hide Answer Key</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Show Correct Answer</span>
                                </>
                              )}
                            </button>
                            {isAnswerShown && (
                              <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                Correct: Option ({q.correct_answer})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                            Answer Key: Separate Key Matching Pending
                          </span>
                        )}
                      </div>

                      {/* Document ID reference badge */}
                      <span className="text-[11px] text-brand-text-subtle font-mono truncate max-w-[240px]">
                        ID: {q.document_id ? q.document_id.slice(0, 16) + '...' : 'Preloaded'}
                      </span>
                    </div>

                    {/* Explanation if Answer is shown */}
                    {isAnswerShown && q.explanation && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">
                          Pedagogical Explanation:
                        </span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-brand-border bg-brand-card">
            <CardContent className="p-12">
              <EmptyState
                icon={HelpCircle}
                title="No questions match the selected filters."
                titleTelugu="ఎంపిక చేసిన ఫిల్టర్లకు సరిపోయే ప్రశ్నలు లేవు."
                description="Try clearing search filters or process a question paper from My Documents to populate the repository."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubject('all');
                      setSelectedDocumentId('all');
                      setSelectedYear('all');
                    }}
                  >
                    Reset All Filters
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
