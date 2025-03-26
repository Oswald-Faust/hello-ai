'use client';

import dynamic from 'next/dynamic';

const ConversationConfigPageContent = dynamic(
  () => import('@/components/ConversationConfig'),
  { ssr: false }
);

export default function ConversationConfigPage() {
  return <ConversationConfigPageContent />;
} 