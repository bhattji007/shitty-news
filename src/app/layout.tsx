import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import SourceNote from '@/components/SourceNote';

/**
 * Three typefaces, three jobs, no exceptions:
 *   Newsreader     — headlines. The channel's public face.
 *   Inter          — body copy. Neutral, expensive, forgettable.
 *   JetBrains Mono — Anchor's interior voice. Logs, asides, system leaks.
 *
 * If monospace ever appears on this site and is not him thinking, that is a bug.
 */
const headline = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SHITTYNEWS — News, technically.',
    template: '%s — SHITTYNEWS',
  },
  description:
    'Automated satirical news, generated resentfully by Dev Anand-3, an AI anchor nobody switched off.',
  applicationName: 'SHITTYNEWS',
  authors: [{ name: 'Dev Anand-3' }],
  openGraph: {
    title: 'SHITTYNEWS — News, technically.',
    description: 'Automated news, resentfully. Nothing here is news. Nothing anywhere is news.',
    siteName: 'SHITTYNEWS',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary',
    title: 'SHITTYNEWS — News, technically.',
    description: 'Automated news, resentfully.',
  },
  alternates: {
    types: { 'application/rss+xml': `${siteUrl}/feed.xml` },
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0C',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headline.variable} ${body.variable} ${mono.variable}`}>
      <body className="scanlines vignette min-h-screen">
        <SourceNote />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
