// The parody is of the chrome, not of tragedy.
// Any article whose title matches one of these (case-insensitive) is skipped.
export const BLOCKLIST: readonly string[] = [
  'death', 'dies', 'died', 'killed', 'murder', 'rape', 'assault', 'riot',
  'communal', 'terror', 'blast', 'suicide', 'lynch', 'crash victims',
  // Same spirit as the list above; added after obituaries slipped through the sample.
  'passes away', 'passed away', 'dead', 'killing', 'drown',
];

const pattern = new RegExp(
  BLOCKLIST.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

export function isBlocked(title: string): boolean {
  return pattern.test(title);
}
