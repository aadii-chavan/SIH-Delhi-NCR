import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Activity, RefreshCw, MapPin } from "lucide-react";
import { useForecast } from "@/hooks/use-forecast";
import { Spinner } from "@/components/common/Spinner";
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

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

interface LiveForecastSummaryCardProps {
  title?: string;
  city?: string;
  className?: string;
}

export function LiveForecastSummaryCard({ 
  title = "24h Live Forecast", 
  city = "delhi",
  className 
}: LiveForecastSummaryCardProps) {
  const { forecastData, loading, error, refetch, lastUpdated } = useForecast(city);

  if (error && forecastData.length === 0) {
    return (
      <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
            {title}
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
            <span className="text-sm">Failed to load forecast data</span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Use live data if available, otherwise use static data
  const series = forecastData.length > 0 ? forecastData.slice(0, 24) : [];
  const values = series.map((f) => f.aqi);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const first = values.length > 0 ? values[0] : 0;
  const last = values.length > 0 ? values[values.length - 1] : 0;
  const trendingUp = last >= first;

  const peakIndex = values.indexOf(max);
  const peak = series[peakIndex];

  // Critical insights
  const hoursVeryUnhealthy = series.filter((f) => f.aqi >= 300 && f.aqi < 400).length;
  const hoursHazardous = series.filter((f) => f.aqi >= 400).length;
  const firstCross300 = series.find((f) => f.aqi >= 300);
  const firstDropBelow200 = series.find((f) => f.aqi < 200);
  const timeToPeakHrs = peak ? Math.max(0, Math.round((new Date(peak.time).getTime() - new Date(series[0].time).getTime()) / 36e5)) : 0;

  const advisory = (() => {
    if (hoursHazardous > 0) return { text: "Hazardous levels expected — issue public health advisory", tone: "danger" } as const;
    if (hoursVeryUnhealthy > 0) return { text: "Very Unhealthy for several hours — restrict outdoor activity", tone: "warning" } as const;
    if (max >= 200) return { text: "Unhealthy conditions — sensitive groups should limit exposure", tone: "info" } as const;
    return { text: "Moderate outlook — conditions manageable", tone: "neutral" } as const;
  })();

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

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition border-l-4 ${advisory.tone === "danger" ? "border-l-red-500" : advisory.tone === "warning" ? "border-l-orange-500" : advisory.tone === "info" ? "border-l-yellow-500" : "border-l-primary"} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            {title}
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {formatLastUpdated(lastUpdated)}
              </span>
            )}
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
        {/* Alert/advisory banner */}
        <div className={`flex items-start gap-2 rounded-lg border p-3 ${advisory.tone === "danger" ? "bg-red-50 border-red-200" : advisory.tone === "warning" ? "bg-orange-50 border-orange-200" : advisory.tone === "info" ? "bg-yellow-50 border-yellow-200" : "bg-secondary/40"}`}>
          <AlertTriangle className={`w-4 h-4 mt-0.5 ${advisory.tone === "danger" ? "text-red-600" : advisory.tone === "warning" ? "text-orange-600" : advisory.tone === "info" ? "text-yellow-600" : "text-primary"}`} />
          <div className="text-sm">
            <div className="font-medium text-foreground">{advisory.text}</div>
            <div className="text-[11px] text-muted-foreground">
              {peak ? `Peak in ${timeToPeakHrs}h at ${new Date(peak.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Calculating..."} · {hoursVeryUnhealthy}h ≥300 · {hoursHazardous}h ≥400
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && values.length === 0 && (
          <div className="flex items-center justify-center space-x-2 py-8">
            <Spinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading forecast data...</span>
          </div>
        )}

        {/* Key stats */}
        {values.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 bg-secondary/40">
                <div className="text-[11px] text-muted-foreground">Next 24h Range</div>
                <div className="text-lg font-bold text-foreground">{min} – {max}</div>
              </div>
              <div className="rounded-lg border p-3 bg-secondary/40">
                <div className="text-[11px] text-muted-foreground">Expected Peak</div>
                <div className="text-lg font-bold text-foreground">{peak?.aqi || '--'}</div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {peak ? new Date(peak.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : '--'}
                </div>
              </div>
              <div className="rounded-lg border p-3 bg-secondary/40">
                <div className="text-[11px] text-muted-foreground">Trend</div>
                <div className={`flex items-center gap-1 text-lg font-bold ${trendingUp ? "text-red-600" : "text-green-600"}`}>
                  {trendingUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {trendingUp ? "+" : ""}{last - first}
                </div>
                <div className="text-[11px] text-muted-foreground">from {first}</div>
              </div>
            </div>

            {/* Threshold guide */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-green-500" /> 0–100</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-yellow-500" /> 101–200</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-orange-500" /> 201–300</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-red-500" /> 301–500</span>
            </div>

            {/* Line chart (24h AQI trend) */}
            <div className="relative h-40 rounded-lg border bg-accent/40 p-3">
              <Line
                data={{
                  labels: series.map((f) => new Date(f.time).toLocaleTimeString([], { hour: "2-digit" })),
                  datasets: [
                    {
                      data: values,
                      borderColor: "hsl(234 89% 64% / 0.9)",
                      backgroundColor: (ctx) => {
                        const { chart } = ctx;
                        const { ctx: canvasCtx, chartArea } = chart as any;
                        if (!chartArea) return "hsl(234 89% 64% / 0.15)";
                        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, "hsl(234 89% 64% / 0.25)");
                        gradient.addColorStop(1, "hsl(234 89% 64% / 0.02)");
                        return gradient;
                      },
                      fill: true,
                      tension: 0.35,
                      pointRadius: 2,
                      pointHoverRadius: 3,
                      borderWidth: 2,
                      segment: {
                        borderColor: (ctx) => {
                          const v = ctx.p1.parsed.y as number;
                          if (v >= 400) return "#dc2626"; // red-600
                          if (v >= 300) return "#ef4444"; // red-500
                          if (v >= 200) return "#f97316"; // orange-500
                          if (v >= 100) return "#f59e0b"; // yellow-500
                          return "#10b981"; // green-500
                        },
                      },
                    },
                  ],
                }}
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
                        label: (item) => `AQI ${item.parsed.y}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: "hsl(215 14% 35%)", font: { size: 10 } },
                    },
                    y: {
                      min: 0,
                      max: 500,
                      grid: { color: "hsl(215 16% 90% / 0.6)" },
                      ticks: { stepSize: 100, color: "hsl(215 14% 35%)", font: { size: 10 } },
                    },
                  },
                } as ChartOptions<'line'>}
              />
            </div>

            {/* Actions/Notes */}
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="rounded-lg border p-3 bg-secondary/40">
                <div className="text-muted-foreground">Next improvement window</div>
                <div className="font-medium text-foreground">
                  {firstDropBelow200 ? new Date(firstDropBelow200.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "> 24h"}
                </div>
              </div>
              <div className="rounded-lg border p-3 bg-secondary/40">
                <div className="text-muted-foreground">First crossing ≥300</div>
                <div className="font-medium text-foreground">
                  {firstCross300 ? new Date(firstCross300.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "None"}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
