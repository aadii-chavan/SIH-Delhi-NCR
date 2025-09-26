import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Factory, MapPin, Clock, Minus } from "lucide-react";
import { airQualityData, getAQIStatus } from "@/data/airQualityData";
import { LiveAQICard } from "./LiveAQICard";
import { InteractiveTrendCard } from "./InteractiveTrendCard";
import { useBackendSourceImpact } from "@/hooks/use-backend-source-impact";

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
    return trend.direction === "up" ? "text-red-600" : 
           trend.direction === "down" ? "text-green-600" : "text-gray-600";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === "up" ? <TrendingUp className="w-3 h-3" /> : 
           trend.direction === "down" ? <TrendingDown className="w-3 h-3" /> : 
           <Minus className="w-3 h-3" />;
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
  const { data: backendData } = useBackendSourceImpact();
  const stats = airQualityData.quickStats;
  
  // Use backend data if available, otherwise fallback to hardcoded data
  const sourcesObj = backendData?.sources || airQualityData.currentAqi.sources;
  const sourcesSorted = Object.entries(sourcesObj).sort((a, b) => b[1] - a[1]);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 ${className}`}>
      {/* Live AQI — Delhi Central */}
      <LiveAQICard city="delhi" />

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

      {/* Interactive AQI Trend */}
      <InteractiveTrendCard city="delhi" />
    </div>
  );
}
