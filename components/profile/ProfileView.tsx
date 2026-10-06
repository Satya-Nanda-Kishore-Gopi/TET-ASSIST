'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/lib/constants/theme';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  User,
  Phone,
  LogOut,
  Save,
  CheckCircle2,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

export function ProfileView() {
  const { user, logout } = useAuth();

  const [preferences, setPreferences] = useState({
    targetScore: '120',
    preferredLanguage: 'telugu',
    studyTimePerDay: '3 Hours',
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('Preferences saved successfully for your study session.');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Aspirant Profile</Badge>
          <Badge variant="neutral">Special APTET</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          ప్రొఫైల్ (Profile)
        </h1>
        <p className="text-sm text-brand-text-muted leading-relaxed">
          Manage your account details and preparation preferences.
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
            className="text-emerald-700 hover:text-emerald-900 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Account Details Card */}
      <Card className="border-brand-border bg-white rounded-3xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-brand-border-light p-6 bg-brand-bg-paper/40">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold text-xl shadow-xs">
                <User className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-brand-text">
                  {user ? 'TET Assist User' : 'Guest Candidate'}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-brand-secondary font-telugu mt-0.5">
                  {user ? 'Special APTET అభ్యర్థి' : 'లాగిన్ చేయని అభ్యర్థి'}
                </CardDescription>
              </div>
            </div>

            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="gap-2 text-xs font-bold text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout (లాగ్ అవుట్)</span>
              </Button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login (లాగిన్)</span>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* User Mobile Number Section */}
          <div className="p-4 rounded-2xl bg-brand-bg-paper border border-brand-border-light space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-subtle">
              Registered Mobile Number (మొబైల్ నంబర్)
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-brand-border-light flex items-center justify-center text-brand-primary">
                <Phone className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-brand-text font-mono">
                {user ? user.formattedMobile : 'Not logged in (లాగిన్ అవ్వలేదు)'}
              </p>
            </div>
            {!user && (
              <p className="text-xs text-brand-text-muted pt-1">
                Please login with your mobile number to access all mock tests and study materials.
              </p>
            )}
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-subtle">
              Preparation Preferences
            </h3>

            {/* Field: Exam Target */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-text">
                Target Examination
              </label>
              <input
                type="text"
                disabled
                value={`${APP_CONFIG.initialExam} • Paper 1A`}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-brand-primary cursor-not-allowed"
              />
            </div>

            {/* Field: Target Score */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-text flex items-center justify-between">
                <span>Target Marks</span>
                <span className="text-[11px] text-brand-text-subtle font-normal">Out of 150 Marks</span>
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={preferences.targetScore}
                onChange={(e) => setPreferences({ ...preferences, targetScore: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg-paper border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Field: Preferred Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-text">
                Study Medium
              </label>
              <select
                value={preferences.preferredLanguage}
                onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg-paper border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="telugu">తెలుగు (Telugu Medium - Primary)</option>
                <option value="english">English (English Medium)</option>
                <option value="bilingual">Bilingual (ద్విభాష - Telugu & English)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-brand-border-light flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-brand-text-subtle">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure session active</span>
              </div>

              <Button type="submit" variant="primary" size="sm" className="gap-2 font-bold cursor-pointer">
                <Save className="w-4 h-4" />
                <span>Save</span>
              </Button>
            </div>
          </form>

          {/* Prominent Bottom Logout Button if user is logged in */}
          {user && (
            <div className="pt-4 border-t border-brand-border-light flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 font-bold text-sm border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from TET Assist (లాగ్ అవుట్)</span>
              </button>
              <span className="text-[11px] text-brand-text-subtle">
                Session securely closed upon logout
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
