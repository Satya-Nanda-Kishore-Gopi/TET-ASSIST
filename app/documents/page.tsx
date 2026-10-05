import React from 'react';
import { Metadata } from 'next';
import { DocumentsView } from '@/components/documents/DocumentsView';

export const metadata: Metadata = {
  title: 'Documents | Preloaded Material & User PDFs',
  description: 'Special APTET official blueprints, reference textbooks, and personal uploaded documents.',
};

export default function DocumentsPage() {
  return <DocumentsView />;
}
