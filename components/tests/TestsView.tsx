'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TestsService } from '@/lib/services/tests';
import {
  Lock,
  Clock,
  HelpCircle,
  Award,
} from 'lucide-react';

type TestTab = 'official' | 'previous' | 'model' | 'practice' | 'mock';

export function TestsView() {
  const [activeTab, setActiveTab] = useState<TestTab>('official');
  const officialPapers = TestsService.getOfficialPapers();
  const previousPapers = TestsService.getPreviousPapers();
  const modelPapers = TestsService.getModelPapers();

  const tabs: Array<{ id: TestTab; label: string; telugu: string; count?: number }> = [
    { id: 'official', label: 'Official Papers', telugu: 'ప్రభుత్వ అధికారిక పేపర్లు', count: 10 },
    { id: 'previous', label: 'Previous Papers', telugu: 'గత సంవత్సరాల పేపర్లు', count: 2 },
    { id: 'model', label: 'Model Papers', telugu: 'మోడల్ పేపర్లు', count: 2 },
    { id: 'practice', label: 'Practice Tests', telugu: 'సబ్జెక్ట్ ప్రాక్టీస్', count: 5 },
    { id: 'mock', label: 'Mock Tests', telugu: 'పూర్తి మాక్ టెస్టులు', count: 3 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Special APTET</Badge>
          <Badge variant="neutral">150 Questions • 150 Marks</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          పరీక్షలు (Tests & Papers)
        </h2>
        <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Official government examination papers, previous years compendiums, and structured mock tests for Special APTET.
        </p>
      </div>

      {/* Info Notice about Question Database */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-900">
            Locked State • Question Database Integration Pending
          </span>
          <p className="text-amber-800 leading-relaxed text-xs">
            Test papers are cataloged below. Questions will become active once the question database and evaluation engine are integrated in the upcoming development phase. No placeholder or fictitious questions are presented.
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-brand-border no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-card hover:bg-brand-bg-paper text-brand-text-muted hover:text-brand-text border border-brand-border-light'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Official Papers (10 Government Papers) */}
      {activeTab === 'official' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-text">
                10 Official Government Papers
              </h3>
              <p className="text-xs text-brand-text-muted">
                10 ప్రభుత్వ అధికారిక ప్రశ్నాపత్రాలు • Comprehensive authentic test sets
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              10 Sets Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officialPapers.map((paper) => (
              <Card
                key={paper.id}
                className="border-brand-border hover:border-brand-primary/40 transition-all bg-brand-card"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-primary-light text-brand-primary font-bold text-xs tracking-wide">
                          {paper.title}
                        </span>
                        <span className="text-xs font-medium text-brand-text-subtle">
                          {paper.code}
                        </span>
                      </div>
                      <Badge variant="locked" size="sm" className="font-semibold gap-1 text-[11px]">
                        <Lock className="w-3 h-3" /> Coming soon
                      </Badge>
                    </div>

                    <h4 className="font-bold text-base text-brand-text mt-1">
                      Special APTET - {paper.title}
                    </h4>
                    <p className="text-xs text-brand-secondary font-medium mt-0.5">
                      {paper.teluguTitle}
                    </p>

                    <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                      {paper.paperType}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-brand-border-light text-xs text-brand-text-muted font-medium">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>{paper.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>{paper.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>{paper.durationMinutes} Mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Button Action */}
                  <div className="mt-4 pt-3 border-t border-brand-border-light">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full justify-center gap-2 text-stone-400 bg-stone-50 border-stone-200 cursor-not-allowed text-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked (Question Database Pending)</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Previous Papers */}
      {activeTab === 'previous' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              Previous Years Examination Papers
            </h3>
            <p className="text-xs text-brand-text-muted">
              గత సంవత్సరాల ప్రశ్నాపత్రాలు
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousPapers.map((paper) => (
              <Card key={paper.id} className="border-brand-border bg-brand-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="primary">{paper.year} Exam</Badge>
                    <Badge variant="locked" size="sm">
                      <Lock className="w-3 h-3" /> Coming soon
                    </Badge>
                  </div>
                  <h4 className="font-bold text-base text-brand-text">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-brand-secondary mt-0.5">
                    {paper.teluguTitle}
                  </p>
                  <p className="text-xs text-brand-text-muted mt-2">
                    {paper.paperType} • 150 Questions • 150 Marks
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full mt-4 justify-center gap-2 text-stone-400 bg-stone-50 text-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked (Database Pending)</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Model Papers */}
      {activeTab === 'model' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              Special APTET Model Papers
            </h3>
            <p className="text-xs text-brand-text-muted">
              ఆంధ్రప్రదేశ్ పాఠశాల విద్యాశాఖ ప్రామాణిక నమూనా పత్రాలు
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelPapers.map((paper) => (
              <Card key={paper.id} className="border-brand-border bg-brand-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="accent">Model Blueprint</Badge>
                    <Badge variant="locked" size="sm">
                      <Lock className="w-3 h-3" /> Coming soon
                    </Badge>
                  </div>
                  <h4 className="font-bold text-base text-brand-text">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-brand-secondary mt-0.5">
                    {paper.teluguTitle}
                  </p>
                  <p className="text-xs text-brand-text-muted mt-2">
                    {paper.paperType} • Full syllabus simulation
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full mt-4 justify-center gap-2 text-stone-400 bg-stone-50 text-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked (Database Pending)</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Practice Tests */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              Subject-wise Practice Tests
            </h3>
            <p className="text-xs text-brand-text-muted">
              సబ్జెక్టు వారీగా ప్రత్యేక సాధన పరీక్షలు
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Child Development & Pedagogy',
                telugu: 'శిశు వికాసం మరియు పెడగోగి',
                questions: 30,
              },
              {
                title: 'Special Education & Inclusive Classroom',
                telugu: 'సమ్మిళిత విద్యా బోధన',
                questions: 30,
              },
              {
                title: 'Language I (Telugu)',
                telugu: 'భాష I (తెలుగు బోధనా పద్ధతులు)',
                questions: 30,
              },
              {
                title: 'Language II (English)',
                telugu: 'భాష II (English Pedagogy)',
                questions: 30,
              },
              {
                title: 'Mathematics & Environmental Studies',
                telugu: 'గణితం & పరిసరాల విజ్ఞానం',
                questions: 30,
              },
            ].map((subj) => (
              <Card key={subj.title} className="border-brand-border bg-brand-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded">
                      Practice Module
                    </span>
                    <Badge variant="locked" size="sm">
                      <Lock className="w-3 h-3" /> Coming soon
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-brand-text">
                    {subj.title}
                  </h4>
                  <p className="text-xs text-brand-secondary font-medium mt-0.5">
                    {subj.telugu}
                  </p>
                  <p className="text-xs text-brand-text-muted mt-2">
                    {subj.questions} Questions • Chapter-wise
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Mock Tests */}
      {activeTab === 'mock' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              Full-Length Mock Examinations
            </h3>
            <p className="text-xs text-brand-text-muted">
              పరీక్షా హాలు వాతావరణంలో 150 నిమిషాల పూర్తి స్థాయి మాక్ టెస్టులు
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Mock Test 1', 'Mock Test 2', 'Mock Test 3'].map((mock) => (
              <Card key={mock} className="border-brand-border bg-brand-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="accent">Full Mock</Badge>
                    <Badge variant="locked" size="sm">
                      <Lock className="w-3 h-3" /> Coming soon
                    </Badge>
                  </div>
                  <h4 className="font-bold text-base text-brand-text">
                    Special APTET - {mock}
                  </h4>
                  <p className="text-xs text-brand-text-muted mt-1">
                    150 Questions • 150 Marks • Strict 150-minute timer simulation
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full mt-4 justify-center gap-2 text-stone-400 bg-stone-50 text-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked (Engine Pending)</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
