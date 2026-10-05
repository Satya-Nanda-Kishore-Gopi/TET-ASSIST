import React from 'react';
import { Metadata } from 'next';
import { AnalysisView } from '@/components/analysis/AnalysisView';

export const metadata: Metadata = {
  title: 'Analysis | Performance & Weak Topics',
  description: 'Subject-wise accuracy, test history, weak topic detection, and frequency analysis for Special APTET.',
};

export default function AnalysisPage() {
  return <AnalysisView />;
}
