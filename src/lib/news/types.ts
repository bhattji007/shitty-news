export type Article = {
  id: string;                 // stable hash of link
  slug: string;               // from title, ascii, max 80 chars
  title: string;              // VERBATIM — never rewritten
  description: string | null; // VERBATIM — never rewritten
  url: string;
  image: string | null;
  source: string;             // source_name ?? source_id
  publishedAt: string;        // ISO
  category: string;
  live?: boolean;             // arrived via the stream
};

export const CATEGORIES = [
  'top', 'politics', 'business', 'technology', 'entertainment', 'sports', 'science',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type NewsFile = {
  fetchedAt: string;
  mode: 'newsdata' | 'rss' | 'sample';
  categories: Record<string, Article[]>;
};
