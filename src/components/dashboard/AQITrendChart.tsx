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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AQITrendChartProps {
  points: HistoryPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  title?: string;
}

export function AQITrendChart({ points, timeRange, onTimeRangeChange, title }: AQITrendChartProps) {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    return {
      labels: points.map((p) => {
        const d = new Date(p.time);
        return d.toLocaleTimeString([], { hour: "2-digit" });
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
  }, [points, t]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "hsl(220, 13%, 91%)" }, ticks: { color: "hsl(220, 9%, 46%)" } },
      y: { beginAtZero: true, max: 500, grid: { color: "hsl(220, 13%, 91%)" }, ticks: { color: "hsl(220, 9%, 46%)" } },
    },
  };

  return (
    <Card className="card-gradient shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{title ?? "AQI Trend"}</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24hr</SelectItem>
              <SelectItem value="3d">Last 3 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}


