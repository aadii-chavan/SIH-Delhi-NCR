import { useState, useEffect, useCallback } from 'react';

export interface AqiHistoryPoint {
  time: string; // ISO string
  aqi: number;
}

interface UseLiveAqiHistoryResult {
  history: AqiHistoryPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: string | null;
}

const HISTORY_KEY = 'aqi_24h_history';
const MAX_POINTS = 24;

function dedupeByHour(points: AqiHistoryPoint[]): AqiHistoryPoint[] {
  const seen = new Set<string>();
  return points.filter((pt) => {
    const hour = new Date(pt.time).toISOString().slice(0, 13); // YYYY-MM-DDTHH
    if (seen.has(hour)) return false;
    seen.add(hour);
    return true;
  });
}

export function useLiveAqiHistory(city: string = 'delhi', refreshInterval: number = 5 * 60 * 1000): UseLiveAqiHistoryResult {
  const [history, setHistory] = useState<AqiHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY + '_' + city);
    if (raw) {
      try {
        const parsed: AqiHistoryPoint[] = JSON.parse(raw);
        setHistory(parsed);
      } catch {}
    }
    setLoading(false);
  }, [city]);

  const fetchAqi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiToken = import.meta.env.VITE_AQI_TOKEN;
      if (!apiToken) throw new Error('VITE_AQI_TOKEN not set');
      const apiUrl = `https://api.waqi.info/feed/${city}/?token=${apiToken}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      if (result.status !== 'ok') throw new Error('API returned error');
      const now = new Date();
      const hourIso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();
      const newPoint: AqiHistoryPoint = { time: hourIso, aqi: result.data.aqi };
      // Remove any existing point for this hour
      let updated = history.filter(pt => new Date(pt.time).toISOString().slice(0, 13) !== hourIso.slice(0, 13));
      updated = [...updated, newPoint].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      // Deduplicate and keep only last 24
      updated = dedupeByHour(updated).slice(-MAX_POINTS);
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY + '_' + city, JSON.stringify(updated));
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AQI');
    } finally {
      setLoading(false);
    }
  }, [city, history]);

  // Poll every 5 minutes
  useEffect(() => {
    fetchAqi();
    const interval = setInterval(fetchAqi, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAqi, refreshInterval]);

  const refetch = useCallback(() => {
    fetchAqi();
  }, [fetchAqi]);

  return { history, loading, error, refetch, lastUpdated };
}
