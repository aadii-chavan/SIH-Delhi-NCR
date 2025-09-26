import { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, Chart, ActiveElement } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveSourceImpact } from "@/hooks/use-live-source-impact";
import { useLiveAQI } from "@/hooks/use-live-aqi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Activity, AlertCircle, Clock, MapPin } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

export function PollutionSourcesChart({ className }: { className?: string }) {
  const { sources, loading, error, refetch, lastUpdated } = useLiveSourceImpact("delhi");
  const { data: liveAqi, loading: aqiLoading, error: aqiError, refetch: refetchAqi, lastUpdated: aqiLastUpdated } = useLiveAQI("delhi");
  const labels = ["Stubble Burning", "Vehicle Traffic", "Industrial", "Other Sources"];
  const values = sources ? [sources.stubble, sources.traffic, sources.industrial, sources.other] : [0, 0, 0, 0];
  const baseColors = [
    "hsl(25, 95%, 53%)", // stubble
    "hsl(217, 91%, 60%)", // traffic
    "hsl(0, 84%, 60%)",   // industrial
    "hsl(220, 9%, 46%)",  // other
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const bgColors = useMemo(() => {
    if (activeIndex === null) return baseColors.map((c) => c);
    return baseColors.map((c, idx) => (idx === activeIndex ? c : c.replace(/\d+%\)/, "50%)").replace(/\d+\.?\d*\)/, "0.4)")));
  }, [activeIndex]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bgColors,
        borderColor: baseColors.map((c) => c.replace(")", ")")),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: "circle",
          generateLabels: (chart) => {
            const data = chart.data as any;
            const ds = data.datasets[0];
            const total = (ds.data as number[]).reduce((a, b) => a + b, 0);
            return data.labels.map((label: string, i: number) => ({
              text: `${label} — ${Math.round(((ds.data[i] as number) / total) * 100)}%`,
              fillStyle: (ds.backgroundColor as string[])[i],
              strokeStyle: (ds.borderColor as string[])[i],
              index: i,
            }));
          },
        },
        onClick: (evt, legendItem, legend) => {
          const index = legendItem.index as number;
          setActiveIndex((prev) => (prev === index ? null : index));
        },
      },
      tooltip: {
        backgroundColor: "hsl(224, 71%, 4%)",
        titleColor: "hsl(0, 0%, 98%)",
        bodyColor: "hsl(0, 0%, 98%)",
        borderColor: "hsl(217, 91%, 60%)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || "";
            const value = context.parsed as number;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = Math.round((value / total) * 100);
            return `${label}: ${value}% (${pct}%)`;
          },
        },
      },
    },
    cutout: "60%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  // Plugin to render dynamic center text (focused source or dominant)
  const centerText = {
    id: "centerText",
    afterDraw(chart: Chart) {
      const { ctx, chartArea } = chart as any;
      if (!chartArea) return;
      const dataset = chart.data.datasets[0] as any;
      const data: number[] = dataset.data;
      const total = data.reduce((a, b) => a + b, 0);
      const focusIndex = activeIndex ?? data.indexOf(Math.max(...data));
      const label = chart.data.labels?.[focusIndex] as string;
      const value = data[focusIndex];
      const pct = Math.round((value / total) * 100);
      const { left, right, top, bottom } = chartArea;
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "hsl(224, 71%, 4%)";
      ctx.font = "600 16px Plus Jakarta Sans, Inter, system-ui, sans-serif";
      ctx.fillText(`${pct}%`, x, y - 2);
      ctx.fillStyle = "hsl(215, 14%, 35%)";
      ctx.font = "12px Plus Jakarta Sans, Inter, system-ui, sans-serif";
      ctx.fillText(label, x, y + 14);
      ctx.restore();
    },
  } as const;

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
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          Source Impact Analysis (Delhi Only)
          <span className="text-sm font-normal text-muted-foreground">(Live)</span>
        </CardTitle>
        {/* Live AQI Value and Status */}
        <div className="flex items-center gap-2 mt-2">
          {aqiLoading && (
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3 animate-spin" /> Loading AQI...</span>
          )}
          {aqiError && (
            <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> AQI Error</span>
          )}
          {liveAqi && (
            <>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Delhi</span>
              <span className="text-2xl font-bold text-foreground">{liveAqi.aqi}</span>
              <Badge className={`${liveAqi.color} px-2 py-1 text-xs font-medium`} variant="secondary">{liveAqi.status}</Badge>
              {aqiLastUpdated && (
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {formatLastUpdated(aqiLastUpdated)}</span>
              )}
              <Button variant="ghost" size="sm" onClick={refetchAqi} disabled={aqiLoading} className="h-6 w-6 p-0">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Sources updated {formatLastUpdated(lastUpdated)}</span>
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
        <div className="relative h-80">
          {loading && !sources ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Activity className="w-8 h-8 animate-spin mr-2" /> Loading live source data...
            </div>
          ) : (
            <Doughnut
              data={chartData}
              options={options}
              plugins={[centerText]}
              onMouseMove={(evt, elements) => {
                const el = (elements as ActiveElement[])[0];
                setActiveIndex(el ? el.index : null);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            />
          )}
        </div>
        {/* Interactive chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {labels.map((label, idx) => (
            <button
              key={label}
              type="button"
              className={`px-2.5 py-1 rounded-full border text-xs smooth-transition ${activeIndex === idx ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground"}`}
              onClick={() => setActiveIndex((prev) => (prev === idx ? null : idx))}
              aria-pressed={activeIndex === idx}
              disabled={loading || !sources}
            >
              {label}: {values[idx]}%
            </button>
          ))}
        </div>
        {/* Key Insights */}
        {sources && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-800 font-medium">Primary Source</span>
              <span className="text-orange-600 font-bold">Stubble: {sources.stubble}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">Urban Impact</span>
              <span className="text-blue-600 font-bold">Traffic: {sources.traffic}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}