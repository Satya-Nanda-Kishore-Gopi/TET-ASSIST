'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  History,
  AlertTriangle,
  Flame,
  RotateCcw,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

type AnalysisSection =
  | 'overall'
  | 'subject'
  | 'topic'
  | 'history'
  | 'weak'
  | 'frequent'
  | 'repeated';

export function AnalysisView() {
  const [activeSection, setActiveSection] = useState<AnalysisSection>('overall');

  const sections: Array<{
    id: AnalysisSection;
    label: string;
    telugu: string;
    icon: LucideIcon;
    description: string;
  }> = [
    {
      id: 'overall',
      label: 'Overall Progress',
      telugu: 'మొత్తం పురోగతి',
      icon: TrendingUp,
      description: 'Aggregate readiness percentage across complete Special APTET syllabus',
    },
    {
      id: 'subject',
      label: 'Subject Performance',
      telugu: 'సబ్జెక్ట్ వారి పనితీరు',
      icon: PieChart,
      description: 'Marks breakdown across CDP, Telugu, English, Maths, and EVS',
    },
    {
      id: 'topic',
      label: 'Topic Performance',
      telugu: 'టాపిక్ వారి నైపుణ్యం',
      icon: BarChart3,
      description: 'Micro-mastery level on each individual chapter',
    },
    {
      id: 'history',
      label: 'Test History',
      telugu: 'పరీక్షల చరిత్ర',
      icon: History,
      description: 'Timeline of attempted practice and mock tests with score trends',
    },
    {
      id: 'weak',
      label: 'Weak Topics',
      telugu: 'బలహీన అంశాలు',
      icon: AlertTriangle,
      description: 'Automated detection of chapters with error rates above 40%',
    },
    {
      id: 'frequent',
      label: 'Frequently Appearing Topics',
      telugu: 'తరచూ వచ్చే అంశాలు',
      icon: Flame,
      description: 'Statistical recurrence of topics across 2018-2024 APTET papers',
    },
    {
      id: 'repeated',
      label: 'Repeated Questions',
      telugu: 'పునరావృత ప్రశ్నలు',
      icon: RotateCcw,
      description: 'High-probability question models repeated across government exams',
    },
  ];

  const current = sections.find((s) => s.id === activeSection)!;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Performance Intelligence</Badge>
          <Badge variant="neutral">No Synthetic Metrics</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          పరీక్షా విశ్లేషణ (Preparation Analysis)
        </h2>
        <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Deep diagnostic metrics, subject breakdowns, and weak-topic detection computed from your authentic test evaluations.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-brand-border no-scrollbar">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-card hover:bg-brand-bg-paper text-brand-text-muted hover:text-brand-text border border-brand-border-light'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Section Info Card */}
      <div className="p-4 rounded-2xl bg-brand-bg-paper border border-brand-border-light flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
          <current.icon className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h3 className="font-bold text-brand-text text-base">
            {current.label} • {current.telugu}
          </h3>
          <p className="text-xs text-brand-text-muted">
            {current.description}
          </p>
        </div>
      </div>

      {/* Honest Empty State for Active Section */}
      <Card className="border-brand-border bg-brand-card">
        <CardContent className="p-8 sm:p-12">
          <EmptyState
            icon={current.icon}
            title={`No analytics available for ${current.label} yet.`}
            titleTelugu={`${current.telugu} విశ్లేషణ కోసం తగిన డేటా లేదు.`}
            description="To generate accurate performance diagnostics without simulated numbers, you need to attempt at least one practice test or official paper."
            descriptionTelugu="మీ అసలైన సామర్థ్యాన్ని ఖచ్చితంగా లెక్కించడానికి కనీసం ఒక ప్రాక్టీస్ టెస్ట్ పూర్తి చేయండి."
            action={
              <Link href="/tests">
                <Button variant="accent" size="md" className="gap-2">
                  <span>Go to Tests</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            }
          />
        </CardContent>
      </Card>

      {/* Visual Blueprint of Metrics that will be Tracked */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-text-muted">
            Metrics Framework for Special APTET (Classes I to VIII)
          </h4>
          <span className="text-xs text-brand-text-subtle font-medium">
            Pending test inputs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { subject: 'Child Dev & Pedagogy', telugu: 'శిశు వికాసం', marks: 30 },
            { subject: 'Language I (Telugu)', telugu: 'తెలుగు', marks: 30 },
            { subject: 'Language II (English)', telugu: 'ఇంగ్లీష్', marks: 30 },
            { subject: 'Mathematics', telugu: 'గణితం', marks: 30 },
            { subject: 'Environmental Studies', telugu: 'పరిసరాల విజ్ఞానం', marks: 30 },
          ].map((item) => (
            <div
              key={item.subject}
              className="p-3.5 rounded-xl bg-brand-bg-paper border border-brand-border-light text-center space-y-1.5 opacity-80"
            >
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle">
                {item.marks} Marks
              </span>
              <p className="text-xs font-bold text-brand-text truncate">
                {item.subject}
              </p>
              <p className="text-[11px] text-brand-secondary">
                {item.telugu}
              </p>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-stone-300 h-full w-0" />
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                0% accuracy
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
