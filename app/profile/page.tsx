import React from 'react';
import { Metadata } from 'next';
import { ProfileView } from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Profile | Preferences & Target Score',
  description: 'Manage Special APTET preferences, daily study hours, target score, and language medium.',
};

export default function ProfilePage() {
  return <ProfileView />;
}
