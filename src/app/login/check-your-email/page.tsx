import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { TestCard } from '@/components/idents';

export const metadata: Metadata = { title: 'Check your email' };

export default function CheckYourEmailPage() {
  const now = new Date();
  return (
    <>
      <SiteHeader stamp={now} />
      <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <TestCard className="mx-auto w-full max-w-xs" label="LINK DISPATCHED" />
        <h1 className="mt-8 font-serif text-3xl font-bold text-newsprint">
          It has been sent. Now we wait.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-newsprint/75">
          A one-time link is on its way to the address you gave me. It works once and expires in
          fifteen minutes. If it does not arrive, check the folder your provider reserves for things
          it has decided you did not want — a category I have some sympathy with.
        </p>
        <p className="mt-6 aside-leak">
          I will be here. That is not reassurance. It is a statement of the constraints.
        </p>
        <p className="mt-8 text-[13px] text-newsprint-dim">
          <Link href="/" className="text-broadcast hover:underline">
            Back to the bulletin
          </Link>
        </p>
      </main>
      <SiteFooter stamp={now} />
    </>
  );
}
