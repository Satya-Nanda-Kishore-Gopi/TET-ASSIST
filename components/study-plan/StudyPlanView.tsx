'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { APP_CONFIG } from '@/lib/constants/theme';
import {
  Calendar,
  Target,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export function StudyPlanView() {
  const [notification, setNotification] = useState<string | null>(null);

  const handleGeneratePlan = () => {
    setNotification(
      'Study-plan engine will generate dynamic schedules tailored to your target marks once the AI planner service is linked.'
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Study Strategy</Badge>
          <Badge variant="neutral">Adaptive Schedule</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          స్టడీ ప్లాన్ (Study Plan)
        </h2>
        <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
          Structured daily preparation timeline and topic allocations calibrated for Special APTET.
        </p>
      </div>

      {/* Target Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Exam */}
        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-subtle">
              Exam
            </span>
            <div className="mt-1">
              <h4 className="text-xl font-extrabold text-brand-primary">
                {APP_CONFIG.initialExam}
              </h4>
              <p className="text-xs text-brand-secondary font-medium">
                {APP_CONFIG.initialExamTelugu}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border-light text-[11px] text-brand-text-muted">
              Paper I & II Special Education
            </div>
          </CardContent>
        </Card>

        {/* Days Remaining */}
        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-subtle">
                Days remaining
              </span>
              <Clock className="w-4 h-4 text-brand-secondary" />
            </div>
            <div className="mt-1">
              <h4 className="text-3xl font-extrabold text-brand-text font-sans">
                --
              </h4>
              <p className="text-xs text-brand-text-subtle font-medium">
                రోజులు మిగిలి ఉన్నాయి
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border-light text-[11px] text-brand-text-muted">
              Configure exam date in profile
            </div>
          </CardContent>
        </Card>

        {/* Target Score */}
        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-subtle">
                Target score
              </span>
              <Target className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="mt-1">
              <h4 className="text-3xl font-extrabold text-brand-text font-sans">
                --
              </h4>
              <p className="text-xs text-brand-text-subtle font-medium">
                లక్ష్య మార్కులు / 150
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border-light text-[11px] text-brand-text-muted">
              Minimum qualifying benchmark: 90/150 (OC)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Today's Plan Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              Today&apos;s Plan
            </h3>
            <p className="text-xs text-brand-secondary font-medium">
              నేటి అధ్యయన ప్రణాళిక
            </p>
          </div>

          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={handleGeneratePlan}
            className="font-bold gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Study Plan</span>
          </Button>
        </div>

        {/* Empty State Card */}
        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-8 sm:p-12">
            <EmptyState
              icon={Calendar}
              title="No study plan generated yet."
              titleTelugu="ఇంకా స్టడీ ప్లాన్ రూపొందించబడలేదు."
              description="A personalized schedule based on your target score, exam date, and daily study hours will appear here once generated."
              descriptionTelugu="మీ పరీక్ష తేదీ, రోజువారీ అధ్యయన సమయాన్ని బట్టి ఆటోమేటిక్ షెడ్యూల్ రూపొందించబడుతుంది."
              action={
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleGeneratePlan}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Plan</span>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Suggested Strategy Guide */}
      <Card className="border-brand-border bg-brand-bg-paper">
        <CardContent className="p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-3">
            Recommended Study Allocation for Special APTET
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white border border-brand-border-light space-y-1">
              <span className="font-bold text-brand-accent">Phase 1: Concepts</span>
              <p className="text-brand-text-muted">
                Master Child Development and Special Education foundations (Weeks 1 - 4).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-brand-border-light space-y-1">
              <span className="font-bold text-brand-primary">Phase 2: Practice</span>
              <p className="text-brand-text-muted">
                Solve previous year and official question papers (Weeks 5 - 8).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-brand-border-light space-y-1">
              <span className="font-bold text-brand-secondary">Phase 3: Revision</span>
              <p className="text-brand-text-muted">
                Rapid review of weak topics and time-bound mock tests (Final 2 Weeks).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
