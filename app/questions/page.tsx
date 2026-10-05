import { Metadata } from 'next';
import { QuestionsView } from '@/components/questions/QuestionsView';

export const metadata: Metadata = {
  title: 'Question Bank | TET Assist',
  description:
    'Comprehensive repository of Special APTET examination questions, extracted from official government papers and model papers.',
};

export default function QuestionsPage() {
  return <QuestionsView />;
}
