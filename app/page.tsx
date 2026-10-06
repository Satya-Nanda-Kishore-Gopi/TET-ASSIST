import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Bot,
  BookOpen,
  Calendar,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants/theme';

export default function HomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Section — Calm Educational Green Aesthetic */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#235338] via-[#2A6142] to-[#1E4830] text-white p-7 sm:p-10 shadow-sm border border-emerald-900/10">
        {/* Soft decorative background accents */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 w-56 h-56 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Target Exam Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Special APTET 2024 / 2025 • Paper 1A</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {APP_CONFIG.name}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-emerald-100 font-telugu">
              మీ APTET preparation companion
            </p>
          </div>

          {/* Subtitle & Tagline */}
          <p className="text-base sm:text-lg text-emerald-50/90 font-medium leading-relaxed">
            Prepare smarter. Practice better. Learn with AI.
          </p>

          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-2xl font-telugu">
            Prepare with authentic Paper 1A questions, AI explanations and Telugu-friendly learning.
            (నిజమైన పేపర్ 1A ప్రశ్నలు, AI వివరణలు మరియు తెలుగు మాధ్యమ అభ్యసనంతో సులభంగా ప్రిపేర్ అవ్వండి).
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/tests"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-[#1B422D] font-bold text-sm sm:text-base shadow-sm hover:bg-emerald-50 active:scale-[0.98] transition-all"
            >
              <FileText className="w-4 h-4 text-[#235338]" />
              <span>Start Mock Test</span>
              <span className="text-xs font-normal text-emerald-800 hidden sm:inline">
                (పరీక్ష ప్రారంభించండి)
              </span>
            </Link>

            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-semibold text-sm sm:text-base border border-emerald-400/30 active:scale-[0.98] transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-300" />
              <span>Ask AI</span>
              <span className="text-xs font-normal text-emerald-200 hidden sm:inline">
                (AI ని అడగండి)
              </span>
            </Link>
          </div>

          {/* Secondary Quick Links */}
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-emerald-100/90 font-medium">
            <span className="text-emerald-200/60">Quick Access:</span>
            <Link
              href="/study"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study • చదువు</span>
            </Link>
            <Link
              href="/study-plan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Study Plan • చదువు ప్రణాళిక</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid — Clean 4 Essential Modules */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-brand-text tracking-tight">
              Core Modules • ముఖ్య విభాగాలు
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Everything you need for Special APTET Paper 1A preparation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Tests */}
          <Link
            href="/tests"
            className="group block p-6 rounded-2xl bg-white border border-brand-border hover:border-brand-primary/50 shadow-xs hover:shadow-sm transition-all relative"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-primary flex items-center justify-center shrink-0 border border-emerald-100">
                <FileText className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                10 Mock Tests Live
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors flex items-center justify-between">
                <span>Mock Tests</span>
                <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs font-medium text-brand-secondary font-telugu">
                మాక్ పరీక్షలు • 120 ప్రశ్నలు • 150 నిమిషాలు
              </p>
              <p className="text-xs text-brand-text-muted leading-relaxed pt-1">
                Take authentic 120-question examinations with instant correct/incorrect feedback, official answers, and Telugu translations.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border-light flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <span>Start Mock Test</span>
              <span className="font-telugu font-normal text-brand-text-subtle">• పరీక్ష ప్రారంభించండి</span>
            </div>
          </Link>

          {/* Card 2: Ask AI */}
          <Link
            href="/chat"
            className="group block p-6 rounded-2xl bg-white border border-brand-border hover:border-brand-primary/50 shadow-xs hover:shadow-sm transition-all relative"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-accent flex items-center justify-center shrink-0 border border-amber-100">
                <Bot className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-brand-accent bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Bilingual AI
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors flex items-center justify-between">
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs font-medium text-brand-secondary font-telugu">
                AI సహాయకుడు • సందేహాలు అడగండి
              </p>
              <p className="text-xs text-brand-text-muted leading-relaxed pt-1">
                Ask questions on Child Development, Inclusive Education, Math formulas, and pedagogy. Get explanations in natural Telugu or English.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border-light flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <span>Ask AI a Question</span>
              <span className="font-telugu font-normal text-brand-text-subtle">• AI ని అడగండి</span>
            </div>
          </Link>

          {/* Card 3: Study */}
          <Link
            href="/study"
            className="group block p-6 rounded-2xl bg-white border border-brand-border hover:border-brand-primary/50 shadow-xs hover:shadow-sm transition-all relative"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#1B5E20] flex items-center justify-center shrink-0 border border-teal-100">
                <BookOpen className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-brand-text-muted bg-stone-100 px-2.5 py-1 rounded-full">
                4 Subjects
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors flex items-center justify-between">
                <span>Study</span>
                <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs font-medium text-brand-secondary font-telugu">
                స్టడీ మెటీరియల్ • ముఖ్య భావనలు
              </p>
              <p className="text-xs text-brand-text-muted leading-relaxed pt-1">
                Learn core syllabus topics for Child Development & Pedagogy, Mathematics, Telugu, and English structured for Paper 1A.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border-light flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <span>Open Study Modules</span>
              <span className="font-telugu font-normal text-brand-text-subtle">• చదువు</span>
            </div>
          </Link>

          {/* Card 4: Study Plan */}
          <Link
            href="/study-plan"
            className="group block p-6 rounded-2xl bg-white border border-brand-border hover:border-brand-primary/50 shadow-xs hover:shadow-sm transition-all relative"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-primary flex items-center justify-center shrink-0 border border-emerald-100">
                <Calendar className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-brand-text-muted bg-stone-100 px-2.5 py-1 rounded-full">
                Daily Focus
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors flex items-center justify-between">
                <span>Study Plan</span>
                <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs font-medium text-brand-secondary font-telugu">
                చదువు ప్రణాళిక • నేటి లక్ష్యాలు
              </p>
              <p className="text-xs text-brand-text-muted leading-relaxed pt-1">
                Follow recommended daily study routines across CDP, Math, Telugu, and English to balance your preparation timeline.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border-light flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <span>View Study Plan</span>
              <span className="font-telugu font-normal text-brand-text-subtle">• చదువు ప్రణాళిక</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust & Syllabus Note */}
      <section className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200/80 text-xs text-brand-text-muted flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-brand-text">
            Special APTET Paper 1A (Classes I to V — Special Education)
          </p>
          <p className="leading-relaxed">
            120 Questions (30 CDP, 30 Mathematics, 30 Telugu, 30 English) • Independent preparation companion designed for teacher aspirants.
          </p>
        </div>
      </section>
    </div>
  );
}
