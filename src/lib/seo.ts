import type { Article } from './news/types.ts';

export const SITE = 'https://shittynews.com';
export const SITE_NAME = 'ShittyNews';
export const SITE_TITLE = "ShittyNews.com — India's #1 News Website*";
export const DEFAULT_DESCRIPTION =
  'Real Indian news headlines, shown exactly as their sources published them, inside a parody of every news-site dark pattern. No rewritten headlines, no LLM, no tracking.';
export const DEFAULT_OG_IMAGE = `${SITE}/og-default.png`;

// Pages build as /x.html; canonical URLs are clean (Cloudflare Pages serves them that way).
export function cleanPath(pathname: string): string {
  let p = pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (p.length > 1) p = p.replace(/\/$/, '');
  return p || '/';
}
export function absolute(pathname: string): string {
  return new URL(cleanPath(pathname), SITE).toString();
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE}/#org`,
    name: SITE_NAME,
    alternateName: 'ShittyNews.com',
    url: SITE,
    logo: { '@type': 'ImageObject', url: `${SITE}/og-default.png`, width: 1200, height: 630 },
    description: DEFAULT_DESCRIPTION,
    slogan: 'Sabse Pehle. Sabse Shitty.',
    knowsAbout: ['Indian news', 'news website dark patterns', 'satire'],
    publishingPrinciples: `${SITE}/about`,
    correctionsPolicy: `${SITE}/about`,
    sameAs: ['https://github.com/bhattji007/shitty-news'],
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE}/#org` },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

// NewsArticle for an article page. Headline is the source title, verbatim. The original
// publisher is credited as author and the piece is marked as based on the original URL.
export function newsArticleLd(a: Article, pagePath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${absolute(pagePath)}#article`,
    mainEntityOfPage: absolute(pagePath),
    url: absolute(pagePath),
    headline: a.title,
    description: a.description ?? undefined,
    image: a.image ? [a.image] : [DEFAULT_OG_IMAGE],
    datePublished: a.publishedAt,
    dateModified: a.publishedAt,
    inLanguage: 'en-IN',
    articleSection: a.category,
    author: { '@type': 'Organization', name: a.source, url: new URL(a.url).origin },
    publisher: { '@id': `${SITE}/#org` },
    isBasedOn: a.url,
    sameAs: a.url,
    isAccessibleForFree: true,
    creativeWorkStatus: 'Published',
    genre: 'news',
  };
}

export function collectionLd(name: string, pagePath: string, articles: Article[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absolute(pagePath),
    url: absolute(pagePath),
    name,
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.slice(0, 20).map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absolute(`/article/${a.slug}`),
        name: a.title,
      })),
    },
  };
}

export function aboutLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE}/about`,
    url: `${SITE}/about`,
    name: 'About ShittyNews',
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: { '@id': `${SITE}/#org` },
  };
}
