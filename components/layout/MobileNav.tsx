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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'Ask AI', icon: Bot },
  { href: '/tests', label: 'Tests', icon: FileText },
  { href: '/study', label: 'Study', icon: BookOpen },
  { href: '/study-plan', label: 'Plan', icon: Calendar },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-card/95 backdrop-blur-md border-t border-brand-border px-1 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 min-w-[44px]',
                isActive
                  ? 'text-brand-accent font-semibold'
                  : 'text-brand-text-muted hover:text-brand-primary'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-lg transition-colors',
                  isActive ? 'bg-brand-accent-light' : 'bg-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isActive ? 'scale-110 text-brand-accent stroke-[2.2]' : 'stroke-[1.75]'
                  )}
                />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
