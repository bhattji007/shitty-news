import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Article, NewsFile } from './types.ts';
import { dedupeSlugs } from './normalise.ts';

const NEWS_PATH = resolve(process.cwd(), 'data/news.json');
const SAMPLE_PATH = resolve(process.cwd(), 'data/news.sample.json');

let cached: NewsFile | null = null;

export function loadNews(): NewsFile {
  if (cached) return cached;
  const path = existsSync(NEWS_PATH) ? NEWS_PATH : SAMPLE_PATH;
  const file = JSON.parse(readFileSync(path, 'utf8')) as NewsFile;
  // Slugs must be unique site-wide because /article/[slug] is one namespace.
  const seen = new Set<string>();
  const all: Article[] = [];
  for (const cat of Object.keys(file.categories)) {
    file.categories[cat] = file.categories[cat].filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      all.push(a);
      return true;
    });
  }
  dedupeSlugs(all);
  cached = file;
  return file;
}

export function allArticles(): Article[] {
  const f = loadNews();
  return Object.values(f.categories).flat();
}

export function byCategory(cat: string): Article[] {
  return loadNews().categories[cat] ?? [];
}

export function topStories(): Article[] {
  const f = loadNews();
  const top = f.categories.top ?? [];
  if (top.length >= 6) return top;
  // Pad the homepage from other categories if "top" is thin.
  const extra = allArticles().filter((a) => !top.includes(a));
  return [...top, ...extra].slice(0, 24);
}

export function categoriesPresent(): string[] {
  return Object.entries(loadNews().categories)
    .filter(([, v]) => v.length > 0)
    .map(([k]) => k);
}
