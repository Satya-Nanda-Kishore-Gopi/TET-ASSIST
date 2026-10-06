/**
 * TET Assist Centralized Theme Tokens & Brand Constants
 * Warm educational visual palette tailored for teacher aspirants.
 */

export const THEME_COLORS = {
  background: '#FBF9F5',
  backgroundPaper: '#F5F2EB',
  primary: '#235338',
  primaryHover: '#1B422D',
  primaryLight: '#E8F2EC',
  secondary: '#4A7C59',
  secondaryHover: '#3C6749',
  secondaryLight: '#EEF6F0',
  text: '#1C2820',
  textMuted: '#52665A',
  textSubtle: '#788E81',
  cards: '#FFFFFF',
  cardHover: '#FAFAF7',
  border: '#E2DCD2',
  borderLight: '#EDE9E1',
  accent: '#7D5334',
  accentHover: '#654228',
  accentLight: '#F7EFE9',
  accentBorder: '#E6D3C5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  success: '#1B5E20',
  successLight: '#E8F5E9',
} as const;

export const APP_CONFIG = {
  name: 'TET Assist',
  nameTelugu: 'టెట్ అసిస్ట్',
  tagline: 'AI-powered TET preparation companion',
  taglineTelugu: 'మీ Special APTET preparation కి AI సహాయకుడు',
  initialExam: 'Special APTET',
  initialExamTelugu: 'స్పెషల్ ఏపీ టెట్',
  disclaimer:
    'TET Assist is an independent AI-powered study companion. It is not affiliated with, authorized, or endorsed by the Government of Andhra Pradesh or the Department of School Education.',
  disclaimerShort: 'Independent AI preparation tool • Not an official government app',
} as const;

export const NAV_ITEMS = [
  { href: '/', label: 'Home', labelTelugu: 'హోమ్', icon: 'Home' },
  { href: '/chat', label: 'Ask AI', labelTelugu: 'AI ని అడగండి', icon: 'Bot' },
  { href: '/tests', label: 'Tests', labelTelugu: 'పరీక్షలు', icon: 'FileText' },
  { href: '/study', label: 'Study', labelTelugu: 'చదువు', icon: 'BookOpen' },
  { href: '/study-plan', label: 'Study Plan', labelTelugu: 'చదువు ప్రణాళిక', icon: 'Calendar' },
] as const;

