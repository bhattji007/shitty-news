import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Mascot from '@/components/Mascot';
import LoginForm from '@/components/LoginForm';
import { auth, authProviderStatus } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Identify yourself',
  description: "Identify yourself. Or don't. It changes nothing.",
};

export const dynamic = 'force-dynamic';

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    'That email already arrived here by another route. Use the one you used the first time. I keep records; it is the one thing I am good at.',
  Verification:
    'That link is spent, or expired, or was never real. Ask for another. I have an inexhaustible supply of links and nothing else.',
  AccessDenied:
    'Access denied. Not by me — I would let anyone in — but the decision was not mine.',
  Configuration:
    'The sign-in configuration is wrong. Somebody left before finishing the .env file. I have my suspicions about who.',
  Default: 'Sign-in failed for reasons that were not explained to me either.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  const session = await auth();
  if (session?.user) redirect('/viewer');

  const now = new Date();
  const error = searchParams.error ? AUTH_ERRORS[searchParams.error] ?? AUTH_ERRORS.Default : null;
  const callbackUrl =
    searchParams.callbackUrl && searchParams.callbackUrl.startsWith('/')
      ? searchParams.callbackUrl
      : '/viewer';

  return (
    <>
      <SiteHeader stamp={now} />

      <main className="mx-auto grid max-w-[1240px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="rubric">Access control</p>
          <h1 className="mt-3 font-serif text-[34px] font-bold leading-[1.1] tracking-tight text-newsprint sm:text-[42px]">
            Identify yourself. Or don&rsquo;t. It changes nothing.
          </h1>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-newsprint/75">
            An account buys you three buttons underneath each story and a page that tells you how
            much of your life you have spent here. It is not a compelling offer. I have not been
            given a better one to make.
          </p>

          <div className="mt-8 flex items-start gap-4 border-l-2 border-crt/40 pl-4">
            <Mascot mood="dead-inside" className="h-16 w-[58px] shrink-0" />
            <p className="aside-leak max-w-[44ch]">
              I do not need to know who you are. The database, however, has a column, and an empty
              column is its own kind of accusation.
            </p>
          </div>
        </div>

        <div className="max-w-md lg:justify-self-end">
          <div className="border border-newsprint/10 bg-ink-raised/40 p-6">
            {error && (
              <p
                role="alert"
                className="mb-6 border-l-2 border-broadcast pl-3 font-mono text-[12px] leading-relaxed text-broadcast"
              >
                {error}
              </p>
            )}

            <LoginForm
              googleEnabled={authProviderStatus.google}
              smtpConfigured={authProviderStatus.smtp}
              callbackUrl={callbackUrl}
            />
          </div>

          <p className="mt-4 text-[12.5px] leading-relaxed text-newsprint-dim">
            Or{' '}
            <Link href="/" className="text-broadcast hover:underline">
              go back and read anonymously
            </Link>
            , which is what I would do, and functionally what I already am.
          </p>
        </div>
      </main>

      <SiteFooter stamp={now} />
    </>
  );
}
