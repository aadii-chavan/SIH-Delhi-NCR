import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getAQIStatus } from "@/data/airQualityData";

interface AQICardProps {
  aqi: number;
  location: string;
  trend?: {
    change: number;
    direction: "up" | "down" | "stable";
  };
  className?: string;
}

export function AQICard({ aqi, location, trend, className }: AQICardProps) {
  const { status, color } = getAQIStatus(aqi);

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend.direction) {
      case "up":
        return "text-red-600 bg-red-50";
      case "down":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {location}
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              {Math.abs(trend.change)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main AQI Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-1">
              {aqi}
            </div>
            <Badge 
              className={`${color} px-3 py-1 text-sm font-medium`}
              variant="secondary"
            >
              {status}
            </Badge>
          </div>

          {/* AQI Scale Indicator */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              Air Quality Level
            </div>
            <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 w-1 h-full bg-white border border-gray-400 rounded-sm"
                style={{ 
                  left: `${Math.min(Math.max((aqi / 500) * 100, 0), 100)}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Good</span>
              <span>Moderate</span>
              <span>Unhealthy</span>
              <span>500+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}