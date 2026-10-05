import React from 'react';
import { Metadata } from 'next';
import { StudyView } from '@/components/study/StudyView';

export const metadata: Metadata = {
  title: 'Study | Important Topics & Concepts',
  description: 'Special APTET concepts, revision summaries, and high-frequency pedagogical topics.',
};

export default function StudyPage() {
  return <StudyView />;
}
