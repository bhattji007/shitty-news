/**
 * The LIVE indicator. It blinks on an irregular, slightly-too-long cycle. A
 * healthy studio light blinks once a second. This one is tired.
 */
export default function LiveBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-broadcast/40 px-1.5 py-0.5 ${className}`}
    >
      <span className="h-1.5 w-1.5 animate-tired-blink rounded-full bg-broadcast" aria-hidden />
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-broadcast">
        Live
      </span>
    </span>
  );
}
