import { Metadata } from 'next';
import { AdminIngestView } from '@/components/admin/AdminIngestView';

export const metadata: Metadata = {
  title: 'Admin Ingestion Console | TET Assist',
  description:
    'Administrator and content-management console to batch-ingest official Special APTET papers, answer keys, blueprints, and study materials into Supabase.',
};

export default function AdminPage() {
  return <AdminIngestView />;
}
