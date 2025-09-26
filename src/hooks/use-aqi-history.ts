import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZoneKey } from "./use-aqi-simulation";

export type HistoryPoint = { time: string; aqi: number };
export type TimeRange = "6h" | "12h" | "24h" | "3d" | "7d";

const MAX_POINTS_6H = 6;
const MAX_POINTS_12H = 12;
const MAX_POINTS_24H = 24;
const MAX_POINTS_3D = 72;
const MAX_POINTS_7D = 168;

function generateSeed(zone: ZoneKey, hours: number): HistoryPoint[] {
  const now = new Date();
  const base = zone === "Delhi" ? 250 : zone === "Noida" ? 280 : 230;
  const noise = zone === "Delhi" ? [0, 10, 20, -5] : zone === "Noida" ? [0, 5, 10, -5] : [0, 8, 15, -3];
  const points: HistoryPoint[] = [];
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const idx = (hours - 1 - i) % noise.length;
    const aqi = Math.max(30, Math.round(base + noise[idx]));
    points.push({ time: d.toISOString(), aqi });
  }
  return points;
}

export function useAqiHistory(zone: ZoneKey, latestAqi: number) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const storeRef = useRef<Record<ZoneKey, HistoryPoint[]>>({
    Delhi: generateSeed("Delhi", MAX_POINTS_7D),
    Noida: generateSeed("Noida", MAX_POINTS_7D),
    Gurgaon: generateSeed("Gurgaon", MAX_POINTS_7D),
  });
  const lastAqiRef = useRef<number | null>(null);

  // Append on AQI update from simulation
  useEffect(() => {
    if (lastAqiRef.current === latestAqi) return;
    lastAqiRef.current = latestAqi;
    const list = storeRef.current[zone];
    const next: HistoryPoint = { time: new Date().toISOString(), aqi: latestAqi };
    const updated = [...list, next];
    // keep at most 168 points
    storeRef.current[zone] = updated.slice(-MAX_POINTS_7D);
  }, [latestAqi, zone]);

  // When zone changes, ensure it has seed data
  useEffect(() => {
    const exists = storeRef.current[zone];
    if (!exists || exists.length === 0) {
      storeRef.current[zone] = generateSeed(zone, MAX_POINTS_7D);
    }
  }, [zone]);

  const dataAll = storeRef.current[zone];

  const filtered = useMemo(() => {
    let max = MAX_POINTS_24H;
    if (timeRange === "6h") max = MAX_POINTS_6H;
    else if (timeRange === "12h") max = MAX_POINTS_12H;
    else if (timeRange === "24h") max = MAX_POINTS_24H;
    else if (timeRange === "3d") max = MAX_POINTS_3D;
    else if (timeRange === "7d") max = MAX_POINTS_7D;
    return dataAll.slice(-max);
  }, [dataAll, timeRange]);

  return {
    timeRange,
    setTimeRange,
    points: filtered,
  };
}


