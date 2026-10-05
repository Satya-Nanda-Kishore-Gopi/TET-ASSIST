import React from 'react';
import { Metadata } from 'next';
import { StudyPlanView } from '@/components/study-plan/StudyPlanView';

export const metadata: Metadata = {
  title: 'Study Plan | Daily Preparation Routine',
  description: 'AI-tailored study plan and daily milestones for Special APTET aspirants.',
};

export default function StudyPlanPage() {
  return <StudyPlanView />;
}
