import React from 'react';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { ExamCard } from '@/components/dashboard/ExamCard';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActionCards } from '@/components/dashboard/ActionCards';

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Top Greeting section */}
      <WelcomeBanner />

      {/* Target Exam Focus Card */}
      <ExamCard />

      {/* Preparation Metrics & Statistics (Empty state, no fabricated data) */}
      <StatsOverview />

      {/* Main Action Modules */}
      <ActionCards />
    </div>
  );
}
