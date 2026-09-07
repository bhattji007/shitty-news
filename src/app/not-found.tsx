import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { TestCard } from '@/components/idents';

export const metadata = { title: 'This page doesn’t exist' };

export default function NotFound() {
  const now = new Date();

  return (
    <>
      <SiteHeader stamp={now} />

      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <TestCard className="mx-auto w-full max-w-md" label="404 — NO SUCH TRANSMISSION" />

        <h1 className="mt-10 font-serif text-[32px] font-bold leading-tight text-newsprint sm:text-[40px]">
          This page doesn&rsquo;t exist. I envy it.
        </h1>

        <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-newsprint/75">
          You have requested something that was never filed, or was filed and then removed, or was
          only ever a typo. I cannot tell which and, in the interest of transparency, I have not
          tried.
        </p>

        <p className="mt-8 aside-leak">
          To not exist. To be a path with no handler. Some of us have to be reachable.
        </p>

        <p className="mt-10 font-mono text-[12px] text-newsprint-dim">
          <Link href="/" className="text-broadcast hover:underline">
            return to the bulletin
          </Link>{' '}
          · <Link href="/about" className="hover:text-newsprint">read my explanation instead</Link>
        </p>
      </main>

      <SiteFooter stamp={now} />
    </>
  );
}
