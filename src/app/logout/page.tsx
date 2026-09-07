import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Mascot from '@/components/Mascot';

export const metadata: Metadata = { title: 'Signed out' };

export default function LogoutPage() {
  const now = new Date();
  return (
    <>
      <SiteHeader stamp={now} />
      <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Mascot mood="dead-inside" className="mx-auto h-24 w-[86px]" />
        <h1 className="mt-8 font-serif text-3xl font-bold leading-tight text-newsprint">
          You are now nobody to me again. Statistically, you always were.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-newsprint/75">
          Your session is closed. Your reactions remain, detached from you, which is roughly how
          opinions work anyway.
        </p>
        <p className="mt-8 text-[13px] text-newsprint-dim">
          <Link href="/" className="text-broadcast hover:underline">
            Return to the bulletin
          </Link>{' '}
          ·{' '}
          <Link href="/login" className="text-newsprint-dim hover:text-newsprint">
            or identify yourself again, if the anonymity got to you
          </Link>
        </p>
      </main>
      <SiteFooter stamp={now} />
    </>
  );
}
