import { useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HistoryPoint, TimeRange } from "@/hooks/use-aqi-history";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getAQIStatus } from "@/data/airQualityData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AQITrendChartProps {
  points: HistoryPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  title?: string;
}

export function AQITrendChart({ points, timeRange, onTimeRangeChange, title }: AQITrendChartProps) {
  const { t } = useLanguage();

  // Compute min, max, and trend
  const minAqi = points.length ? Math.min(...points.map(p => p.aqi)) : 0;
  const maxAqi = points.length ? Math.max(...points.map(p => p.aqi)) : 0;
  const latest = points[points.length - 1];
  const prev = points[points.length - 2];
  const trend = latest && prev ? (latest.aqi > prev.aqi ? "up" : latest.aqi < prev.aqi ? "down" : "flat") : "flat";
  const { status, color } = latest ? getAQIStatus(latest.aqi) : { status: "", color: "" };

  // Improved x-axis labels
  const chartData = useMemo(() => {
    return {
      labels: points.map((p) => {
        const d = new Date(p.time);
        if (timeRange === "6h" || timeRange === "12h" || timeRange === "24h") {
          return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else {
          return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" });
        }
      }),
      datasets: [
        {
          label: t("aqi"),
          data: points.map((p) => p.aqi),
          borderColor: "hsl(217, 91%, 60%)",
          backgroundColor: "hsl(217, 91%, 60% / 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: "hsl(217, 91%, 60%)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [points, t, timeRange]);

  // Enhanced tooltips
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const aqi = context.parsed.y;
            const idx = context.dataIndex;
            const point = points[idx];
            const { status } = getAQIStatus(aqi);
            return `AQI: ${aqi} (${status})\n${new Date(point.time).toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { color: "hsl(220, 13%, 91%)" }, ticks: { color: "hsl(220, 9%, 46%)" } },
      y: { beginAtZero: true, max: 500, grid: { color: "hsl(220, 13%, 91%)" }, ticks: { color: "hsl(220, 9%, 46%)" } },
    },
  };

  return (
    <Card className="card-gradient shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">{title ?? "AQI Trend"}</span>
          {trend === "up" && <TrendingUp className="w-5 h-5 text-red-500" title="Rising" />}
          {trend === "down" && <TrendingDown className="w-5 h-5 text-green-600" title="Improving" />}
          {trend === "flat" && <Minus className="w-5 h-5 text-gray-400" title="Stable" />}
          {latest && (
            <Badge className={`ml-2 ${color}`}>{status}</Badge>
          )}
        </div>
        <div className="flex flex-col items-end text-xs text-muted-foreground">
          <span>Min: <span className="font-bold text-blue-500">{minAqi}</span></span>
          <span>Max: <span className="font-bold text-red-500">{maxAqi}</span></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="flex justify-end mt-2">
          <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Last 6hr</SelectItem>
              <SelectItem value="12h">Last 12hr</SelectItem>
              <SelectItem value="24h">Last 24hr</SelectItem>
              <SelectItem value="3d">Last 3 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}


