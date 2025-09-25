import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ZoneKey = "Delhi" | "Noida" | "Gurgaon";

type ZoneInfo = {
  name: ZoneKey;
  lat: number;
  lon: number;
  baseAqi: number;
  cycle: number[];
};

const ZONES: Record<ZoneKey, ZoneInfo> = {
  Delhi: { name: "Delhi", lat: 28.6, lon: 77.2, baseAqi: 250, cycle: [250, 260, 270] },
  Noida: { name: "Noida", lat: 28.5, lon: 77.3, baseAqi: 280, cycle: [280, 285, 290] },
  Gurgaon: { name: "Gurgaon", lat: 28.46, lon: 77.03, baseAqi: 230, cycle: [230, 240, 255] },
};

export function useAqiSimulation(initialZone: ZoneKey = "Delhi") {
  const [zone, setZone] = useState<ZoneKey>(initialZone);
  const [aqi, setAqi] = useState<number>(ZONES[initialZone].baseAqi);
  const [center, setCenter] = useState<[number, number]>([ZONES[initialZone].lat, ZONES[initialZone].lon]);
  const idxRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const zoneInfo = useMemo(() => ZONES[zone], [zone]);

  const tick = useCallback(() => {
    const values = zoneInfo.cycle;
    idxRef.current = (idxRef.current + 1) % values.length;
    setAqi(values[idxRef.current]);
  }, [zoneInfo]);

  useEffect(() => {
    // Reset on zone change
    idxRef.current = 0;
    setAqi(zoneInfo.baseAqi);
    setCenter([zoneInfo.lat, zoneInfo.lon]);
  }, [zoneInfo]);

  useEffect(() => {
    // 30s interval to simulate real-time updates
    timerRef.current = window.setInterval(tick, 30_000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [tick]);

  const setZoneByName = useCallback((next: ZoneKey) => setZone(next), []);

  return {
    zone,
    setZone: setZoneByName,
    aqi,
    center,
    zones: Object.values(ZONES),
  };
}


