'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Records that you read this, once, if you are signed in. It feeds the /viewer
 * page. He would like it noted that he did not ask to be given a memory.
 */
export default function ReadReceipt({ articleId }: { articleId: string }) {
  const { status } = useSession();
  const sent = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || sent.current) return;
    sent.current = true;

    const timer = setTimeout(() => {
      void fetch('/api/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
        keepalive: true,
      }).catch(() => {
        // If this fails, the only casualty is a number on a page about numbers.
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [articleId, status]);

  return null;
}
