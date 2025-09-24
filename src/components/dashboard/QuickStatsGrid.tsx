import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Factory, MapPin, Activity } from "lucide-react";
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
  className?: string;
}

function StatCard({ title, value, subtitle, trend, icon, className }: StatCardProps) {
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
      </CardContent>
    </Card>
  );
}

export function QuickStatsGrid({ className }: { className?: string }) {
  const stats = airQualityData.quickStats;
  const liveAqi = airQualityData.currentAqi.aqi;
  const liveZone = airQualityData.sourceBreakdown?.[0]?.zone ?? "Delhi Central";
  const liveStatus = getAQIStatus(liveAqi).status;

  const avgAqi = Math.round(
    (airQualityData.aqiLocations.reduce((sum, loc) => sum + loc.aqi, 0) || 0) /
      (airQualityData.aqiLocations.length || 1),
  );
  const avgStatus = getAQIStatus(avgAqi).status;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${className}`}>
      <StatCard
        title={`Live AQI — ${liveZone}`}
        value={`${liveAqi}`}
        subtitle={liveStatus}
        icon={<MapPin className="w-5 h-5" />}
      />

      <StatCard
        title="Delhi-NCR Average"
        value={`${avgAqi}`}
        subtitle={avgStatus}
        icon={<Activity className="w-5 h-5" />}
      />

      <StatCard
        title="Dominant Source"
        value={stats.dominantSource}
        icon={<Factory className="w-5 h-5" />}
      />

      <StatCard
        title="AQI Trend"
        value={`${stats.trend.change > 0 ? "+" : ""}${stats.trend.change} points`}
        trend={{
          direction: stats.trend.direction,
          value: `from ${stats.trend.previousAqi}`,
        }}
        icon={<TrendingUp className="w-5 h-5" />}
      />
    </div>
  );
}
