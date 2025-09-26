import { useState, useEffect, useCallback } from 'react';

interface ForecastDataPoint {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

interface WAQIForecastResponse {
  status: string;
  data: {
    forecast: {
      daily: {
        pm25: Array<{
          day: string;
          avg: number;
          max: number;
          min: number;
        }>;
        pm10: Array<{
          day: string;
          avg: number;
          max: number;
          min: number;
        }>;
        o3: Array<{
          day: string;
          avg: number;
          max: number;
          min: number;
        }>;
      };
    };
  };
}

interface UseForecastResult {
  forecastData: ForecastDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: string | null;
}

// Helper function to convert PM2.5 to AQI (simplified conversion)
const pm25ToAQI = (pm25: number): number => {
  if (pm25 <= 12) return Math.round((pm25 / 12) * 50);
  if (pm25 <= 35.4) return Math.round(((pm25 - 12) / (35.4 - 12)) * 50 + 50);
  if (pm25 <= 55.4) return Math.round(((pm25 - 35.4) / (55.4 - 35.4)) * 50 + 100);
  if (pm25 <= 150.4) return Math.round(((pm25 - 55.4) / (150.4 - 55.4)) * 100 + 150);
  if (pm25 <= 250.4) return Math.round(((pm25 - 150.4) / (250.4 - 150.4)) * 100 + 200);
  return Math.round(((pm25 - 250.4) / (500.4 - 250.4)) * 200 + 300);
};

// Helper function to convert PM10 to AQI (simplified conversion)
const pm10ToAQI = (pm10: number): number => {
  if (pm10 <= 54) return Math.round((pm10 / 54) * 50);
  if (pm10 <= 154) return Math.round(((pm10 - 54) / (154 - 54)) * 50 + 50);
  if (pm10 <= 254) return Math.round(((pm10 - 154) / (254 - 154)) * 50 + 100);
  if (pm10 <= 354) return Math.round(((pm10 - 254) / (354 - 254)) * 100 + 150);
  if (pm10 <= 424) return Math.round(((pm10 - 354) / (424 - 354)) * 100 + 200);
  return Math.round(((pm10 - 424) / (604 - 424)) * 200 + 300);
};

// Generate hourly forecast data from daily averages
const generateHourlyForecast = (dailyData: any[], hours: number = 24): ForecastDataPoint[] => {
  const hourlyData: ForecastDataPoint[] = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const forecastTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
    const dayIndex = Math.floor(i / 24);
    const dayData = dailyData[dayIndex] || dailyData[0];
    
    // Add some realistic hourly variation (±20% of daily average)
    const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
    
    hourlyData.push({
      time: forecastTime.toISOString(),
      aqi: Math.round(pm25ToAQI(dayData.pm25.avg * variation)),
      pm25: Math.round(dayData.pm25.avg * variation * 10) / 10,
      pm10: Math.round(dayData.pm10.avg * variation * 10) / 10,
      o3: Math.round(dayData.o3.avg * variation * 10) / 10,
      no2: Math.round((dayData.pm25.avg * variation * 0.8) * 10) / 10, // Estimated
      so2: Math.round((dayData.pm25.avg * variation * 0.3) * 10) / 10, // Estimated
      co: Math.round((dayData.pm25.avg * variation * 0.1) * 10) / 10, // Estimated
    });
  }
  
  return hourlyData;
};

export const useForecast = (city: string = 'delhi', refreshInterval: number = 3600000): UseForecastResult => {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchForecastData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiToken = import.meta.env.VITE_AQI_TOKEN;
      if (!apiToken) {
        throw new Error('VITE_AQI_TOKEN environment variable is not set');
      }

      // Try to fetch forecast data from WAQI API
      const forecastUrl = `https://api.waqi.info/feed/${city}/forecast/?token=${apiToken}`;
      
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: WAQIForecastResponse = await response.json();
      
      if (result.status !== 'ok') {
        throw new Error('API returned error status');
      }

      // Generate hourly forecast from daily data
      const hourlyForecast = generateHourlyForecast(result.data.forecast.daily.pm25, 24);
      
      setForecastData(hourlyForecast);
      setLastUpdated(new Date().toISOString());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch forecast data';
      setError(errorMessage);
      console.error('Error fetching forecast data:', err);
      
      // Fallback: Generate realistic forecast data based on current conditions
      const fallbackData = generateFallbackForecast();
      setForecastData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [city]);

  const refetch = useCallback(() => {
    fetchForecastData();
  }, [fetchForecastData]);

  useEffect(() => {
    // Initial fetch
    fetchForecastData();

    // Set up interval for automatic refresh (every hour)
    const interval = setInterval(fetchForecastData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchForecastData, refreshInterval]);

  return {
    forecastData,
    loading,
    error,
    refetch,
    lastUpdated
  };
};

// Fallback forecast generation when API fails
const generateFallbackForecast = (): ForecastDataPoint[] => {
  const hourlyData: ForecastDataPoint[] = [];
  const now = new Date();
  
  // Generate realistic forecast pattern (higher in morning/evening, lower at night)
  for (let i = 0; i < 24; i++) {
    const forecastTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
    const hour = forecastTime.getHours();
    
    // Base AQI with daily pattern
    let baseAqi = 200;
    if (hour >= 6 && hour <= 10) baseAqi = 280; // Morning rush
    else if (hour >= 18 && hour <= 22) baseAqi = 320; // Evening rush
    else if (hour >= 23 || hour <= 5) baseAqi = 180; // Night time
    
    // Add some randomness
    const variation = 0.9 + Math.random() * 0.2;
    const finalAqi = Math.round(baseAqi * variation);
    
    hourlyData.push({
      time: forecastTime.toISOString(),
      aqi: finalAqi,
      pm25: Math.round((finalAqi / 2.5) * 10) / 10,
      pm10: Math.round((finalAqi / 2.0) * 10) / 10,
      o3: Math.round((finalAqi / 3.0) * 10) / 10,
      no2: Math.round((finalAqi / 4.0) * 10) / 10,
      so2: Math.round((finalAqi / 5.0) * 10) / 10,
      co: Math.round((finalAqi / 6.0) * 10) / 10,
    });
  }
  
  return hourlyData;
};
