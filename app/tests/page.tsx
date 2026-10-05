import React from 'react';
import { Metadata } from 'next';
import { TestsView } from '@/components/tests/TestsView';

export const metadata: Metadata = {
  title: 'Tests | Special APTET Official & Practice Papers',
  description: '10 Official Government Papers, model tests, and practice series for Special APTET aspirants.',
};

export default function TestsPage() {
  return <TestsView />;
}
