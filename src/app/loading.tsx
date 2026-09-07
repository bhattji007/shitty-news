import { TestCard } from '@/components/idents';
import { LOADING_LINES } from '@/lib/copy';

/**
 * The loading state is a test card, because that is what a channel shows when
 * it has nothing to show. The line beneath it does not rotate on a timer; it is
 * picked once, on the server, and he stands by it.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <TestCard className="w-full max-w-sm animate-signal-drop" label="STAND BY" />
      <p className="mt-8 font-mono text-[12.5px] leading-relaxed text-newsprint-dim">
        {LOADING_LINES[0]}
      </p>
    </div>
  );
}
