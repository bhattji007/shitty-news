import { defineConfig } from 'astro/config';

// Static output. Everything the site needs is baked at build time;
// the optional live layer is a Pages Function in ./functions.
export default defineConfig({
  site: 'https://shittynews.in',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
