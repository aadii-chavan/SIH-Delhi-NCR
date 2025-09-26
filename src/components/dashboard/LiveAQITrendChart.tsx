import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useLiveAqiHistory } from "@/hooks/use-live-aqi-history";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function getStats(history) {
  if (!history.length) return { min: 0, max: 0, avg: 0, volatility: 0, trend: 'stable', change: 0 };
  const values = history.map((h) => h.aqi);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const volatility = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length);
  const change = values[values.length - 1] - values[0];
  const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
  return { min, max, avg, volatility, trend, change };
}

export function LiveAQITrendChart({ city = "delhi", className }: { city?: string; className?: string }) {
  const { history, loading, error, refetch, lastUpdated } = useLiveAqiHistory(city);
  const stats = useMemo(() => getStats(history), [history]);

  const chartData = useMemo(() => {
    return {
      labels: history.map((h) => new Date(h.time).toLocaleTimeString([], { hour: "2-digit" })),
      datasets: [
        {
          label: "AQI",
          data: history.map((h) => h.aqi),
          borderColor: (ctx) => {
            const v = ctx.parsed?.y;
            if (v >= 300) return "#dc2626";
            if (v >= 200) return "#f97316";
            if (v >= 100) return "#f59e0b";
            return "#10b981";
          },
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    };
  }, [history]);

  const chartOptions: ChartOptions<"line"> = {
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
          label: (item) => `AQI ${item.parsed?.y ?? 'N/A'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "hsl(220, 13%, 91%)" },
        ticks: { color: "hsl(220, 9%, 46%)", font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 500,
        grid: { color: "hsl(220, 13%, 91%)" },
        ticks: { color: "hsl(220, 9%, 46%)", font: { size: 10 } },
      },
    },
  };

  return (
    <Card className={`card-gradient shadow-soft ${className ?? ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> 24h Live AQI Trend
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          )}
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading} className="h-6 w-6 p-0">
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 text-sm mb-2">{error}</div>
        )}
        <div className="h-64">
          {loading && !history.length ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Activity className="w-8 h-8 animate-spin mr-2" /> Loading live trend data...
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
          <div className="rounded-lg border p-2 bg-secondary/40">
            <div className="text-muted-foreground">Min</div>
            <div className="font-bold text-green-700">{stats.min}</div>
          </div>
          <div className="rounded-lg border p-2 bg-secondary/40">
            <div className="text-muted-foreground">Max</div>
            <div className="font-bold text-red-700">{stats.max}</div>
          </div>
          <div className="rounded-lg border p-2 bg-secondary/40">
            <div className="text-muted-foreground">Avg</div>
            <div className="font-bold">{stats.avg}</div>
          </div>
          <div className="rounded-lg border p-2 bg-secondary/40">
            <div className="text-muted-foreground">Volatility</div>
            <div className="font-bold">{stats.volatility.toFixed(1)}</div>
          </div>
        </div>
        {/* Trend Direction */}
        <div className="flex items-center gap-2 mt-2 text-sm">
          {stats.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-600" />}
          {stats.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-600" />}
          <span className={stats.trend === 'up' ? 'text-red-600' : stats.trend === 'down' ? 'text-green-600' : 'text-gray-600'}>
            {stats.trend === 'up' ? `Worsening (+${stats.change})` : stats.trend === 'down' ? `Improving (${stats.change})` : 'Stable'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
