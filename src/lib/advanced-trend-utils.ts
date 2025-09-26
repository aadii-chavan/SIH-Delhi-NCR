import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface TrendAnalysis {
  direction: "up" | "down" | "stable";
  change: number;
  percentage: number;
  averageChange: number;
  volatility: number;
  momentum: number;
  prediction: {
    nextHour: number;
    confidence: number;
    direction: "up" | "down" | "stable";
  };
  insights: string[];
  alerts: Array<{
    type: "warning" | "info" | "success";
    message: string;
  }>;
}

// Enhanced trend calculation with more analytics
export const calculateAdvancedTrend = (history: number[]): TrendAnalysis => {
  if (history.length < 2) {
    return {
      direction: "stable",
      change: 0,
      percentage: 0,
      averageChange: 0,
      volatility: 0,
      momentum: 0,
      prediction: { nextHour: history[0] || 0, confidence: 0, direction: "stable" },
      insights: ["Insufficient data for trend analysis"],
      alerts: []
    };
  }

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const change = latest - previous;
  const percentage = previous !== 0 ? ((change / previous) * 100) : 0;
  
  // Calculate volatility (standard deviation of recent changes)
  const recentChanges = history.slice(-5).map((val, i) => {
    if (i === 0) return 0;
    return val - history[history.length - 5 + i - 1];
  }).slice(1);
  
  const avgChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length;
  const volatility = Math.sqrt(recentChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / recentChanges.length);
  
  // Calculate momentum (rate of change acceleration)
  const momentum = recentChanges.length > 1 ? 
    recentChanges[recentChanges.length - 1] - recentChanges[recentChanges.length - 2] : 0;
  
  // Simple prediction based on recent trend
  const recentTrend = history.slice(-3);
  const trendSlope = recentTrend.length > 1 ? 
    (recentTrend[recentTrend.length - 1] - recentTrend[0]) / (recentTrend.length - 1) : 0;
  
  const nextHourPrediction = latest + trendSlope;
  const predictionConfidence = Math.max(0, Math.min(100, 100 - (volatility * 2))); // Lower volatility = higher confidence
  
  // Generate insights
  const insights: string[] = [];
  const alerts: Array<{ type: "warning" | "info" | "success"; message: string }> = [];
  
  if (Math.abs(percentage) > 10) {
    insights.push(`${Math.abs(percentage).toFixed(1)}% change in the last reading`);
  }
  
  if (volatility > 20) {
    insights.push("High volatility detected - conditions changing rapidly");
    alerts.push({ type: "warning", message: "Air quality is fluctuating significantly" });
  }
  
  if (momentum > 10) {
    insights.push("Accelerating deterioration trend");
    alerts.push({ type: "warning", message: "Air quality worsening rapidly" });
  } else if (momentum < -10) {
    insights.push("Accelerating improvement trend");
    alerts.push({ type: "success", message: "Air quality improving rapidly" });
  }
  
  if (latest > 300) {
    alerts.push({ type: "warning", message: "Very unhealthy air quality levels" });
  } else if (latest < 100) {
    alerts.push({ type: "success", message: "Good air quality conditions" });
  }
  
  if (predictionConfidence > 70) {
    insights.push(`High confidence prediction: ${nextHourPrediction.toFixed(0)} AQI next hour`);
  }
  
  return {
    direction: change > 5 ? "up" : change < -5 ? "down" : "stable",
    change: Math.abs(change),
    percentage: Math.abs(percentage),
    averageChange: Math.abs(avgChange),
    volatility,
    momentum,
    prediction: {
      nextHour: Math.round(nextHourPrediction),
      confidence: Math.round(predictionConfidence),
      direction: trendSlope > 2 ? "up" : trendSlope < -2 ? "down" : "stable"
    },
    insights,
    alerts
  };
};

// Enhanced trend display formatting
export const formatAdvancedTrendDisplay = (trend: TrendAnalysis) => {
  const { change, direction, percentage, volatility, momentum } = trend;
  
  if (direction === "stable") {
    return {
      value: "Stable",
      subtitle: `${change.toFixed(0)} points change`,
      color: "text-gray-600",
      icon: "stable",
      volatility: volatility > 15 ? "High" : volatility > 8 ? "Medium" : "Low"
    };
  }
  
  const changeText = `${change.toFixed(0)} points`;
  const percentageText = percentage > 1 ? ` (${percentage.toFixed(1)}%)` : "";
  const volatilityText = volatility > 15 ? " 🔥" : volatility > 8 ? " ⚡" : "";
  
  return {
    value: `${direction === "up" ? "↗" : "↘"} ${changeText}${percentageText}`,
    subtitle: `${direction === "up" ? "Worsening" : "Improving"}${volatilityText}`,
    color: direction === "up" ? "text-red-600" : "text-green-600",
    icon: direction,
    volatility: volatility > 15 ? "High" : volatility > 8 ? "Medium" : "Low"
  };
};

// Generate trend visualization data
export const generateTrendVisualization = (history: number[]) => {
  if (history.length < 2) return null;
  
  const data = history.slice(-10); // Last 10 readings
  const labels = data.map((_, index) => {
    const time = new Date(Date.now() - (data.length - index - 1) * 5 * 60 * 1000); // 5 min intervals
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });
  
  return {
    labels,
    datasets: [{
      data,
      borderColor: (ctx: any) => {
        const value = ctx.parsed?.y;
        if (value === undefined || value === null) return "#10b981"; // default green
        if (value >= 300) return "#dc2626"; // red
        if (value >= 200) return "#f97316"; // orange
        if (value >= 100) return "#f59e0b"; // yellow
        return "#10b981"; // green
      },
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2
    }]
  };
};
