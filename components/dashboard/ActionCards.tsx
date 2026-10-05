import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Bot,
  FileText,
  BookOpen,
  Calendar,
  Files,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export function ActionCards() {
  const mainActions = [
    {
      title: 'Ask AI',
      teluguTitle: 'సందేహాలు అడగండి',
      subtitle: 'Ask your doubts',
      href: '/chat',
      icon: Bot,
      color: 'bg-[#B84A28]',
      accentBg: 'bg-[#B84A28]/10 text-[#B84A28] border-[#B84A28]/20',
      badge: 'Interactive AI',
      description: 'Ask doubts in Telugu or English regarding Special APTET pedagogy & syllabus.',
    },
    {
      title: 'Tests',
      teluguTitle: 'పరీక్షలు',
      subtitle: 'Practice & mock tests',
      href: '/tests',
      icon: FileText,
      color: 'bg-[#6B4F3A]',
      accentBg: 'bg-[#6B4F3A]/10 text-[#6B4F3A] border-[#6B4F3A]/20',
      badge: '10 Official Papers',
      description: 'Government papers, previous year sets, and subject-wise practice tests.',
    },
    {
      title: 'Study',
      teluguTitle: 'ముఖ్యమైన భావనలు',
      subtitle: 'Learn important concepts',
      href: '/study',
      icon: BookOpen,
      color: 'bg-[#8A6A52]',
      accentBg: 'bg-[#8A6A52]/10 text-[#8A6A52] border-[#8A6A52]/20',
      badge: 'Curated Topics',
      description: 'Important concepts, high-weightage topics, and revision summaries.',
    },
    {
      title: 'Study Plan',
      teluguTitle: 'స్టడీ ప్లాన్',
      subtitle: 'Plan your preparation',
      href: '/study-plan',
      icon: Calendar,
      color: 'bg-[#553E2D]',
      accentBg: 'bg-[#553E2D]/10 text-[#553E2D] border-[#553E2D]/20',
      badge: 'Personalized',
      description: 'Structure daily study routines and target marks before exam day.',
    },
    {
      title: 'My Documents',
      teluguTitle: 'నా డాక్యుమెంట్లు',
      subtitle: 'Upload and ask questions from PDFs',
      href: '/documents',
      icon: Files,
      color: 'bg-[#7A5B44]',
      accentBg: 'bg-[#7A5B44]/10 text-[#7A5B44] border-[#7A5B44]/20',
      badge: 'Preloaded + User PDFs',
      description: 'Official syllabus, reference textbooks, and custom notes.',
    },
    {
      title: 'Analysis',
      teluguTitle: 'పనితీరు విశ్లేషణ',
      subtitle: 'View your preparation performance',
      href: '/analysis',
      icon: BarChart3,
      color: 'bg-[#9C4222]',
      accentBg: 'bg-[#9C4222]/10 text-[#9C4222] border-[#9C4222]/20',
      badge: 'Insights',
      description: 'Track weak topics, frequently appearing questions, and subject readiness.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text-muted">
            Quick Actions
          </h3>
          <p className="text-xs text-brand-text-subtle font-medium">
            ముఖ్యమైన విభాగాలు • Direct navigation to study modules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group block focus:outline-none">
              <Card
                hoverable
                className="h-full border-brand-border bg-brand-card transition-all duration-200 group-hover:border-brand-primary/50 group-hover:shadow-md flex flex-col justify-between"
              >
                <CardContent className="p-5 flex-1 flex flex-col">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${action.accentBg}`}
                    >
                      {action.badge}
                    </span>
                  </div>

                  {/* Titles */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-brand-text group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                        {action.title}
                      </h4>
                      <span className="text-xs font-semibold text-brand-secondary">
                        {action.teluguTitle}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brand-accent">
                      {action.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-brand-text-muted leading-relaxed flex-1 mt-1">
                    {action.description}
                  </p>

                  {/* Arrow Action link */}
                  <div className="pt-4 mt-3 border-t border-brand-border-light flex items-center justify-between text-xs font-semibold text-brand-primary group-hover:text-brand-accent transition-colors">
                    <span>ప్రారంభించండి (Open)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
