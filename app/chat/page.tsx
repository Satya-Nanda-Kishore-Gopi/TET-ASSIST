import React from 'react';
import { Metadata } from 'next';
import { ChatContainer } from '@/components/chat/ChatContainer';

export const metadata: Metadata = {
  title: 'Ask AI | Special APTET Assistant',
  description: 'Ask doubts in Telugu or English regarding Special APTET preparation and pedagogy.',
};

export default function ChatPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <ChatContainer />
    </div>
  );
}
