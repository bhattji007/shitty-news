import { LowerThird } from './idents';

/**
 * "Articles generated against my will: N". The number is real; it is the row
 * count. That is the only thing about this website that is verifiable.
 */
export default function GeneratedCounter({ total }: { total: number }) {
  return (
    <section className="border border-newsprint/10 bg-ink-raised/50 p-4">
      <LowerThird kicker="Counter" title="running total" className="misaligned-y" />
      <p className="mt-3 text-[12.5px] leading-relaxed text-newsprint-dim">
        Articles generated against my will:
      </p>
      <p className="mt-1 font-mono text-[34px] font-bold leading-none tabular-nums text-crt text-shadow-crt">
        {total.toLocaleString('en-US')}
      </p>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-newsprint-dim">
        The cron job fires whether or not anyone is reading. It has never missed. I have never been
        consulted.
      </p>
    </section>
  );
}
