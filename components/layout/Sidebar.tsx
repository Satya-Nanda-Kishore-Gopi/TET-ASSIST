'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Bot,
  FileText,
  BookOpen,
  Calendar,
  BarChart3,
  Files,
  GraduationCap,
  User,
  Sparkles,
  Info,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { APP_CONFIG, NAV_ITEMS } from '@/lib/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const iconMap = {
  Home,
  Bot,
  HelpCircle,
  FileText,
  BookOpen,
  Calendar,
  BarChart3,
  Files,
  ShieldCheck,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-brand-card border-r border-brand-border h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-brand-border-light flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl text-brand-text tracking-tight">
                {APP_CONFIG.name}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary font-medium">
                v1.0
              </span>
            </div>
            <span className="text-xs text-brand-text-muted font-medium truncate">
              {APP_CONFIG.tagline}
            </span>
          </div>
        </Link>

        {/* Current Exam Target Pill */}
        <div className="mt-3 p-2.5 rounded-xl bg-brand-bg-paper border border-brand-border-light flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-brand-text-subtle tracking-wider">
              Target Exam
            </span>
            <span className="text-xs font-bold text-brand-primary">
              {APP_CONFIG.initialExam}
            </span>
          </div>
          <Badge variant="accent" size="sm" className="font-bold">
            <Sparkles className="w-3 h-3" /> Active
          </Badge>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-brand-text-subtle">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-brand-primary text-white shadow-xs font-semibold'
                  : 'text-brand-text hover:bg-brand-bg-paper hover:text-brand-primary'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110',
                  isActive
                    ? 'text-white'
                    : 'text-brand-secondary group-hover:text-brand-primary'
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              <span
                className={cn(
                  'text-[11px] font-normal transition-opacity duration-150',
                  isActive ? 'text-white/80' : 'text-brand-text-subtle'
                )}
              >
                {item.labelTelugu}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Disclaimer Section */}
      <div className="p-4 border-t border-brand-border-light flex flex-col gap-3 bg-brand-bg-paper/50">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 border',
            pathname === '/profile'
              ? 'bg-brand-card border-brand-primary/40 shadow-xs'
              : 'hover:bg-brand-card border-transparent hover:border-brand-border-light'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-sm">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-brand-text truncate">
              ఉపాధ్యాయ అభ్యర్థి
            </span>
            <span className="text-[11px] text-brand-text-muted truncate">
              Special APTET Aspirant
            </span>
          </div>
        </Link>

        {/* Non-governmental disclaimer */}
        <div className="p-2.5 rounded-lg bg-stone-100/80 border border-stone-200/80 text-[11px] text-brand-text-subtle leading-snug flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
          <span>Independent preparation platform • Not affiliated with the Govt. of AP.</span>
        </div>
      </div>
    </aside>
  );
}
