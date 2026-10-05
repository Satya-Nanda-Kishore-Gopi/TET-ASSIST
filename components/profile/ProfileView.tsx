'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/lib/constants/theme';
import {
  User,
  Save,
  CheckCircle2,
} from 'lucide-react';

export function ProfileView() {
  // Keep values as empty/default states as requested
  const [profile, setProfile] = useState({
    name: '',
    exam: APP_CONFIG.initialExam,
    targetScore: '',
    preferredLanguage: 'telugu',
    studyTimePerDay: '',
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(
      'Profile preferences saved locally. Supabase auth and profile persistence will be connected in future database phase.'
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Aspirant Profile</Badge>
          <Badge variant="neutral">Default States</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          ప్రొఫైల్ మరియు ప్రాధాన్యతలు (Profile)
        </h2>
        <p className="text-sm text-brand-text-muted leading-relaxed">
          Manage your personal details, exam target, study language, and daily preparation commitments.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{savedNotice}</span>
          </div>
          <button
            onClick={() => setSavedNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Profile Form Card */}
      <Card className="border-brand-border bg-brand-card">
        <CardHeader className="border-b border-brand-border-light pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Aspirant Details</CardTitle>
              <CardDescription>
                ఉపాధ్యాయ అభ్యర్థి వివరాలు • Configuration parameters for AI personalized study
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Field: Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
                Name (పేరు)
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your name (ఉదా: రమేష్ బాబు / Aspirant Name)"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg-paper border border-brand-border text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
              <p className="text-[11px] text-brand-text-subtle">
                Empty state by default. Can be linked to Supabase user account later.
              </p>
            </div>

            {/* Field: Exam */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
                Exam (లక్ష్య పరీక్ష)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={profile.exam}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-sm font-semibold text-brand-primary cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-xs px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary font-semibold">
                  Initial Target
                </span>
              </div>
              <p className="text-[11px] text-brand-text-subtle">
                Currently focused on Special APTET (Classes I to VIII Special Education).
              </p>
            </div>

            {/* Field: Target Score */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text flex items-center justify-between">
                <span>Target Score (లక్ష్య మార్కులు)</span>
                <span className="text-[11px] font-normal text-brand-text-subtle">Out of 150 Marks</span>
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={profile.targetScore}
                onChange={(e) => setProfile({ ...profile, targetScore: e.target.value })}
                placeholder="-- (e.g. 120)"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg-paper border border-brand-border text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
              <p className="text-[11px] text-brand-text-subtle">
                Keep empty or enter your goal score. Minimum qualifying: OC: 90, BC: 75, SC/ST/PH: 60.
              </p>
            </div>

            {/* Field: Preferred Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
                Preferred Language (ప్రాధాన్య భాష)
              </label>
              <select
                value={profile.preferredLanguage}
                onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg-paper border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all cursor-pointer"
              >
                <option value="telugu">తెలుగు (Telugu - Primary Medium)</option>
                <option value="english">English (English Medium)</option>
                <option value="bilingual">Bilingual (ద్విభాష - Telugu & English)</option>
              </select>
            </div>

            {/* Field: Study Time Per Day */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text flex items-center justify-between">
                <span>Study Time Per Day (రోజువారీ అధ్యయన సమయం)</span>
                <span className="text-[11px] font-normal text-brand-text-subtle">Hours/Day</span>
              </label>
              <input
                type="text"
                value={profile.studyTimePerDay}
                onChange={(e) => setProfile({ ...profile, studyTimePerDay: e.target.value })}
                placeholder="-- (e.g. 3 Hours / Day)"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg-paper border border-brand-border text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
              <p className="text-[11px] text-brand-text-subtle">
                Used by the study plan generator to divide chapters into manageable slots.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-brand-border-light flex items-center justify-end">
              <Button type="submit" variant="primary" size="md" className="gap-2 font-semibold">
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
