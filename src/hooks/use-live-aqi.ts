import { useState, useEffect, useCallback } from 'react';

interface LiveAQIData {
  aqi: number;
  location: string;
  timestamp: string;
  status: string;
  color: string;
  trend?: {
    change: number;
    direction: "up" | "down" | "stable";
  };
}

interface WAQIApiResponse {
  status: string;
  data: {
    aqi: number;
    city: {
      name: string;
    };
    time: {
      s: string;
    };
  };
}

interface UseLiveAQIResult {
  data: LiveAQIData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: string | null;
  trendHistory: number[];
}

// Helper function to get AQI status and color
const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return { status: "Good", color: "aqi-good" };
  if (aqi <= 100) return { status: "Moderate", color: "aqi-moderate" }; 
  if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", color: "aqi-moderate" };
  if (aqi <= 200) return { status: "Unhealthy", color: "aqi-unhealthy" };
  if (aqi <= 300) return { status: "Very Unhealthy", color: "aqi-severe" };
  return { status: "Hazardous", color: "aqi-severe" };
};

export const useLiveAQI = (city: string = 'delhi', refreshInterval: number = 300000): UseLiveAQIResult => {
  const [data, setData] = useState<LiveAQIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [previousAQI, setPreviousAQI] = useState<number | null>(null);
  const [trendHistory, setTrendHistory] = useState<number[]>([]);

  const fetchAQIData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiToken = import.meta.env.VITE_AQI_TOKEN;
      if (!apiToken) {
        throw new Error('VITE_AQI_TOKEN environment variable is not set');
      }

      const apiUrl = `https://api.waqi.info/feed/${city}/?token=${apiToken}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: WAQIApiResponse = await response.json();
      
      if (result.status !== 'ok') {
        throw new Error('API returned error status');
      }

      const { status, color } = getAQIStatus(result.data.aqi);
      
      // Calculate trend if we have previous data
      let trend: LiveAQIData['trend'] | undefined;
      if (previousAQI !== null) {
        const change = Math.abs(result.data.aqi - previousAQI);
        const direction = result.data.aqi > previousAQI ? "up" : 
                         result.data.aqi < previousAQI ? "down" : "stable";
        trend = { change, direction };
      }

      const liveData: LiveAQIData = {
        aqi: result.data.aqi,
        location: result.data.city.name,
        timestamp: result.data.time.s,
        status,
        color,
        trend
      };

      setData(liveData);
      setPreviousAQI(result.data.aqi);
      setLastUpdated(new Date().toISOString());
      
      // Update trend history (keep last 10 readings)
      setTrendHistory(prev => {
        const newHistory = [...prev, result.data.aqi];
        return newHistory.slice(-10);
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AQI data';
      setError(errorMessage);
      console.error('Error fetching AQI data:', err);
    } finally {
      setLoading(false);
    }
  }, [city, previousAQI]);

  const refetch = useCallback(() => {
    fetchAQIData();
  }, [fetchAQIData]);

  useEffect(() => {
    // Initial fetch
    fetchAQIData();

    // Set up interval for automatic refresh
    const interval = setInterval(fetchAQIData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchAQIData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    trendHistory
  };
};
