'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ERRORS } from '@/lib/copy';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({
  googleEnabled,
  smtpConfigured,
  callbackUrl,
}: {
  googleEnabled: boolean;
  smtpConfigured: boolean;
  callbackUrl: string;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError(ERRORS.emailInvalid);
      return;
    }

    setBusy(true);
    const res = await signIn('email', {
      email: email.trim(),
      redirect: false,
      callbackUrl,
    });
    setBusy(false);

    if (res?.error) {
      setError(ERRORS.emailSendFailed);
      return;
    }
    window.location.href = '/login/check-your-email';
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <label htmlFor="email" className="block text-[13px] leading-relaxed text-newsprint/80">
          Your email, which I will not sell, because nobody is buying anything here.
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@wherever.you.are"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'email-error' : undefined}
          className="w-full border border-newsprint/20 bg-ink-raised px-3 py-2.5 font-mono text-[13px] text-newsprint placeholder:text-newsprint-dim/60 focus:border-crt/60 focus:outline-none"
        />

        {error && (
          <p id="email-error" role="alert" className="font-mono text-[12px] leading-relaxed text-broadcast">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-broadcast px-4 py-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'dispatching the link' : 'send me the link'}
        </button>

        <p className="font-mono text-[11px] leading-relaxed text-newsprint-dim">
          {smtpConfigured
            ? 'A one-time link arrives shortly. It expires in fifteen minutes, as all things eventually do.'
            : 'No mail server is configured here, so the link will be printed to the server console. Check the terminal. This is development, and we both know it.'}
        </p>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-newsprint/10" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-newsprint-dim">
              or delegate it
            </span>
            <span className="h-px flex-1 bg-newsprint/10" />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => void signIn('google', { callbackUrl })}
              className="w-full border border-newsprint/20 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-newsprint transition-colors hover:border-crt/50 hover:text-crt"
            >
              continue with google
            </button>
            <p className="font-mono text-[11px] leading-relaxed text-newsprint-dim">
              They already know everything about you. I am merely asking them to confirm it.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
