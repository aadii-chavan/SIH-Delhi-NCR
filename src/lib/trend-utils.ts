// Helper function to calculate trend from AQI history
export const calculateTrend = (history: number[]) => {
  if (history.length < 2) {
    return {
      change: 0,
      direction: "stable" as const,
      percentage: 0,
      averageChange: 0
    };
  }

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const change = latest - previous;
  const percentage = previous !== 0 ? ((change / previous) * 100) : 0;
  
  // Calculate average change over the last few readings
  const recentReadings = history.slice(-5);
  const averageChange = recentReadings.length > 1 
    ? recentReadings.reduce((sum, val, i) => {
        if (i === 0) return 0;
        return sum + (val - recentReadings[i - 1]);
      }, 0) / (recentReadings.length - 1)
    : 0;

  return {
    change: Math.abs(change),
    direction: change > 0 ? "up" as const : change < 0 ? "down" as const : "stable" as const,
    percentage: Math.abs(percentage),
    averageChange: Math.abs(averageChange)
  };
};

// Helper function to format trend display
export const formatTrendDisplay = (trend: ReturnType<typeof calculateTrend>) => {
  const { change, direction, percentage } = trend;
  
  if (direction === "stable") {
    return {
      value: "No change",
      color: "text-gray-600",
      icon: "stable"
    };
  }
  
  const changeText = `${change.toFixed(0)} points`;
  const percentageText = percentage > 1 ? ` (${percentage.toFixed(1)}%)` : "";
  
  return {
    value: `${direction === "up" ? "+" : "-"}${changeText}${percentageText}`,
    color: direction === "up" ? "text-red-600" : "text-green-600",
    icon: direction
  };
};
