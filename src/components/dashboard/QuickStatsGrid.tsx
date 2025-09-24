import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Factory, MapPin, Activity, Clock } from "lucide-react";
import { airQualityData, getAQIStatus } from "@/data/airQualityData";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  icon: React.ReactNode;
  details?: React.ReactNode;
  className?: string;
}

function StatCard({ title, value, subtitle, trend, icon, details, className }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    return trend.direction === "up" ? "text-red-600" : "text-green-600";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardContent className="p-4">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate" title={title}>{title}</p>
              <p className="text-lg font-bold text-foreground">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
            <div className="text-primary flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              {icon}
            </div>
          </div>

          {/* Details area pinned to bottom */}
          {details && (
            <div className="mt-auto pt-3 text-xs text-muted-foreground">
              {details}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickStatsGrid({ className }: { className?: string }) {
  const stats = airQualityData.quickStats;
  const liveAqi = airQualityData.currentAqi.aqi;
  const liveZone = airQualityData.sourceBreakdown?.[0]?.zone ?? "Delhi Central";
  const liveStatus = getAQIStatus(liveAqi).status;
  const liveTimestamp = airQualityData.currentAqi.timestamp;

  const sourcesObj = airQualityData.currentAqi.sources;
  const sourcesSorted = Object.entries(sourcesObj).sort((a, b) => b[1] - a[1]);
  const topTwo = sourcesSorted.slice(0, 2);

  const locations = airQualityData.aqiLocations;
  const avgAqi = Math.round((locations.reduce((sum, loc) => sum + loc.aqi, 0) || 0) / (locations.length || 1));
  const avgStatus = getAQIStatus(avgAqi).status;
  const minLoc = locations.reduce((min, l) => (l.aqi < min.aqi ? l : min), locations[0]);
  const maxLoc = locations.reduce((max, l) => (l.aqi > max.aqi ? l : max), locations[0]);

  const fcAll = airQualityData.forecasts.shortTerm.filter((f) => f.zone === "Delhi Central");
  const fcNext = fcAll.slice(0, 3);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${className}`}>
      {/* Live AQI — Delhi Central */}
      <StatCard
        title={`Live AQI — ${liveZone}`}
        value={`${liveAqi}`}
        subtitle={liveStatus}
        icon={<MapPin className="w-5 h-5" />}
        details={
          <div className="space-y-2">
            {/* AQI scale */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500">
              <div
                className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-sm bg-white shadow"
                style={{ left: `${Math.min(Math.max((liveAqi / 500) * 100, 0), 100)}%` }}
                aria-hidden="true"
              />
            </div>
            {/* Top sources */}
            <div className="flex flex-wrap gap-1.5">
              {topTwo.map(([name, pct]) => (
                <span key={name} className="rounded-full border px-2 py-0.5 text-[11px] bg-secondary text-secondary-foreground">
                  {name.charAt(0).toUpperCase() + name.slice(1)} {pct}%
                </span>
              ))}
            </div>
            {/* Timestamp */}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Updated {new Date(liveTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        }
      />

      {/* Delhi-NCR Average */}
      <StatCard
        title="Delhi-NCR Average"
        value={`${avgAqi}`}
        subtitle={avgStatus}
        icon={<Activity className="w-5 h-5" />}
        details={
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[11px] text-muted-foreground">Best area</div>
                <div className="font-medium text-foreground truncate" title={minLoc.location}>{minLoc.location}</div>
                <div className="text-[11px]">AQI {minLoc.aqi}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Worst area</div>
                <div className="font-medium text-foreground truncate" title={maxLoc.location}>{maxLoc.location}</div>
                <div className="text-[11px]">AQI {maxLoc.aqi}</div>
              </div>
            </div>
            <div className="text-[11px]">Sample size: {locations.length} stations</div>
          </div>
        }
      />

      {/* Dominant Source */}
      <StatCard
        title="Dominant Source"
        value={stats.dominantSource}
        icon={<Factory className="w-5 h-5" />}
        details={
          <div className="space-y-2">
            {sourcesSorted.slice(0, 3).map(([name, pct]) => (
              <div key={name}>
                <div className="flex items-center justify-between">
                  <span className="capitalize">{name}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full rounded bg-muted overflow-hidden">
                  <div className="h-full rounded bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* AQI Trend */}
      <StatCard
        title="AQI Trend"
        value={`${stats.trend.change > 0 ? "+" : ""}${stats.trend.change} points`}
        trend={{
          direction: stats.trend.direction,
          value: `from ${stats.trend.previousAqi}`,
        }}
        icon={<TrendingUp className="w-5 h-5" />}
        details={
          <div className="space-y-1.5">
            {fcNext.map((f) => (
              <div key={f.time} className="flex items-center justify-between">
                <span className="text-[11px]">{new Date(f.time).toLocaleTimeString([], { hour: "2-digit" })}</span>
                <span className="font-medium text-foreground">{f.aqi}</span>
              </div>
            ))}
            <div className="text-[11px]">Zone: Delhi Central</div>
          </div>
        }
      />
    </div>
  );
}
