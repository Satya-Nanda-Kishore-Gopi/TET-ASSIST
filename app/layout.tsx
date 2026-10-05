import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Telugu } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { APP_CONFIG } from '@/lib/constants/theme';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-fallback',
  display: 'swap',
});

const teluguFont = Noto_Sans_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-telugu-fallback',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_CONFIG.name}`,
    default: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
  },
  description:
    'AI-powered study and preparation companion for Special APTET (Andhra Pradesh Teacher Eligibility Test) aspirants.',
  keywords: [
    'TET Assist',
    'Special APTET',
    'APTET 2024',
    'Andhra Pradesh TET',
    'Special Education TET',
    'Teacher Eligibility Test',
    'Pedagogy',
    'Child Development',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="te" className={`${sansFont.variable} ${teluguFont.variable}`}>
      <body className="bg-brand-bg text-brand-text min-h-screen flex flex-col font-sans selection:bg-brand-accent-light selection:text-brand-accent">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
