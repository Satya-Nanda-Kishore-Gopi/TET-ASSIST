'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Brain,
  Calculator,
  BookOpen,
  Languages,
  ArrowRight,
  Bot,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SubjectInfo {
  id: string;
  name: string;
  teluguName: string;
  shortDesc: string;
  icon: typeof Brain;
  color: string;
  accentBg: string;
  keyConcepts: string[];
}

const SUBJECTS: SubjectInfo[] = [
  {
    id: 'cdp',
    name: 'Child Development & Pedagogy',
    teluguName: 'శిశు వికాసం మరియు పెడగాగి (CDP)',
    shortDesc: 'Learn concepts, theories and teaching methods.',
    icon: Brain,
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-50 border-emerald-200',
    keyConcepts: [
      "Piaget's Stages of Cognitive Development (ఇంద్రియ ప్రచాలక, పూర్వ, మూర్త, అమూర్త దశలు)",
      "Vygotsky's Sociocultural Theory & Scaffolding (సాంస్కృతిక-సామాజిక సిద్ధాంతం, MKO)",
      'Kohlberg Moral Development Stages (నైతిక వికాస దశలు)',
      'Inclusive Education & RPwD Act 2016 (సమ్మిళిత విద్య, 21 వైకల్యాలు)',
      'Special Education Methods & Individualized Education Program (IEP)',
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    teluguName: 'గణిత శాస్త్రం & బోధనా పద్ధతులు',
    shortDesc: 'Master number system, arithmetic, geometry and mathematics pedagogy.',
    icon: Calculator,
    color: 'text-amber-800',
    accentBg: 'bg-amber-50 border-amber-200',
    keyConcepts: [
      'Number System, Place Values & Prime Numbers (సంఖ్యామానం, ప్రధాన సంఖ్యలు)',
      'Fractions, Decimals & Percentages (భిన్నాలు, దశాంశాలు, శాతాలు)',
      'Basic Geometry, Angles & Mensuration (రేఖాగణితం, వైశాల్యం, చుట్టుకొలత)',
      'Mathematics Teaching Methods & Bloom Taxonomy (గణిత బోధనా పద్ధతులు, లక్ష్యాలు)',
      'Teaching Learning Materials (TLM) in Mathematics for Primary Classes',
    ],
  },
  {
    id: 'telugu',
    name: 'Telugu (Language I)',
    teluguName: 'తెలుగు భాష మరియు బోధనా పద్ధతులు',
    shortDesc: 'Telugu grammar, comprehension, vocabulary and language teaching methods.',
    icon: BookOpen,
    color: 'text-emerald-800',
    accentBg: 'bg-emerald-50 border-emerald-200',
    keyConcepts: [
      'వర్ణమాల, అచ్చులు, హల్లులు మరియు ఉభయాక్షరాలు',
      'సంధులు: సవర్ణదీర్ఘ, గుణ, యణాదేశ, వృద్ధి మరియు తెలుగు సంధులు',
      'సమాసాలు: తత్పురుష, ద్వంద్వ, ద్విగు, బహువ్రీహి సమాసాలు',
      'భాషా నైపుణ్యాలు: శ్రవణం, భాషణం, పఠనం, లేఖనం (LSRW)',
      'నిరంతర సమగ్ర మూల్యాంకనం (CCE) మరియు బోధనా పద్ధతులు',
    ],
  },
  {
    id: 'english',
    name: 'English (Language II)',
    teluguName: 'ఆంగ్ల భాష మరియు బోధనా పద్ధతులు',
    shortDesc: 'Grammar concepts, vocabulary, sentence structures and English language pedagogy.',
    icon: Languages,
    color: 'text-stone-800',
    accentBg: 'bg-stone-100 border-stone-200',
    keyConcepts: [
      'Parts of Speech: Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions',
      'Tenses & Subject-Verb Agreement in context',
      'Active & Passive Voice, Direct & Indirect Speech rules',
      'Reading Comprehension & Vocabulary usage (Synonyms, Antonyms, Idioms)',
      'Methods of Teaching English: Direct Method, Bilingual, Communicative Approach (CLT)',
    ],
  },
];

export function StudyView() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>('cdp');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Study (చదువు)
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Select a subject to explore core concepts, theories, and syllabus guidelines for Special APTET Paper 1A.
        </p>
      </div>

      {/* 4 Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUBJECTS.map((subject) => {
          const Icon = subject.icon;
          const isSelected = selectedSubjectId === subject.id;

          return (
            <Card
              key={subject.id}
              className={`border transition-all rounded-2xl bg-white ${
                isSelected
                  ? 'border-brand-primary ring-1 ring-brand-primary shadow-xs'
                  : 'border-brand-border hover:border-brand-primary/40'
              }`}
            >
              <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  {/* Icon & Subject Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${subject.accentBg}`}
                      >
                        <Icon className={`w-6 h-6 stroke-[2] ${subject.color}`} />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-brand-text">
                          {subject.name}
                        </h2>
                        <p className="text-xs font-medium text-brand-secondary font-telugu">
                          {subject.teluguName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                    &ldquo;{subject.shortDesc}&rdquo;
                  </p>

                  {/* Key Concepts List Preview */}
                  <div className="pt-2 border-t border-brand-border-light space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-subtle">
                      Core Topics:
                    </span>
                    <ul className="space-y-1 text-xs text-brand-text">
                      {subject.keyConcepts.slice(0, 3).map((concept, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-secondary shrink-0 mt-0.5" />
                          <span className="truncate">{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Open / Study Button */}
                <div className="pt-2">
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    size="md"
                    onClick={() =>
                      setSelectedSubjectId(isSelected ? null : subject.id)
                    }
                    className="w-full justify-center gap-2 font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    <span>{isSelected ? 'Viewing Notes' : 'Study'}</span>
                    <span className="font-telugu font-normal text-xs opacity-90">
                      (చదువు)
                    </span>
                    {isSelected ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expanded Study Details for Selected Subject */}
      {selectedSubjectId && (
        <section className="p-6 rounded-2xl bg-white border border-brand-border shadow-2xs space-y-5 animate-fadeIn">
          {(() => {
            const current = SUBJECTS.find((s) => s.id === selectedSubjectId);
            if (!current) return null;
            const CurrentIcon = current.icon;

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border-light">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${current.accentBg}`}
                    >
                      <CurrentIcon className={`w-5 h-5 stroke-[2] ${current.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-text">
                        {current.name} Study Notes
                      </h3>
                      <p className="text-xs text-brand-secondary font-telugu">
                        {current.teluguName} • ముఖ్యమైన భావనలు
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/chat"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-primary border border-emerald-200 text-xs font-semibold transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask AI Doubt</span>
                    </Link>

                    <Link
                      href="/tests"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Practice in Tests</span>
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-subtle">
                    High-Yield Topics for Special APTET Paper 1A
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {current.keyConcepts.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-brand-bg-paper border border-brand-border-light text-xs font-medium text-brand-text space-y-1"
                      >
                        <div className="flex items-center gap-2 font-semibold text-brand-primary">
                          <CheckCircle2 className="w-4 h-4 text-brand-secondary shrink-0" />
                          <span>Topic {idx + 1}</span>
                        </div>
                        <p className="leading-relaxed pl-6">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      )}
    </div>
  );
}
