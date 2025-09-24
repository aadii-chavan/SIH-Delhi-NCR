// Hardcoded air quality data for Delhi-NCR Dashboard
export const airQualityData = {
  currentAqi: {
    timestamp: "2025-09-23T12:00",
    aqi: 250,
    label: "Unhealthy",
    description: "AQI 201-300: Breathing discomfort for most people",
    sources: { stubble: 40, traffic: 30, industrial: 20, other: 10 }
  },
  recommendation: { 
    id: 1, 
    text: "Ban construction activities in Zone X for 48 hours to reduce PM2.5 levels",
    priority: "high" as const,
    estimatedImpact: "15% AQI reduction"
  },
  aqiLocations: [
    { lat: 28.6139, lon: 77.2090, aqi: 250, location: "Connaught Place" },
    { lat: 28.5355, lon: 77.3910, aqi: 270, location: "Noida Sector 18" },
    { lat: 28.4595, lon: 77.0266, aqi: 230, location: "Gurgaon City Center" },
    { lat: 28.7041, lon: 77.1025, aqi: 290, location: "Rohini" },
    { lat: 28.4089, lon: 77.3178, aqi: 240, location: "Faridabad" },
    { lat: 28.9845, lon: 77.7064, aqi: 220, location: "Ghaziabad" }
  ],
  quickStats: {
    trend: { change: 10, direction: "up" as const, previousAqi: 240 },
    dominantSource: "Stubble Burning: 40%",
    lastIntervention: "Odd-Even Policy: AQI reduced by 15%"
  },
  sourceBreakdown: [
    {
      timestamp: "2025-09-23T12:00",
      zone: "Delhi Central",
      sources: { stubble: 40, traffic: 30, industrial: 20, other: 10 }
    },
    {
      timestamp: "2025-09-23T12:00",
      zone: "Noida",
      sources: { stubble: 35, traffic: 35, industrial: 20, other: 10 }
    },
    {
      timestamp: "2025-09-23T12:00",
      zone: "Gurgaon", 
      sources: { stubble: 30, traffic: 40, industrial: 20, other: 10 }
    },
    {
      timestamp: "2025-09-22T12:00",
      zone: "Delhi Central",
      sources: { stubble: 45, traffic: 25, industrial: 20, other: 10 }
    },
    {
      timestamp: "2025-09-22T12:00",
      zone: "Noida",
      sources: { stubble: 38, traffic: 32, industrial: 20, other: 10 }
    }
  ],
  forecasts: {
    shortTerm: [
      { time: "2025-09-24T06:00", aqi: 280, zone: "Delhi Central" },
      { time: "2025-09-24T12:00", aqi: 270, zone: "Delhi Central" },
      { time: "2025-09-24T18:00", aqi: 290, zone: "Delhi Central" },
      { time: "2025-09-25T06:00", aqi: 300, zone: "Delhi Central" },
      { time: "2025-09-25T12:00", aqi: 290, zone: "Delhi Central" },
      { time: "2025-09-25T18:00", aqi: 310, zone: "Delhi Central" },
      { time: "2025-09-26T06:00", aqi: 285, zone: "Delhi Central" },
      { time: "2025-09-26T12:00", aqi: 275, zone: "Delhi Central" }
    ],
    seasonal: {
      winter2025: { 
        avgAqi: 350, 
        zone: "All NCR",
        months: [
          { month: "December 2025", avgAqi: 380 },
          { month: "January 2026", avgAqi: 420 },
          { month: "February 2026", avgAqi: 250 }
        ]
      }
    }
  },
  interventions: [
    {
      name: "Odd-Even Policy",
      start: "2025-01-01",
      end: "2025-01-15", 
      aqiBefore: 300,
      aqiAfter: 255,
      impact: -15,
      description: "Vehicle restriction based on license plate numbers"
    },
    {
      name: "Firecracker Ban",
      start: "2025-11-01",
      end: "2025-11-07",
      aqiBefore: 400,
      aqiAfter: 320,
      impact: -20,
      description: "Complete ban on fireworks during Diwali period"
    },
    {
      name: "Construction Moratorium", 
      start: "2025-12-15",
      end: "2025-12-30",
      aqiBefore: 380,
      aqiAfter: 340,
      impact: -11,
      description: "Temporary halt on all construction activities"
    },
    {
      name: "Industrial Shutdown",
      start: "2025-01-20",
      end: "2025-01-25",
      aqiBefore: 350,
      aqiAfter: 280,
      impact: -20,
      description: "Closure of heavy industries in NCR region"
    }
  ],
  recommendations: [
    { 
      id: 1, 
      text: "Ban construction activities in Zone X for 48 hours",
      priority: "high" as const,
      estimatedImpact: "15% AQI reduction"
    },
    { 
      id: 2, 
      text: "Subsidize stubble removal equipment in Haryana districts",
      priority: "medium" as const,
      estimatedImpact: "25% source reduction"
    },
    { 
      id: 3, 
      text: "Deploy water sprinklers on major NCR highways",
      priority: "high" as const,
      estimatedImpact: "8% AQI reduction"
    }
  ]
};

// Helper function to get AQI status and color
export const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return { status: "Good", level: "good", color: "aqi-good" };
  if (aqi <= 100) return { status: "Moderate", level: "moderate", color: "aqi-moderate" }; 
  if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", level: "unhealthy-sensitive", color: "aqi-moderate" };
  if (aqi <= 200) return { status: "Unhealthy", level: "unhealthy", color: "aqi-unhealthy" };
  if (aqi <= 300) return { status: "Very Unhealthy", level: "very-unhealthy", color: "aqi-severe" };
  return { status: "Hazardous", level: "hazardous", color: "aqi-severe" };
};

// Export types for TypeScript
export type AirQualityData = typeof airQualityData;
export type AQILocation = typeof airQualityData.aqiLocations[0];
export type SourceBreakdown = typeof airQualityData.sourceBreakdown[0];
export type Intervention = typeof airQualityData.interventions[0];
export type Forecast = typeof airQualityData.forecasts.shortTerm[0];
export type Recommendation = typeof airQualityData.recommendations[0];