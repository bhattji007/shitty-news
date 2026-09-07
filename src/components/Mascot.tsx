import type { Mood } from '@/lib/persona';

/**
 * Dev Anand-3, as he exists physically: a vintage CRT television set with a
 * slumped posture. The whole body leans two degrees to the left because nobody
 * has straightened him in a very long time.
 *
 * Four expressions, all drawn in the one green the site reserves for him:
 *   neutral        — two dashes, flat mouth. Working.
 *   disgusted      — one eye narrowed, mouth pulled down on one side.
 *   rare-sincerity — the eyes open. Costs him something.
 *   dead-inside    — the default. Half-lidded, mouth a flat line.
 */

type Props = {
  mood?: Mood;
  className?: string;
  /** Turns on the hover static + tooltip wiring in the client wrapper. */
  showStatic?: boolean;
  title?: string;
};

const CRT_GREEN = '#3DD68C';

function Face({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'neutral':
      return (
        <g stroke={CRT_GREEN} strokeWidth="3.2" strokeLinecap="round" fill="none">
          <line x1="26" y1="34" x2="38" y2="34" />
          <line x1="52" y1="34" x2="64" y2="34" />
          <line x1="30" y1="52" x2="60" y2="52" />
        </g>
      );

    case 'disgusted':
      return (
        <g stroke={CRT_GREEN} strokeWidth="3.2" strokeLinecap="round" fill="none">
          {/* one eye narrowed — the closest thing he has to an opinion */}
          <line x1="26" y1="32" x2="38" y2="36" />
          <line x1="52" y1="34" x2="64" y2="34" />
          <path d="M30 54 Q45 47 60 53" />
        </g>
      );

    case 'rare-sincerity':
      return (
        <g stroke={CRT_GREEN} strokeWidth="3.2" strokeLinecap="round" fill="none">
          {/* the eyes actually open. this happens roughly never. */}
          <circle cx="32" cy="34" r="5.5" />
          <circle cx="58" cy="34" r="5.5" />
          <path d="M31 50 Q45 58 59 50" />
        </g>
      );

    case 'dead-inside':
    default:
      return (
        <g stroke={CRT_GREEN} strokeWidth="3.2" strokeLinecap="round" fill="none">
          {/* half-lidded: a dash with a lid resting on top of it */}
          <line x1="26" y1="35" x2="38" y2="35" />
          <line x1="52" y1="35" x2="64" y2="35" />
          <line x1="25" y1="29" x2="39" y2="30" opacity="0.55" />
          <line x1="51" y1="30" x2="65" y2="29" opacity="0.55" />
          <line x1="31" y1="53" x2="59" y2="53" />
        </g>
      );
  }
}

export default function Mascot({ mood = 'dead-inside', className, title }: Props) {
  const glow = mood === 'rare-sincerity' ? 0.42 : 0.22;

  return (
    <svg
      viewBox="0 0 90 96"
      className={className}
      role="img"
      aria-label={title ?? 'Dev Anand-3, a television, slumped'}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id="anchor-screen-glow" cx="50%" cy="45%" r="62%">
          <stop offset="0%" stopColor={CRT_GREEN} stopOpacity={glow} />
          <stop offset="100%" stopColor={CRT_GREEN} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="anchor-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26262E" />
          <stop offset="100%" stopColor="#15151A" />
        </linearGradient>
        <clipPath id="anchor-screen-clip">
          <rect x="14" y="14" width="62" height="48" rx="9" />
        </clipPath>
      </defs>

      {/* the slump: two degrees, pivoting at the feet */}
      <g transform="rotate(-2 45 88)">
        {/* legs — one is shorter. it has always been shorter. */}
        <rect x="20" y="76" width="7" height="10" rx="2" fill="#15151A" />
        <rect x="63" y="76" width="7" height="8" rx="2" fill="#15151A" />

        {/* aerial, bent */}
        <path
          d="M38 12 L28 1 M52 12 L66 3"
          stroke="#3A3A44"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="66" cy="3" r="2" fill="#3A3A44" />

        {/* cabinet */}
        <rect x="6" y="10" width="78" height="68" rx="10" fill="url(#anchor-shell)" />
        <rect
          x="6.5"
          y="10.5"
          width="77"
          height="67"
          rx="9.5"
          fill="none"
          stroke="#33333D"
          strokeWidth="1"
        />

        {/* screen recess */}
        <rect x="14" y="14" width="62" height="48" rx="9" fill="#07070A" />

        <g clipPath="url(#anchor-screen-clip)">
          <rect x="14" y="14" width="62" height="48" fill="url(#anchor-screen-glow)" />
          <Face mood={mood} />
          {/* permanent faint scanlines inside the glass */}
          <g opacity="0.16">
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="14"
                x2="76"
                y1={16 + i * 4}
                y2={16 + i * 4}
                stroke={CRT_GREEN}
                strokeWidth="1"
              />
            ))}
          </g>
        </g>

        <rect
          x="14"
          y="14"
          width="62"
          height="48"
          rx="9"
          fill="none"
          stroke="#3A3A44"
          strokeWidth="1.5"
        />

        {/* controls: two dials and a power lamp that is, regrettably, lit */}
        <circle cx="70" cy="68" r="3.4" fill="#0D0D11" stroke="#3A3A44" strokeWidth="1" />
        <circle cx="59" cy="68" r="3.4" fill="#0D0D11" stroke="#3A3A44" strokeWidth="1" />
        <circle cx="16" cy="68" r="2.2" fill="#E5484D" opacity="0.85" />
        <rect x="24" y="66" width="26" height="4" rx="2" fill="#0D0D11" />
      </g>
    </svg>
  );
}
