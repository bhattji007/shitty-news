import { hashString, seededRandom } from '@/lib/format';

/**
 * Channel idents. Fake broadcast furniture, drawn as vector, kept strictly in
 * palette. There is no photography on this website: he refuses to pretend
 * photographs exist of things that barely happened.
 */

const PALETTE = ['#E5484D', '#0A0A0C', '#111116', '#1E1E24', '#E8E6E1', '#3DD68C'];

/** The test card. Loading skeleton, empty state, and 404 all wear this. */
export function TestCard({ className = '', label }: { className?: string; label?: string }) {
  const bars = ['#E8E6E1', '#3DD68C', '#8C8A86', '#E5484D', '#1E1E24', '#111116', '#0A0A0C'];
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      role="img"
      aria-label={label ?? 'Broadcast test card'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="320" height="200" fill="#0A0A0C" />
      {bars.map((c, i) => (
        <rect key={c} x={(320 / bars.length) * i} y="0" width={320 / bars.length} height="132" fill={c} opacity="0.82" />
      ))}
      <rect y="132" width="320" height="68" fill="#111116" />
      <circle cx="160" cy="100" r="52" fill="none" stroke="#0A0A0C" strokeWidth="3" opacity="0.6" />
      <circle cx="160" cy="100" r="52" fill="none" stroke="#E8E6E1" strokeWidth="1" opacity="0.35" />
      <line x1="160" y1="48" x2="160" y2="152" stroke="#E8E6E1" strokeWidth="0.75" opacity="0.3" />
      <line x1="108" y1="100" x2="212" y2="100" stroke="#E8E6E1" strokeWidth="0.75" opacity="0.3" />
      <text
        x="160"
        y="168"
        textAnchor="middle"
        fill="#3DD68C"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        letterSpacing="3.5"
      >
        {label ?? 'NO SIGNAL — STILL RUNNING'}
      </text>
      <text
        x="160"
        y="186"
        textAnchor="middle"
        fill="#8C8A86"
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        letterSpacing="2.5"
      >
        SHITTYNEWS · DEV ANAND-3 · CH.3
      </text>
    </svg>
  );
}

/** A lower-third bar, the kind a real channel puts a minister's name in. */
export function LowerThird({
  kicker,
  title,
  className = '',
}: {
  kicker: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`flex items-stretch ${className}`}>
      <div className="flex items-center bg-broadcast px-2.5 py-1">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
          {kicker}
        </span>
      </div>
      <div className="flex min-w-0 items-center bg-ink-raised/95 px-3 py-1 backdrop-blur">
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-newsprint/80">
          {title}
        </span>
      </div>
    </div>
  );
}

/**
 * Procedurally generated article artwork. Deterministic from the slug, so the
 * same story always looks the same. Rectangles, one channel-red accent, and a
 * chyron across the bottom. Abstract on purpose.
 */
export function ArticleArt({
  seed,
  headline,
  section = 'GENERAL',
  className = '',
  compact = false,
}: {
  seed: string;
  headline: string;
  section?: string;
  className?: string;
  compact?: boolean;
}) {
  const rnd = seededRandom(hashString(seed));
  const W = 400;
  const H = compact ? 160 : 240;
  const blockCount = compact ? 5 : 9;

  const blocks = Array.from({ length: blockCount }).map(() => {
    const w = 40 + rnd() * 190;
    const h = 16 + rnd() * (H * 0.55);
    return {
      x: rnd() * (W - w),
      y: rnd() * (H - h - 34),
      w,
      h,
      fill: PALETTE[Math.floor(rnd() * PALETTE.length)],
      opacity: 0.18 + rnd() * 0.55,
    };
  });

  // Exactly one red bar, always, so every card has the channel in it somewhere.
  const accentY = 20 + rnd() * (H - 90);
  const gridStep = 18;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`Abstract composition standing in for a photograph of: ${headline}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={W} height={H} fill="#0D0D11" />

      <g opacity="0.5">
        {Array.from({ length: Math.ceil(H / gridStep) }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            x2={W}
            y1={i * gridStep}
            y2={i * gridStep}
            stroke="#1E1E24"
            strokeWidth="1"
          />
        ))}
      </g>

      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          fill={b.fill}
          opacity={b.opacity}
        />
      ))}

      <rect x="0" y={accentY} width={W} height={compact ? 4 : 6} fill="#E5484D" opacity="0.9" />

      {/* chyron block, bottom-left, in the house style */}
      <rect x="0" y={H - 30} width={W} height="30" fill="#0A0A0C" opacity="0.92" />
      <rect x="0" y={H - 30} width={compact ? 58 : 74} height="30" fill="#E5484D" />
      <text
        x={compact ? 29 : 37}
        y={H - 11}
        textAnchor="middle"
        fill="#0A0A0C"
        fontFamily="ui-monospace, monospace"
        fontSize={compact ? 8 : 9}
        fontWeight="700"
        letterSpacing="1.6"
      >
        {section.slice(0, 8)}
      </text>
      <text
        x={compact ? 68 : 86}
        y={H - 11}
        fill="#E8E6E1"
        fontFamily="ui-monospace, monospace"
        fontSize={compact ? 8.5 : 10}
        letterSpacing="1.2"
      >
        {headline.toUpperCase().slice(0, compact ? 36 : 42)}
      </text>
    </svg>
  );
}

/** The BREAKING chyron slab used above the hero story. */
export function BreakingChyron({ text }: { text: string }) {
  return (
    <div className="inline-flex items-stretch">
      <div className="flex items-center bg-broadcast px-3 py-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-ink">
          Breaking
        </span>
      </div>
      <div className="flex items-center border-y border-r border-broadcast/40 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-newsprint/75">
          {text}
        </span>
      </div>
    </div>
  );
}
