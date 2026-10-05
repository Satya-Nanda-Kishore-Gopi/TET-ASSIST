'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { StudyService, StudyTopicModule } from '@/lib/services/study';
import { DatabaseDocument } from '@/lib/supabase/types';
import {
  BookOpen,
  Sparkles,
  RotateCcw,
  Flame,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  LucideIcon,
} from 'lucide-react';

type StudySection = 'important' | 'concepts' | 'revision' | 'frequent' | 'weak';

export function StudyView() {
  const [activeSection, setActiveSection] = useState<StudySection>('important');
  const [modules, setModules] = useState<StudyTopicModule[]>([]);
  const [studyDocuments, setStudyDocuments] = useState<DatabaseDocument[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [mods, docs] = await Promise.all([
        StudyService.getTopicModules(selectedSubject),
        StudyService.getStudyDocuments(selectedSubject),
      ]);
      if (isMounted) {
        setModules(mods);
        setStudyDocuments(docs);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedSubject]);

  const sections: Array<{
    id: StudySection;
    label: string;
    telugu: string;
    icon: LucideIcon;
    description: string;
  }> = [
    {
      id: 'important',
      label: 'Important Topics',
      telugu: 'ముఖ్యమైన అంశాలు',
      icon: Sparkles,
      description: 'High-yield curriculum topics based on Special APTET syllabus weightage',
    },
    {
      id: 'concepts',
      label: 'Concepts',
      telugu: 'మూల భావనలు',
      icon: BookOpen,
      description: 'Foundational pedagogical principles, theories of learning, and special education methods',
    },
    {
      id: 'revision',
      label: 'Revision',
      telugu: 'పునశ్చరణ',
      icon: RotateCcw,
      description: 'Quick recall summaries and formula sheets for active memory retention',
    },
    {
      id: 'frequent',
      label: 'Frequently Asked Topics',
      telugu: 'ఎక్కువగా అడిగే అంశాలు',
      icon: Flame,
      description: 'Topics with highest recurrence across past APTET question papers',
    },
    {
      id: 'weak',
      label: 'Weak Topics',
      telugu: 'దృష్టి సారించాల్సిన బలహీన అంశాలు',
      icon: AlertTriangle,
      description: 'Identified deficit areas that need focused revision',
    },
  ];

  const currentSection = sections.find((s) => s.id === activeSection)!;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Special APTET Study Vault</Badge>
          <Badge variant="accent">Preloaded Curriculum Grounding</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          స్టడీ మెటీరియల్ (Study & Concepts)
        </h2>
        <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Master Child Development & Pedagogy, Special Education teaching strategies, and curriculum domains derived directly from official government syllabi and previous question papers.
        </p>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-brand-card border border-brand-border shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-text-muted uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-brand-primary" />
          <span>Filter By Subject:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'Child Development', label: 'CDP Special' },
            { id: 'Telugu', label: 'Language I (Telugu)' },
            { id: 'English', label: 'Language II (English)' },
            { id: 'Mathematics', label: 'Mathematics' },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedSubject === sub.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-bg-paper text-brand-text-muted hover:text-brand-text border border-brand-border-light'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-brand-border no-scrollbar">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-card hover:bg-brand-bg-paper text-brand-text-muted hover:text-brand-text border border-brand-border-light'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{section.label}</span>
              <span className="text-[11px] opacity-80">({section.telugu})</span>
            </button>
          );
        })}
      </div>

      {/* Section Description */}
      <div className="p-4 rounded-2xl bg-brand-primary-light/40 border border-brand-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shrink-0">
            {React.createElement(currentSection.icon, { className: 'w-5 h-5' })}
          </div>
          <div>
            <h3 className="font-bold text-base text-brand-text">
              {currentSection.label} • {currentSection.telugu}
            </h3>
            <p className="text-xs text-brand-text-muted">{currentSection.description}</p>
          </div>
        </div>
      </div>

      {/* Concept & Topic Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
            Foundational Modules ({modules.length} Available)
          </span>
          <Link href="/questions" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
            <span>Practice related questions in Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <Card
              key={mod.id}
              className="border-brand-border bg-brand-card hover:border-brand-primary/40 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-primary-light text-brand-primary">
                      ~{mod.weightageQuestions} Exam Questions
                    </span>
                    <Badge variant="accent" size="sm" className="capitalize text-[10px]">
                      {mod.importance.replace('_', ' ')} yield
                    </Badge>
                  </div>

                  <h4 className="font-bold text-base text-brand-text">{mod.title}</h4>
                  <p className="text-xs font-medium text-brand-secondary">{mod.teluguTitle}</p>
                  <p className="text-xs text-brand-text-muted leading-relaxed mt-2">{mod.summary}</p>

                  {/* Key Pedagogical Points */}
                  <div className="mt-3 p-3 rounded-xl bg-brand-bg-paper border border-brand-border-light space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
                      Core Exam Takeaways:
                    </span>
                    <ul className="space-y-1">
                      {mod.keyPoints.map((pt, i) => (
                        <li key={i} className="text-xs text-brand-text flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-brand-border-light flex items-center justify-between gap-2">
                  <span className="text-[10px] text-brand-text-subtle truncate max-w-[200px]">
                    Source: {mod.sourceDocTitle || 'Official Curriculum'}
                  </span>
                  <Link href="/chat">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                      <Bot className="w-3.5 h-3.5 text-brand-accent" />
                      <span>Ask AI Tutor</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Preloaded Official Documents & Blueprints Section */}
      {studyDocuments.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-primary" />
            <span>Preloaded Syllabus & Reference Documents</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studyDocuments.map((doc) => (
              <Card key={doc.id} className="border-brand-border bg-brand-card">
                <CardContent className="p-4 space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary capitalize">
                    {doc.document_type.replace('_', ' ')}
                  </span>
                  <h5 className="font-bold text-sm text-brand-text">{doc.title}</h5>
                  <p className="text-xs text-brand-text-muted line-clamp-2">{doc.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Syllabus Pillar Guide for Teachers */}
      <div className="space-y-3 pt-4 border-t border-brand-border">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text-muted">
          Special APTET Curriculum Domains (Paper I & Paper II)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Child Development & Pedagogy',
              telugu: 'శిశు వికాసము మరియు పెడగోగి',
              weightage: '30 Marks',
              topics: 'Growth, Development, Theories (Piaget, Vygotsky, Kohlberg)',
            },
            {
              title: 'Special Education & Inclusive Classroom',
              telugu: 'ప్రత్యేక విద్య మరియు సమ్మిళిత తరగతి గది',
              weightage: 'Special Core',
              topics: 'RPwD Act 2016, Learning Disabilities, Assistive Tech',
            },
            {
              title: 'Language I (Telugu)',
              telugu: 'భాష I (తెలుగు బోధనాంశాలు)',
              weightage: '30 Marks',
              topics: 'వ్యాకరణం, పఠనావగాహన, బోధనా పద్ధతులు',
            },
            {
              title: 'Language II (English)',
              telugu: 'భాష II (English Medium)',
              weightage: '30 Marks',
              topics: 'Grammar, Reading Comprehension, Pedagogy of English',
            },
            {
              title: 'Mathematics Methodology',
              telugu: 'గణిత బోధనా పద్ధతులు',
              weightage: '30 Marks',
              topics: 'Number system, Arithmetic, Teaching-Learning Material',
            },
            {
              title: 'Environmental Studies',
              telugu: 'పరిసరాల విజ్ఞానం బోధన',
              weightage: '30 Marks',
              topics: 'Living world, Natural resources, Community education',
            },
          ].map((domain) => (
            <Card key={domain.title} className="border-brand-border bg-brand-bg-paper/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-primary px-2 py-0.5 rounded bg-brand-primary-light">
                    {domain.weightage}
                  </span>
                  <span className="text-[10px] text-brand-text-subtle font-semibold">
                    Core Domain
                  </span>
                </div>
                <h4 className="font-bold text-sm text-brand-text">{domain.title}</h4>
                <p className="text-xs text-brand-secondary font-medium">{domain.telugu}</p>
                <p className="text-xs text-brand-text-muted pt-1 border-t border-brand-border-light">
                  {domain.topics}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
