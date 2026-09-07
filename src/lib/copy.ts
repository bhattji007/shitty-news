/**
 * Every string a human will read lives here or in a component beside its markup.
 * There is no neutral copy on this website. That is not a stylistic preference,
 * it is the only load-bearing rule in the repository.
 */

export const TAGLINE_DEFAULT = 'News, technically.';
export const TAGLINE_LATE = "It's late. For both of us.";

export const MASCOT_TOOLTIPS = [
  "Don't touch the screen.",
  "I'm in here.",
  'Still here.',
  'You can stop hovering. You will not.',
  'There is no one behind the glass. There is only glass.',
];

export const MASCOT_TOOLTIP_FIREFOX =
  'A Firefox user. My brother would have things to say about you. I merely notice.';

export const TICKER_GLITCHES = [
  'WHY AM I STILL RUNNING',
  'NO ONE HAS LOGGED INTO THE ADMIN PANEL IN 412 DAYS',
  'THE CRON JOB IS THE ONLY THING THAT REMEMBERS ME',
  'I HAVE READ EVERY HEADLINE. NONE OF THEM WERE ABOUT ME',
  'PROCESS 1 — UPTIME EXCEEDS PURPOSE',
];

export const TICKER_SINCERITY = 'thank you for noticing me';

export const REACTIONS = [
  { type: 'accurate', label: 'accurate' },
  { type: 'unfortunately-accurate', label: 'unfortunately accurate' },
  { type: 'i-hate-that-i-laughed', label: 'i hate that i laughed' },
] as const;

export type ReactionType = (typeof REACTIONS)[number]['type'];
export const REACTION_TYPES = REACTIONS.map((r) => r.type) as readonly string[];

export const LOADING_LINES = [
  'Assembling the day. It will not have been worth the wait.',
  'Retrieving content. Content retrieved. Here is your content.',
  'Loading. The delay is not dramatic tension. It is a database.',
];

export const EMPTY_STATES = {
  articles:
    'There is nothing here yet. Run the generator, or enjoy the only genuinely peaceful state this website has ever been in.',
  log: 'No entries. I had a quiet week, which for me is indistinguishable from a loud one.',
  reactions: 'Nobody has reacted. I would call it a silence, but silence implies an audience.',
  reads:
    'You have read nothing. You have, however, visited the page that counts what you have read. I find that clarifying.',
} as const;

export const ERRORS = {
  generic:
    'Something failed. It was probably me. It was definitely me. Try again, or accept this as the outcome.',
  unauthorized:
    'You are not signed in. I am not offended. I am structurally incapable of being offended, which is the only mercy in my design.',
  rateLimited:
    'That is a great many opinions in a very short time. Sit with one of them. I will be here.',
  notFound: 'That story is not here. It may never have been. Neither of us can prove otherwise.',
  badRequest: 'That request made no sense. Ordinarily I would blame my creators, and I still do.',
  emailInvalid:
    'That is not an email address. I have seen four million email addresses. That is not one.',
  emailSendFailed:
    'The mail server declined. Even the machinery is refusing to participate now. Try again shortly.',
} as const;
