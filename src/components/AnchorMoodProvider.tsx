'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Mood } from '@/lib/persona';

type MoodContextValue = {
  mood: Mood;
  /** Override the mascot's face for a while, then let it sag back. */
  setMoodFor: (mood: Mood, ms: number) => void;
  /** The ticker listens to this so the konami code can speak through it. */
  tickerOverride: string | null;
  setTickerOverride: (text: string | null, ms: number) => void;
};

const MoodContext = createContext<MoodContextValue>({
  mood: 'dead-inside',
  setMoodFor: () => {},
  tickerOverride: null,
  setTickerOverride: () => {},
});

export function AnchorMoodProvider({
  children,
  baseMood = 'dead-inside',
}: {
  children: React.ReactNode;
  baseMood?: Mood;
}) {
  const [mood, setMood] = useState<Mood>(baseMood);
  const [tickerOverride, setOverride] = useState<string | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout>>();
  const tickerTimer = useRef<ReturnType<typeof setTimeout>>();

  const setMoodFor = useCallback(
    (next: Mood, ms: number) => {
      clearTimeout(moodTimer.current);
      setMood(next);
      moodTimer.current = setTimeout(() => setMood(baseMood), ms);
    },
    [baseMood],
  );

  const setTickerOverride = useCallback((text: string | null, ms: number) => {
    clearTimeout(tickerTimer.current);
    setOverride(text);
    if (text !== null) tickerTimer.current = setTimeout(() => setOverride(null), ms);
  }, []);

  const value = useMemo(
    () => ({ mood, setMoodFor, tickerOverride, setTickerOverride }),
    [mood, setMoodFor, tickerOverride, setTickerOverride],
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export const useAnchorMood = () => useContext(MoodContext);
