'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Brain,
  Calculator,
  BookOpen,
  Languages,
  Clock,
  ArrowRight,
  FileText,
  Bot,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

interface DailySubjectPlan {
  id: string;
  subject: string;
  teluguSubject: string;
  suggestedFocus: string;
  recommendedMinutes: number;
  icon: typeof Brain;
  color: string;
  bgColor: string;
}

const TODAY_PLAN: DailySubjectPlan[] = [
  {
    id: 'cdp',
    subject: 'Child Development & Pedagogy',
    teluguSubject: 'శిశు వికాసం మరియు పెడగాగి',
    suggestedFocus: "Piaget's Cognitive Development & Inclusive Classroom Accommodations (RPwD Act 2016)",
    recommendedMinutes: 45,
    icon: Brain,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'mathematics',
    subject: 'Mathematics',
    teluguSubject: 'గణిత శాస్త్రం & బోధనా పద్ధతులు',
    suggestedFocus: 'Fractions, Decimals, Basic Geometry angles, and Primary TLM methods',
    recommendedMinutes: 30,
    icon: Calculator,
    color: 'text-amber-800',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'telugu',
    subject: 'Telugu (Language I)',
    teluguSubject: 'తెలుగు భాషా బోధన',
    suggestedFocus: 'సవర్ణదీర్ఘ & గుణ సంధులు, తత్పురుష సమాసాలు, భాషా నైపుణ్యాలు (LSRW)',
    recommendedMinutes: 30,
    icon: BookOpen,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'english',
    subject: 'English (Language II)',
    teluguSubject: 'ఆంగ్ల భాషా బోధన',
    suggestedFocus: 'Parts of Speech, Prepositions, Tense forms, and Communicative Language Teaching (CLT)',
    recommendedMinutes: 30,
    icon: Languages,
    color: 'text-stone-800',
    bgColor: 'bg-stone-100 border-stone-200',
  },
];

export function StudyPlanView() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Study Plan (చదువు ప్రణాళిక)
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Recommended daily preparation schedule and topic allocations for Special APTET Paper 1A.
        </p>
      </div>

      {/* Today's Study Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-brand-text">
              Today&apos;s Study (నేటి అధ్యయనం)
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            4 Core Subjects
          </span>
        </div>

        {/* 4 Subjects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TODAY_PLAN.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.id}
                className="border border-brand-border hover:border-brand-primary/40 transition-all bg-white rounded-2xl shadow-2xs"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${item.bgColor}`}
                        >
                          <Icon className={`w-5 h-5 stroke-[2] ${item.color}`} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-brand-text">
                            {item.subject}
                          </h3>
                          <p className="text-xs font-medium text-brand-secondary font-telugu">
                            {item.teluguSubject}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-text-muted bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                        <Clock className="w-3 h-3 text-brand-secondary" />
                        <span>{item.recommendedMinutes} mins</span>
                      </div>
                    </div>

                    {/* Today's Recommended Focus */}
                    <div className="p-3 rounded-xl bg-brand-bg-paper border border-brand-border-light space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-subtle">
                        Recommended Focus Today:
                      </span>
                      <p className="text-xs font-medium text-brand-text leading-relaxed">
                        {item.suggestedFocus}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-brand-border-light flex items-center justify-between gap-2">
                    <Link
                      href="/study"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-hover"
                    >
                      <span>Study Concepts</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/chat"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-brand-primary hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask AI</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommended Strategy Guide */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-2xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary">
          Recommended Daily Routine for Special APTET
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-brand-bg-paper border border-brand-border-light space-y-1">
            <span className="font-bold text-brand-primary">1. Concept Learning (1.5 hrs)</span>
            <p className="text-brand-text-muted leading-relaxed">
              Focus on CDP pedagogy, inclusive education theories, and Telugu/English grammar rules.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-bg-paper border border-brand-border-light space-y-1">
            <span className="font-bold text-brand-accent">2. Practice & Mock Test (2.5 hrs)</span>
            <p className="text-brand-text-muted leading-relaxed">
              Solve full 120-question Paper 1A mock tests to build stamina and speed.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-bg-paper border border-brand-border-light space-y-1">
            <span className="font-bold text-brand-secondary">3. Doubt Resolution (30 min)</span>
            <p className="text-brand-text-muted leading-relaxed">
              Use Ask AI to clarify questions and read Telugu explanations for incorrect choices.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs sm:text-sm hover:bg-brand-primary-hover shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Practice Today&apos;s Mock Test</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
