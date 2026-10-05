'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, GraduationCap, Globe } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants/theme';

const routeTitles: Record<string, { title: string; telugu: string }> = {
  '/': { title: 'Dashboard', telugu: 'డ్యాష్‌బోర్డ్' },
  '/chat': { title: 'Ask AI', telugu: 'ఏఐ అసిస్టెంట్' },
  '/questions': { title: 'Question Bank', telugu: 'ప్రశ్నల నిధి' },
  '/tests': { title: 'Tests', telugu: 'పరీక్షలు' },
  '/study': { title: 'Study', telugu: 'స్టడీ మెటీరియల్' },
  '/study-plan': { title: 'Study Plan', telugu: 'స్టడీ ప్లాన్' },
  '/analysis': { title: 'Analysis', telugu: 'పరీక్షా విశ్లేషణ' },
  '/documents': { title: 'My Documents', telugu: 'నా డాక్యుమెంట్లు' },
  '/admin': { title: 'Admin Ingestion Console', telugu: 'నిర్వాహక విభాగం' },
  '/profile': { title: 'Profile', telugu: 'ప్రొఫైల్' },
};

export function Header() {
  const pathname = usePathname();
  const currentRoute = routeTitles[pathname] || {
    title: APP_CONFIG.name,
    telugu: APP_CONFIG.nameTelugu,
  };

  return (
    <header className="sticky top-0 z-20 bg-brand-card/90 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Brand & Desktop Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Brand indicator */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-brand-text">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Title & Telugu Subtitle */}
        <div className="hidden lg:flex items-center gap-2.5">
          <h1 className="font-bold text-lg text-brand-text tracking-tight">
            {currentRoute.title}
          </h1>
          <span className="text-sm font-medium text-brand-text-subtle">
            • {currentRoute.telugu}
          </span>
        </div>
      </div>

      {/* Right Actions & Badges */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Target Exam Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-bg-paper border border-brand-border-light text-xs font-semibold text-brand-primary">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span>{APP_CONFIG.initialExam}</span>
        </div>

        {/* Language Indicator */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary-light/60 text-brand-primary text-xs font-medium border border-brand-primary/20">
          <Globe className="w-3.5 h-3.5" />
          <span>తెలుగు / EN</span>
        </div>

        {/* Profile Link */}
        <Link
          href="/profile"
          className="w-9 h-9 rounded-xl bg-brand-primary-light hover:bg-brand-primary hover:text-white text-brand-primary border border-brand-primary/20 flex items-center justify-center transition-colors duration-150"
          title="Profile & Settings"
          aria-label="Profile and Settings"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
