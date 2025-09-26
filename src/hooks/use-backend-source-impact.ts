import { useState, useEffect, useCallback } from 'react';

export interface BackendSourceBreakdown {
  stubble: number;
  traffic: number;
  industrial: number;
  other: number;
}

export interface BackendSourceResponse {
  timestamp: string | null;
  zone: string;
  sources: BackendSourceBreakdown;
  previous: BackendSourceBreakdown;
}

interface UseBackendSourceImpactResult {
  data: BackendSourceResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: string | null;
}

const BACKEND_URL = 'http://localhost:8000';

export function useBackendSourceImpact(refreshInterval: number = 5 * 60 * 1000): UseBackendSourceImpactResult {
  const [data, setData] = useState<BackendSourceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/source-breakdown`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: BackendSourceResponse = await response.json();
      
      setData(result);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch source breakdown data';
      setError(errorMessage);
      console.error('Error fetching backend source data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for automatic refresh
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated
  };
}
