import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Target
} from "lucide-react";
import { useLiveAQI } from "@/hooks/use-live-aqi";
import { Spinner } from "@/components/common/Spinner";
import { calculateAdvancedTrend, formatAdvancedTrendDisplay, generateTrendVisualization } from "@/lib/advanced-trend-utils";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

interface InteractiveTrendCardProps {
  city?: string;
  className?: string;
}

export function InteractiveTrendCard({ city = "delhi", className }: InteractiveTrendCardProps) {
  const { data: liveData, trendHistory, loading, error, refetch, lastUpdated } = useLiveAQI(city);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate advanced trend analysis
  const trendAnalysis = calculateAdvancedTrend(trendHistory);
  const trendDisplay = formatAdvancedTrendDisplay(trendAnalysis);
  const trendVisualization = generateTrendVisualization(trendHistory);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-3 h-3" />;
      case "info": return <Info className="w-3 h-3" />;
      case "success": return <CheckCircle className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning": return "text-orange-600 bg-orange-50 border-orange-200";
      case "info": return "text-blue-600 bg-blue-50 border-blue-200";
      case "success": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (error && trendHistory.length === 0) {
    return (
      <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Interactive AQI Trend
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Failed to load trend data</span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Interactive AQI Trend
            <Badge variant="outline" className="text-xs">
              {trendDisplay.volatility} Volatility
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {formatLastUpdated(lastUpdated)}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-6 w-6 p-0"
            >
              <BarChart3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Trend Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {trendDisplay.icon === "up" ? <TrendingUp className="w-6 h-6 text-red-600" /> :
             trendDisplay.icon === "down" ? <TrendingDown className="w-6 h-6 text-green-600" /> :
             <Minus className="w-6 h-6 text-gray-600" />}
            <div className="text-2xl font-bold text-foreground">
              {liveData?.aqi || '--'}
            </div>
          </div>
          <div className={`text-sm font-medium ${trendDisplay.color}`}>
            {trendDisplay.value}
          </div>
          <div className="text-xs text-muted-foreground">
            {trendDisplay.subtitle}
          </div>
        </div>

        {/* Alerts */}
        {trendAnalysis.alerts.length > 0 && (
          <div className="space-y-2">
            {trendAnalysis.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${getAlertColor(alert.type)}`}>
                {getAlertIcon(alert.type)}
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trend Visualization Chart */}
        {trendVisualization && trendVisualization.datasets[0].data.length > 0 ? (
          <div className="relative h-32 rounded-lg border bg-accent/40 p-2">
            <Line
              data={trendVisualization}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "hsl(224 71% 4% / 0.95)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    displayColors: false,
                    callbacks: {
                      title: (items) => `Time: ${items[0].label}`,
                      label: (item) => `AQI ${item.parsed?.y || 'N/A'}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "hsl(215 14% 35%)", font: { size: 9 } },
                  },
                  y: {
                    min: Math.max(0, Math.min(...trendVisualization.datasets[0].data) - 20),
                    max: Math.min(500, Math.max(...trendVisualization.datasets[0].data) + 20),
                    grid: { color: "hsl(215 16% 90% / 0.6)" },
                    ticks: { color: "hsl(215 14% 35%)", font: { size: 9 } },
                  },
                },
              } as ChartOptions<'line'>}
            />
          </div>
        ) : (
          <div className="relative h-32 rounded-lg border bg-accent/40 p-2 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Collecting trend data...</div>
              <div className="text-xs">Chart will appear with more readings</div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 bg-secondary/40">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Next Hour Prediction
            </div>
            <div className="text-lg font-bold text-foreground">
              {trendAnalysis.prediction.nextHour}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {trendAnalysis.prediction.confidence}% confidence
            </div>
          </div>
          <div className="rounded-lg border p-3 bg-secondary/40">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Momentum
            </div>
            <div className={`text-lg font-bold ${trendAnalysis.momentum > 0 ? 'text-red-600' : trendAnalysis.momentum < 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {trendAnalysis.momentum > 0 ? '+' : ''}{trendAnalysis.momentum.toFixed(1)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {trendAnalysis.momentum > 5 ? 'Accelerating' : trendAnalysis.momentum < -5 ? 'Decelerating' : 'Stable'}
            </div>
          </div>
        </div>

        {/* Detailed Analytics (Expandable) */}
        {showDetails && (
          <div className="space-y-3 border-t pt-3">
            <div className="text-sm font-medium text-foreground">Detailed Analytics</div>
            
            {/* Volatility Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Volatility Level</span>
                <span className="font-medium">{trendAnalysis.volatility.toFixed(1)}</span>
              </div>
              <Progress 
                value={Math.min(100, (trendAnalysis.volatility / 30) * 100)} 
                className="h-2"
              />
            </div>

            {/* Insights */}
            {trendAnalysis.insights.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Key Insights</div>
                <div className="space-y-1">
                  {trendAnalysis.insights.map((insight, index) => (
                    <div key={index} className="text-xs text-foreground bg-secondary/40 rounded p-2">
                      • {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent History */}
            {trendHistory.length > 1 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Recent Readings</div>
                <div className="grid grid-cols-2 gap-1">
                  {trendHistory.slice(-6).map((aqi, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-secondary/40 rounded p-1">
                      <span>
                        {index === trendHistory.length - 1 ? "Now" : 
                         index === trendHistory.length - 2 ? "-5m" : 
                         `-${(trendHistory.length - index - 1) * 5}m`}
                      </span>
                      <span className="font-medium">{aqi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && trendHistory.length === 0 && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Spinner size="sm" />
            <span className="text-sm text-muted-foreground">Collecting trend data...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
