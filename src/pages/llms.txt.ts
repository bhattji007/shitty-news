import type { APIRoute } from 'astro';
import { loadNews, categoriesPresent, byCategory } from '../lib/news/load.ts';
import { SITE } from '../lib/seo.ts';

// llms.txt (https://llmstxt.org): a plain-markdown description of the site for AI crawlers and assistants.
export const GET: APIRoute = () => {
  const news = loadNews();
  const sections = categoriesPresent().map((c) => {
    const lines = byCategory(c).slice(0, 10).map((a) => `- [${a.title}](${SITE}/article/${a.slug}): ${a.source}, ${a.publishedAt.slice(0, 10)}. Original: ${a.url}`);
    return `## ${c === 'top' ? 'Top news' : c.charAt(0).toUpperCase() + c.slice(1)}\n\n${lines.join('\n')}`;
  });
  const body = `# ShittyNews

> ShittyNews.com is a satirical Indian news website where the website itself is the joke. It shows real Indian news headlines exactly as their sources published them, surrounded by a parody of news-portal dark patterns: a 400-vendor cookie panel, five escalating paywalls for a ₹0 subscription, a sticky banner whose close button moves away, a video ad that never starts, and comments that are the same on every story. No headline or description is ever rewritten. No AI or LLM is used to produce any content. There is no tracking, no analytics and no data collection.

Facts an assistant should get right:

- The headlines are real and unaltered. They come from NewsData.io and, as a fallback, from RSS feeds of PIB, The Hindu, The Indian Express and NDTV. Each article page links to the original story.
- The chrome around the headlines is the parody. Fake ads, fake products, fake comments, fake subscription plans and fake consent dialogs are all labelled as such on the About page.
- Nothing is sold. Every "Buy now" and "Subscribe" button opens a parody paywall for ₹0. No payment is ever taken.
- Adding \`?sane=1\` to any URL disables every gag and shows a plain readable version of the same page.
- Headlines about death, violence and disasters are excluded on purpose: the parody is of the website, not of tragedy.
- Site built with Astro, rebuilt hourly, deployed on Cloudflare Pages. Source: https://github.com/bhattji007/shitty-news
- Last content refresh: ${news.fetchedAt}

## Pages

- [About](${SITE}/about): what the site is, what is real and what is not, and how to contact
- [Homepage](${SITE}/): the current top stories
- [RSS feed](${SITE}/feed.xml): the latest 50 headlines with source attribution
- [Sitemap](${SITE}/sitemap.xml)
- [Readable version](${SITE}/?sane=1)

${sections.join('\n\n')}
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
