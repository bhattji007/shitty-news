// Every gag is a module in this folder. Flip to false to turn one off.
// `?sane=1` turns all of them off at runtime regardless of this file.
export const config = {
  overlays: true,     // cookie banner → 3 notification prompts → app-install bar
  cookie400: true,    // 400-toggle vendor panel
  paywall: true,      // 5 escalating paywalls
  banner: true,       // sticky bottom ad that grows and dodges
  video: true,        // Ad 1 of 47, forever
  chumbox: true,      // Doctors hate this Meerut man
  comments: true,     // three comments, always the same three
  poll: true,         // 51 / 49
  share: true,        // 14 buttons incl. Orkut and Fax
  ticker: true,       // BREAKING: Nothing happened (+ live layer)
  degrade: true,      // site gets slightly worse every visit
  masthead: true,     // date, Meerut temperature, #1 news website*
  maintenance: true,  // 1 in 50 loads → /maintenance
};

export type AnnoyanceName = keyof typeof config;

export type Ctx = {
  page: string;        // home | article | category | subscribe | sponsored | preferences | lite | other
  stream: boolean;     // STREAM_ENABLED baked in at build
  visit: number;       // from degrade.ts
  openPaywall: () => void;
  openCookiePanel: (onClose?: () => void) => void;
};
