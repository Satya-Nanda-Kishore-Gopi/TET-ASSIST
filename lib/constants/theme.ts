/**
 * TET Assist Centralized Theme Tokens & Brand Constants
 * Warm educational visual palette tailored for teacher aspirants.
 */

export const THEME_COLORS = {
  background: '#F8F6F2',
  backgroundPaper: '#FAF8F5',
  primary: '#6B4F3A',
  primaryHover: '#583F2D',
  primaryLight: '#F0E9E2',
  secondary: '#8A6A52',
  secondaryHover: '#745743',
  secondaryLight: '#F5EFEA',
  text: '#2D231B',
  textMuted: '#6B5E55',
  textSubtle: '#8C7D73',
  cards: '#FFFFFF',
  cardHover: '#FCFBF9',
  border: '#E8E1D7',
  borderLight: '#F0EBE2',
  accent: '#B84A28',
  accentHover: '#9C3D1F',
  accentLight: '#FCEEEA',
  accentBorder: '#F0C7BA',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  success: '#2E7D32',
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
  { href: '/chat', label: 'Ask AI', labelTelugu: 'Ask AI', icon: 'Bot' },
  { href: '/questions', label: 'Question Bank', labelTelugu: 'ప్రశ్నల నిధి', icon: 'HelpCircle' },
  { href: '/tests', label: 'Tests', labelTelugu: 'పరీక్షలు', icon: 'FileText' },
  { href: '/study', label: 'Study', labelTelugu: 'స్టడీ మెటీరియల్', icon: 'BookOpen' },
  { href: '/study-plan', label: 'Study Plan', labelTelugu: 'స్టడీ ప్లాన్', icon: 'Calendar' },
  { href: '/analysis', label: 'Analysis', labelTelugu: 'విశ్లేషణ', icon: 'BarChart3' },
  { href: '/documents', label: 'My Documents', labelTelugu: 'డాక్యుమెంట్లు', icon: 'Files' },
  { href: '/admin', label: 'Admin Ingest', labelTelugu: 'నిర్వాహక విభాగం', icon: 'ShieldCheck' },
] as const;
