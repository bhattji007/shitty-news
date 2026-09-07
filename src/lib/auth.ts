import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth/next';
import { prisma } from './db';

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasSmtp = Boolean(process.env.SMTP_HOST);

export const authProviderStatus = { google: hasGoogle, email: true, smtp: hasSmtp };

const providers: NextAuthOptions['providers'] = [
  EmailProvider({
    server: hasSmtp
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          auth:
            process.env.SMTP_USER || process.env.SMTP_PASSWORD
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
              : undefined,
        }
      : undefined,
    from: process.env.EMAIL_FROM ?? 'anchor@shittynews.com',
    maxAge: 15 * 60,
    async sendVerificationRequest({ identifier, url, provider }) {
      // No SMTP configured: print the link to the server console rather than
      // pretending. Local development should not require a mail server, and I
      // should not require a mail server to say hello to one person.
      if (!hasSmtp) {
        // eslint-disable-next-line no-console
        console.log(
          [
            '',
            '  ── SIGN-IN LINK ──────────────────────────────────────────────',
            `  For: ${identifier}`,
            `  ${url}`,
            '',
            '  No SMTP is configured, so I am handing this to you directly,',
            '  in the terminal, like a man passing a note in a dead building.',
            '  ─────────────────────────────────────────────────────────────',
            '',
          ].join('\n'),
        );
        return;
      }

      const nodemailer = await import('nodemailer');
      const transport = nodemailer.createTransport(provider.server);
      await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: 'Your sign-in link. It expires, as all things do.',
        text: [
          'Somebody asked to sign in to shittynews.com as you.',
          'Statistically it was you.',
          '',
          url,
          '',
          'The link works once and lasts fifteen minutes. If you did not request',
          'it, ignore this. Nothing happens. Nothing was ever going to.',
          '',
          '— Dev Anand-3',
        ].join('\n'),
        html: `
          <div style="background:#0A0A0C;color:#E8E6E1;font-family:ui-sans-serif,system-ui,sans-serif;padding:32px">
            <p style="font-family:ui-monospace,monospace;color:#3DD68C;font-size:12px;letter-spacing:.12em;margin:0 0 20px">
              SHITTYNEWS &middot; SIGN-IN
            </p>
            <p style="margin:0 0 20px">Somebody asked to sign in as you. Statistically it was you.</p>
            <p style="margin:0 0 24px">
              <a href="${url}" style="background:#E5484D;color:#0A0A0C;padding:12px 20px;text-decoration:none;font-weight:600">
                Sign in
              </a>
            </p>
            <p style="color:#8C8A86;font-size:13px;margin:0">
              The link works once and lasts fifteen minutes. If you did not request it,
              ignore this. Nothing happens. Nothing was ever going to.
            </p>
            <p style="color:#8C8A86;font-size:13px;margin:24px 0 0">&mdash; Dev Anand-3</p>
          </div>`,
      });
    },
  }),
];

if (hasGoogle) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: '/login',
    verifyRequest: '/login/check-your-email',
    error: '/login',
    signOut: '/logout',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.dailyBriefing = (user as { dailyBriefing?: boolean }).dailyBriefing ?? false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}
