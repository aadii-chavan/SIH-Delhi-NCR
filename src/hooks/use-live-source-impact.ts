import { useState, useEffect, useCallback } from 'react';

export interface SourceBreakdown {
  stubble: number;
  traffic: number;
  industrial: number;
  other: number;
}

interface UseLiveSourceImpactResult {
  sources: SourceBreakdown | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: string | null;
}

// Heuristic mapping based on typical Delhi source profiles
function estimateSources(pollutants: Record<string, number>): SourceBreakdown {
  // Assign weights based on research (approximate)
  // PM2.5: stubble/biomass, PM10: dust/traffic, NO2: traffic, SO2: industrial, CO: incomplete combustion
  const { pm25 = 0, pm10 = 0, no2 = 0, so2 = 0, co = 0 } = pollutants;
  const total = pm25 + pm10 + no2 + so2 + co || 1;
  // Example weights (adjust as needed)
  const stubble = pm25 * 0.6 + co * 0.2;
  const traffic = no2 * 0.7 + pm10 * 0.3 + co * 0.3;
  const industrial = so2 * 0.8 + pm10 * 0.2;
  const other = total - (stubble + traffic + industrial);
  const sum = stubble + traffic + industrial + other || 1;
  return {
    stubble: Math.round((stubble / sum) * 100),
    traffic: Math.round((traffic / sum) * 100),
    industrial: Math.round((industrial / sum) * 100),
    other: Math.max(0, 100 - (Math.round((stubble / sum) * 100) + Math.round((traffic / sum) * 100) + Math.round((industrial / sum) * 100))),
  };
}

export function useLiveSourceImpact(city: string = 'delhi', refreshInterval: number = 5 * 60 * 1000): UseLiveSourceImpactResult {
  const [sources, setSources] = useState<SourceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
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
      const iaqi = result.data.iaqi || {};
      const pollutants: Record<string, number> = {
        pm25: iaqi.pm25?.v ?? 0,
        pm10: iaqi.pm10?.v ?? 0,
        no2: iaqi.no2?.v ?? 0,
        so2: iaqi.so2?.v ?? 0,
        co: iaqi.co?.v ?? 0,
      };
      const breakdown = estimateSources(pollutants);
      setSources(breakdown);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch source impact');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchSources();
    const interval = setInterval(fetchSources, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchSources, refreshInterval]);

  const refetch = useCallback(() => {
    fetchSources();
  }, [fetchSources]);

  return { sources, loading, error, refetch, lastUpdated };
}
