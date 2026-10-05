import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-[#5B4230] to-[#432F21] p-6 sm:p-8 text-white shadow-md">
      {/* Subtle background ornamentation */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-12 w-48 h-48 rounded-full bg-brand-accent/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent-light" />
            <span>AI-Powered Teacher Preparation Companion</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-sans">
            నమస్కారం 👋
          </h2>

          <p className="text-base sm:text-lg text-brand-secondary-light font-medium leading-relaxed">
            మీ Special APTET preparation కి AI సహాయకుడు
          </p>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed pt-1">
            Focus on core concepts in Child Development, Special Education Pedagogy, and Telugu medium practice tests.
          </p>
        </div>

        {/* Disclaimer Pill */}
        <div className="self-start md:self-center shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-xs text-white/80 max-w-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              Focused on Special APTET Syllabus (Classes I - VIII)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
