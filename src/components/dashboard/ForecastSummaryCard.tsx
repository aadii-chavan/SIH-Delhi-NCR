import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Forecast } from "@/data/airQualityData";
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Activity } from "lucide-react";

interface ForecastSummaryCardProps {
  title?: string;
  forecasts: Forecast[];
  className?: string;
}

export function ForecastSummaryCard({ title = "24h Forecast Summary", forecasts, className }: ForecastSummaryCardProps) {
  const series = forecasts.slice(0, 8);
  const values = series.map((f) => f.aqi);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const trendingUp = last >= first;

  const peakIndex = values.indexOf(max);
  const peak = series[peakIndex];

  // Critical insights
  const hoursVeryUnhealthy = series.filter((f) => f.aqi >= 300 && f.aqi < 400).length;
  const hoursHazardous = series.filter((f) => f.aqi >= 400).length;
  const firstCross300 = series.find((f) => f.aqi >= 300);
  const firstDropBelow200 = series.find((f) => f.aqi < 200);
  const timeToPeakHrs = Math.max(0, Math.round((new Date(peak.time).getTime() - new Date(series[0].time).getTime()) / 36e5));

  const advisory = (() => {
    if (hoursHazardous > 0) return { text: "Hazardous levels expected — issue public health advisory", tone: "danger" } as const;
    if (hoursVeryUnhealthy > 0) return { text: "Very Unhealthy for several hours — restrict outdoor activity", tone: "warning" } as const;
    if (max >= 200) return { text: "Unhealthy conditions — sensitive groups should limit exposure", tone: "info" } as const;
    return { text: "Moderate outlook — conditions manageable", tone: "neutral" } as const;
  })();

  const normalize = (v: number) => {
    // Normalize heights between 30 and 100 based on AQI scale (0-500)
    const pct = Math.max(0, Math.min(1, v / 500));
    return Math.round(30 + pct * 70); // 30% to 100%
  };

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition border-l-4 ${advisory.tone === "danger" ? "border-l-red-500" : advisory.tone === "warning" ? "border-l-orange-500" : advisory.tone === "info" ? "border-l-yellow-500" : "border-l-primary"} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-muted-foreground">Delhi Central</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert/advisory banner */}
        <div className={`flex items-start gap-2 rounded-lg border p-3 ${advisory.tone === "danger" ? "bg-red-50 border-red-200" : advisory.tone === "warning" ? "bg-orange-50 border-orange-200" : advisory.tone === "info" ? "bg-yellow-50 border-yellow-200" : "bg-secondary/40"}`}>
          <AlertTriangle className={`w-4 h-4 mt-0.5 ${advisory.tone === "danger" ? "text-red-600" : advisory.tone === "warning" ? "text-orange-600" : advisory.tone === "info" ? "text-yellow-600" : "text-primary"}`} />
          <div className="text-sm">
            <div className="font-medium text-foreground">{advisory.text}</div>
            <div className="text-[11px] text-muted-foreground">
              Peak in {timeToPeakHrs}h at {new Date(peak.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {hoursVeryUnhealthy}h ≥300 · {hoursHazardous}h ≥400
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 bg-secondary/40">
            <div className="text-[11px] text-muted-foreground">Next 24h Range</div>
            <div className="text-lg font-bold text-foreground">{min} – {max}</div>
          </div>
          <div className="rounded-lg border p-3 bg-secondary/40">
            <div className="text-[11px] text-muted-foreground">Expected Peak</div>
            <div className="text-lg font-bold text-foreground">{peak.aqi}</div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {new Date(peak.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

        {/* Mini bar chart */}
        <div className="mt-2">
          <div className="flex items-end gap-2 h-28 p-3 rounded-lg border bg-accent/40">
            {series.map((f, idx) => {
              const color = f.aqi >= 400 ? "bg-red-600" : f.aqi >= 300 ? "bg-red-500" : f.aqi >= 200 ? "bg-orange-500" : f.aqi >= 100 ? "bg-yellow-500" : "bg-green-500";
              const isPeak = f.time === peak.time;
              return (
                <div key={f.time + idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-6 rounded-md ${color} ${isPeak ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                    style={{ height: `${normalize(f.aqi)}%` }}
                    title={`${new Date(f.time).toLocaleTimeString([], { hour: "2-digit" })} — AQI ${f.aqi}`}
                  />
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(f.time).toLocaleTimeString([], { hour: "2-digit" })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
            <span>500</span>
          </div>
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
      </CardContent>
    </Card>
  );
}


