'use client';

import { SessionProvider } from 'next-auth/react';
import { AnchorMoodProvider } from './AnchorMoodProvider';
import WelcomeToast from './WelcomeToast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AnchorMoodProvider>
        {children}
        <WelcomeToast />
      </AnchorMoodProvider>
    </SessionProvider>
  );
}
