import { useEffect, useMemo, useRef, useState } from "react";

export type Sources = { stubble: number; traffic: number; industrial: number; other: number };

function clampPercent(x: number) {
  return Math.max(0, Math.min(100, x));
}

function normalize(s: Sources): Sources {
  const total = s.stubble + s.traffic + s.industrial + s.other;
  if (total === 100) return s;
  if (total <= 0) return { stubble: 25, traffic: 25, industrial: 25, other: 25 };
  const factor = 100 / total;
  const scaled = {
    stubble: s.stubble * factor,
    traffic: s.traffic * factor,
    industrial: s.industrial * factor,
    other: s.other * factor,
  };
  // Round and fix rounding drift
  const rounded = {
    stubble: Math.round(scaled.stubble),
    traffic: Math.round(scaled.traffic),
    industrial: Math.round(scaled.industrial),
    other: Math.round(scaled.other),
  };
  let drift = 100 - (rounded.stubble + rounded.traffic + rounded.industrial + rounded.other);
  if (drift !== 0) {
    // Adjust the largest component to absorb the drift
    const entries = Object.entries(rounded) as [keyof Sources, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const key = entries[0][0];
    (rounded as any)[key] += drift;
  }
  return rounded;
}

export function useSourceShift(base: Sources) {
  const [shifted, setShifted] = useState<Sources>(normalize(base));
  const timerRef = useRef<number | null>(null);
  const baseRef = useRef<Sources>(normalize(base));

  useEffect(() => {
    baseRef.current = normalize(base);
    setShifted(normalize(base));
  }, [base]);

  useEffect(() => {
    function tick() {
      const b = baseRef.current;
      // Small deterministic wiggle: rotate +2, -1, -1, 0 to keep sum 100
      const next = normalize({
        stubble: clampPercent(b.stubble + 2),
        traffic: clampPercent(b.traffic - 1),
        industrial: clampPercent(b.industrial - 1),
        other: clampPercent(b.other + 0),
      });
      baseRef.current = next;
      setShifted(next);
    }
    timerRef.current = window.setInterval(tick, 30_000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return useMemo(() => shifted, [shifted]);
}


