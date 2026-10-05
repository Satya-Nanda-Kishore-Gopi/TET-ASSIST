import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/lib/constants/theme';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function ExamCard() {
  return (
    <Card className="border-brand-primary/20 bg-gradient-to-r from-brand-card via-brand-card to-brand-primary-light/20 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-full bg-brand-primary-light/10 pointer-events-none -skew-x-12" />
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">
                TARGET EXAMINATION
              </Badge>
              <Badge variant="accent" size="md">
                Paper I & II
              </Badge>
              <span className="text-xs text-brand-text-subtle font-medium">
                Andhra Pradesh School Education
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
                {APP_CONFIG.initialExam}
              </h3>
              <p className="text-sm sm:text-base font-semibold text-brand-secondary mt-1">
                Your preparation starts here.
              </p>
              <p className="text-xs sm:text-sm text-brand-text-muted mt-1 max-w-xl leading-relaxed">
                Comprehensive preparation covering Special Education, Child Development & Pedagogy, Telugu, English, Mathematics, and Environmental Studies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-medium text-brand-text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>Special Education Focus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>150 Marks Format</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>Bilingual (Telugu/English)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 self-stretch md:self-center">
            <Link href="/tests">
              <Button variant="accent" size="md" className="w-full justify-between gap-3 font-semibold shadow-xs">
                <span>View Official Papers</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/study-plan">
              <Button variant="outline" size="md" className="w-full justify-between gap-3 text-xs font-medium">
                <span>Set Study Target</span>
                <ArrowRight className="w-4 h-4 text-brand-text-subtle" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
