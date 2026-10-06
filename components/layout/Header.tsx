'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, GraduationCap, Globe, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants/theme';
import { useAuth } from '@/lib/auth/AuthContext';

const routeTitles: Record<string, { title: string; telugu: string }> = {
  '/': { title: 'TET Assist', telugu: 'హోమ్' },
  '/chat': { title: 'Ask AI', telugu: 'AI ని అడగండి' },
  '/tests': { title: 'Mock Tests', telugu: 'మాక్ పరీక్షలు' },
  '/study': { title: 'Study', telugu: 'చదువు' },
  '/study-plan': { title: 'Study Plan', telugu: 'చదువు ప్రణాళిక' },
  '/profile': { title: 'Profile', telugu: 'ప్రొఫైల్' },
  '/login': { title: 'Login', telugu: 'లాగిన్' },
  '/register': { title: 'Register', telugu: 'ఖాతా సృష్టించండి' },
};

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentRoute = routeTitles[pathname] || {
    title: APP_CONFIG.name,
    telugu: APP_CONFIG.nameTelugu,
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <span className="text-sm font-medium text-brand-text-subtle font-telugu">
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

        {/* Profile Menu Button */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-brand-primary-light hover:bg-brand-primary-light/80 text-brand-primary border border-brand-primary/20 transition-all cursor-pointer"
              title="Profile & Account"
              aria-label="Profile and Account Menu"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline text-xs font-bold font-mono">
                {user.formattedMobile}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Profile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-brand-border shadow-lg p-2 z-50 animate-fadeIn space-y-1">
                <div className="p-3 rounded-xl bg-brand-bg-paper border border-brand-border-light space-y-0.5">
                  <p className="text-xs font-bold text-brand-text">
                    TET Assist User
                  </p>
                  <p className="text-xs font-mono font-semibold text-brand-primary">
                    {user.formattedMobile}
                  </p>
                  <p className="text-[10px] text-brand-secondary font-medium font-telugu pt-0.5">
                    Special APTET Candidate
                  </p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-text hover:bg-brand-bg-paper transition-colors"
                >
                  <User className="w-4 h-4 text-brand-secondary" />
                  <span>Profile & Preferences (ప్రొఫైల్)</span>
                </Link>

                <div className="border-t border-brand-border-light pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout (లాగ్ అవుట్)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
